import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeftRight } from 'react-bootstrap-icons';
import './CurrencyConverter.scss';

interface CurrencyConverterProps {}

const CurrencyConverter: React.FC<CurrencyConverterProps> = () => {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('EUR');
  const [toCurrency, setToCurrency] = useState<string>('USD');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [invertConversion, setInvertConversion] = useState<boolean>(false);
  const [debouncedAmount, setDebouncedAmount] = useState<number | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const apiKey = 'fca_live_NQmjYwYwNh1sG5wp0CJ5Vixf06wieqKkHoYotHhy';

  useEffect(() => {
    axios
      .get(`https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}`)
      .then(response => {
        const currenciesData = response.data;
        if (currenciesData && Object.keys(currenciesData).length > 0) {
          setCurrencies(Object.keys(currenciesData.data));
        } else {
          console.error('Error fetching currencies: currenciesData is undefined, null, or empty');
        }
      })
      .catch(error => {
        console.error('Error fetching currencies:', error);
      });
  }, [apiKey]);

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeoutId = setTimeout(() => {
      setDebouncedAmount(amount);
    }, 1000); // 1000 ms (1 segundo)

    setTypingTimeout(timeoutId);
  }, [amount]);

  useEffect(() => {
    if (debouncedAmount !== null) {
      handleConvert();
    }
  }, [debouncedAmount, fromCurrency, toCurrency, invertConversion]);

  const handleConvert = () => {
    axios
      .get(
        `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=${toCurrency}&base_currency=${fromCurrency}`
      )
      .then(async response => {
        const conversionRate = await response.data.data[toCurrency];
        if (conversionRate !== undefined) {
          const result = (debouncedAmount! * conversionRate).toFixed(2);
          setConvertedAmount(Number(result));
        } else {
          console.error(`Error converting currencies: Conversion rate not found`);
        }
      })
      .catch(error => {
        console.error('Error converting currencies:', error);
      });
  };

  const invertConversionFunc = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    handleConvert();
    setInvertConversion(!invertConversion);
  };

  return (
    <div className="currency-converter">
      <h1 className="currency-converter__header">CURRENCY CONVERTER</h1>
      <div className="currency-converter__content-container">
        <div className="currency-converter__input-container amount">
          <label className="currency-converter__input-container__label">AMOUNT</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="currency-converter__input-container__input"
          />
        </div>
        <div className={`currency-converter__input-container ${!invertConversion ? "from" : "to"}`}>
          <label className="currency-converter__input-container__label">FROM</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="currency-converter__input-container__select"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => invertConversionFunc()}
          className="currency-converter__invert-button"
        >
          <ArrowLeftRight></ArrowLeftRight>
        </button>
        <div className={`currency-converter__input-container ${!invertConversion ? "to" : "from"}`}>
          <label className="currency-converter__input-container__label">TO</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="currency-converter__input-container__select"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        {convertedAmount !== null && (
          <div className="currency-converter__input-container result">
            <p className="currency-converter__input-container__result-text">
              {convertedAmount} {toCurrency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
