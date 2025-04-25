import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import FinanceTransaction from '../../../models/FinanceTransaction';
import CryptoHolding from '../../../models/CryptoHolding';
import Papa from 'papaparse';
import moment from 'moment';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { bankStatementCsv, cryptoHoldingsTxt, userId, dateFormat = 'DD-MM-YYYY' } = req.body;

      // Process bank statement CSV
      const parsedBankStatement = Papa.parse(bankStatementCsv, { 
        header: true, 
        skipEmptyLines: true,
        transformHeader: header => header.trim()
      });

      if (parsedBankStatement.errors.length > 0) {
        console.error('Bank statement CSV parsing errors:', parsedBankStatement.errors);
        return res.status(400).json({ message: 'Error parsing bankStatementCsv' });
      }

      // For debugging
      console.log("Sample row from CSV:", parsedBankStatement.data[0]);

      const transactions = [];
      for (const row of parsedBankStatement.data) {
        try {
          // Try parsing date with moment using the specified format
          let date;
          if (row.Date) {
            date = moment(row.Date, dateFormat);
            if (!date.isValid()) {
              // Try alternative formats
              date = moment(row.Date, ['MM-DD-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']);
            }
            
            // Skip this row if date is still invalid
            if (!date.isValid()) {
              console.warn('Invalid date format found:', row.Date);
              continue;
            }
          } else {
            // Skip rows without a date
            continue;
          }

          // Create transaction object
          const transaction = {
            date: date.toDate(),
            description: row.Particulars || row.Description || row.Narration || 'N/A',
            type: parseFloat(row.Withdrawals || row.Debit || 0) > 0 ? 'expense' : 'income',
            amount: parseFloat(row.Withdrawals || row.Debit || row.Deposits || row.Credit || 0),
            currency: 'INR', // Could be made dynamic based on the file
            userId: userId
          };
          
          transactions.push(transaction);
        } catch (err) {
          console.error('Error processing row:', row, err);
          // Continue with next row rather than failing the entire import
        }
      }

      if (transactions.length === 0) {
        return res.status(400).json({ message: 'No valid transactions found in the CSV' });
      }

      // Insert valid transactions
      await FinanceTransaction.insertMany(transactions);

      // Process crypto holdings text - handle different line endings
      const cryptoHoldingsLines = cryptoHoldingsTxt.split(/[\r\n]+/).filter(line => line.trim() !== '');
      const holdings = [];

      // Extract crypto holdings data
      for (let i = 0; i < cryptoHoldingsLines.length; i++) {
        try {
          const line = cryptoHoldingsLines[i];
          
          // Check for known crypto patterns
          if (line.includes('Quantity:') && line.includes('Value:')) {
            // Extract crypto name from previous line if possible
            let name = 'Unknown';
            let symbol = 'UNKNOWN';
            
            // Look for name and symbol in current line or surrounding lines
            if (line.match(/(.+) \((.+)\)/)) {
              const matches = line.match(/(.+) \((.+)\)/);
              name = matches[1].trim();
              symbol = matches[2].trim();
            } else if (i > 0 && cryptoHoldingsLines[i-1].match(/(\d+)\. (.+) \((.+)\)/)) {
              const matches = cryptoHoldingsLines[i-1].match(/(\d+)\. (.+) \((.+)\)/);
              name = matches[2].trim();
              symbol = matches[3].trim();
            }
            
            // Extract quantity and value
            const quantityMatch = line.match(/Quantity: ([\d\.\,]+)/);
            const valueMatch = line.match(/Value: \$([\d\.\,]+)/);
            
            if (quantityMatch && valueMatch) {
              const quantity = parseFloat(quantityMatch[1].replace(/,/g, ''));
              const value = parseFloat(valueMatch[1].replace(/,/g, ''));
              
              holdings.push({
                userId,
                name,
                symbol,
                quantity,
                purchasePrice: value / quantity,
                notes: `Imported on ${new Date().toISOString().split('T')[0]}`
              });
            }
          }
        } catch (err) {
          console.error('Error processing crypto line:', cryptoHoldingsLines[i], err);
          // Continue with next line
        }
      }

      // Insert crypto holdings if any were found
      if (holdings.length > 0) {
        await CryptoHolding.insertMany(holdings);
      }

      res.status(200).json({ 
        message: 'Finance data imported successfully',
        transactionsImported: transactions.length,
        holdingsImported: holdings.length
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
