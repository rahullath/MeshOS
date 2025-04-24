import React, { useState, useEffect } from 'react';

const CoinPerformance = () => {
  const [coinData, setCoinData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.CMC_API_KEY;
        const response = await fetch(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
          {
            headers: {
              'X-CMC_PRO_API_KEY': apiKey,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCoinData(data);
      } catch (error) {
        console.error('Error fetching coin data:', error);
        setError('Failed to load coin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, []);

  return (
    <div>
      <h3>Coin Performance</h3>
      {loading ? (
        <div>Loading coin data...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div>
          {/* Display coin performance data here */}
        </div>
      )}
    </div>
  );
};

export default CoinPerformance;
