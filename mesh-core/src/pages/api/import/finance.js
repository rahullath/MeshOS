// mesh-core/src/pages/api/import/finance.js
// Assuming this route handles importing finance data for the authenticated user.
import connectToDatabase from '../../../lib/mongodb';
import withAuth from '../../../middleware/withAuth';
// Assuming relevant models exist, e.g., FinanceTransaction
import FinanceTransaction from '../../../models/FinanceTransaction';

// Fix the finance import API to accept the correct format
const handler = async (req, res) => {
  await connectToDatabase();
  const userId = req.userId;

  const { bankStatementCsv, cryptoHoldingsTxt } = req.body;

  if (!bankStatementCsv || !cryptoHoldingsTxt) {
    return res.status(400).json({ success: false, message: 'Both bankStatementCsv and cryptoHoldingsTxt are required' });
  }

  try {
    // Parse the CSV using PapaParse
    const parsedCsv = Papa.parse(bankStatementCsv, { header: true, skipEmptyLines: true });
    
    if (parsedCsv.errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Error parsing CSV', errors: parsedCsv.errors });
    }
    
    const transactions = parsedCsv.data.map(row => ({
      userId,
      date: new Date(row.Date || row.date),
      description: row.Description || row.description,
      amount: parseFloat(row.Amount || row.amount),
      type: parseFloat(row.Amount || row.amount) >= 0 ? 'income' : 'expense',
      category: row.Category || row.category || 'uncategorized'
    }));

    // Parse the crypto holdings
    const cryptoLines = cryptoHoldingsTxt.split('\n').filter(line => line.trim());
    const cryptoHoldings = cryptoLines.map(line => {
      const [name, amount] = line.split(',').map(item => item.trim());
      return {
        userId,
        name,
        symbol: name.slice(0, 3).toUpperCase(),
        quantity: parseFloat(amount)
      };
    });

    // Insert into database
    await FinanceTransaction.insertMany(transactions);
    await CryptoHolding.insertMany(cryptoHoldings);

    res.status(200).json({ 
      success: true, 
      message: 'Finance data imported successfully',
      imported: {
        transactions: transactions.length,
        cryptoHoldings: cryptoHoldings.length
      }
    });
  } catch (error) {
    console.error('Finance import error:', error);
    res.status(500).json({ success: false, message: 'Error importing finance data', error: error.message });
  }
};

export default withAuth(handler);
