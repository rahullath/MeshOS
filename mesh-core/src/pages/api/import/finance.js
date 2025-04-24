import dbConnect from '../../../lib/mongodb';
import FinanceTransaction from '../../../models/FinanceTransaction';
import CryptoHolding from '../../../models/CryptoHolding';
import Papa from 'papaparse';
import moment from 'moment';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { bankStatementCsv, cryptoHoldingsTxt, userId } = req.body;

      // Process bank statement CSV
      const parsedBankStatement = Papa.parse(bankStatementCsv, { header: true, skipEmptyLines: true });

      if (parsedBankStatement.errors.length > 0) {
        console.error('Bank statement CSV parsing errors:', parsedBankStatement.errors);
        return res.status(400).json({ message: 'Error parsing bankStatementCsv' });
      }

      const transactions = parsedBankStatement.data.map(row => {
        console.log("Date string:", row.Date);
        const date = moment(row.Date, 'DD-MM-YYYY').toDate();
        return {
          date: date,
          description: row.Particulars || 'N/A',
          type: row.Withdrawals ? 'expense' : 'income',
          amount: parseFloat(row.Withdrawals || row.Deposits) || 0,
          currency: 'INR',
          userId: userId
        };
      });

      await FinanceTransaction.insertMany(transactions);

      // Process crypto holdings text
      const cryptoHoldingsLines = cryptoHoldingsTxt.split('\\n');
      const holdings = [];

      for (const line of cryptoHoldingsLines) {
         if (line.includes('USDC (Base)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'USDC (Base)',
            symbol: 'USDC',
            quantity,
            purchasePrice: value / quantity,
            quantity,
            value
          });
        } else if (line.includes('TRX (Tron)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'TRX (Tron)',
            symbol: 'TRX',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('SOL (Polygon)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'SOL (Polygon)',
            symbol: 'SOL',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('ETH (Base)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'ETH (Base)',
            symbol: 'ETH',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('WBTC (Arbitrum)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'WBTC (Arbitrum)',
            symbol: 'WBTC',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('WBTC (Polygon)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'WBTC (Polygon)',
            symbol: 'WBTC',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('OM (Polygon)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'OM (Polygon)',
            symbol: 'OM',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('POL (Polygon)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'POL (Polygon)',
            symbol: 'POL',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('USDC (Polygon)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'USDC (Polygon)',
            symbol: 'USDC',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('AIDOGE (Arbitrum)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
           holdings.push({
            name: 'AIDOGE (Arbitrum)',
            symbol: 'AIDOGE',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        } else if (line.includes('ETH (Arbitrum)')) {
          let quantity = parseFloat(line.match(/Quantity: ([\d\.]+)/)[1]);
          let value = parseFloat(line.match(/Value: \$([\d\.]+)/)[1]);
          holdings.push({
            name: 'ETH (Arbitrum)',
            symbol: 'ETH',
            quantity,
            purchasePrice: value / quantity,
            value
          });
        }
      }

      await CryptoHolding.insertMany(holdings);

      res.status(200).json({ message: 'Finance data imported successfully' });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
