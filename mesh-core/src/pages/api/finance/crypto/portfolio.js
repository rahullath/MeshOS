// src/pages/api/finance/crypto/portfolio.js - Get crypto portfolio summary
import dbConnect from '../../../../lib/mongodb';
import CryptoHolding from '../../../../models/CryptoHolding';
import withAuth from '../../../../middleware/withAuth';
import axios from 'axios';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get all holdings
      const holdings = await CryptoHolding.find({});
      
      // If no holdings, return empty portfolio
      if (holdings.length === 0) {
        return res.status(200).json({
          totalValue: 0,
          holdings: [],
          breakdown: []
        });
      }
      
      // Get list of unique symbols
      const symbols = [...new Set(holdings.map(h => h.symbol))];
      
      // Get current prices using CoinGecko API (or any crypto price API)
      let priceData = {};
      try {
        const symbolsList = symbols.join(',');
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsList}&vs_currencies=usd`
        );
        priceData = response.data;
      } catch (priceError) {
        console.error('Error fetching crypto prices:', priceError);
        // Continue with zero prices if API fails
      }
      
      // Calculate values and enrich holdings
      let totalValue = 0;
      const enrichedHoldings = holdings.map(holding => {
        const currentPrice = priceData[holding.symbol.toLowerCase()]?.usd || 0;
        const value = holding.quantity * currentPrice;
        totalValue += value;
        
        return {
          ...holding.toObject(),
          currentPrice,
          value,
          profitLoss: holding.purchasePrice ? value - (holding.quantity * holding.purchasePrice) : null,
          profitLossPercentage: holding.purchasePrice ? ((currentPrice - holding.purchasePrice) / holding.purchasePrice) * 100 : null
        };
      });
      
      // Create breakdown by coin
      const breakdown = symbols.map(symbol => {
        const coinHoldings = enrichedHoldings.filter(h => h.symbol === symbol);
        const totalQuantity = coinHoldings.reduce((sum, h) => sum + h.quantity, 0);
        const totalCoinValue = coinHoldings.reduce((sum, h) => sum + h.value, 0);
        const percentageOfPortfolio = totalValue > 0 ? (totalCoinValue / totalValue) * 100 : 0;
        
        return {
          symbol,
          name: coinHoldings[0].name,
          totalQuantity,
          totalValue: totalCoinValue,
          percentageOfPortfolio
        };
      }).sort((a, b) => b.totalValue - a.totalValue);
      
      res.status(200).json({
        totalValue,
        holdings: enrichedHoldings,
        breakdown
      });
    } catch (error) {
      console.error('Error generating crypto portfolio:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
