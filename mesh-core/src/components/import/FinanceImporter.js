import { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

export default function FinanceImporter() {
  const [bankStatementFile, setBankStatementFile] = useState(null);
  const [cryptoHoldingsFile, setCryptoHoldingsFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleBankStatementFileChange = (e) => {
    setBankStatementFile(e.target.files[0]);
    setError(null);
  };

  const handleCryptoHoldingsFileChange = (e) => {
    setCryptoHoldingsFile(e.target.files[0]);
    setError(null);
  };

  const handleImport = async () => {
    if (!bankStatementFile || !cryptoHoldingsFile) {
      setError('Please select both Bank Statement and Crypto Holdings files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const readTextFile = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result);
          };
          reader.onerror = (e) => {
            reject(e);
          };
          reader.readAsText(file);
        });
      };

      const bankStatementCsvContent = await readTextFile(bankStatementFile);
      const cryptoHoldingsTxtContent = await readTextFile(cryptoHoldingsFile);

      // Parse and pre-process the CSV to ensure valid dates
      const parsedBankStatement = Papa.parse(bankStatementCsvContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim()
      });

      // Check for parsing errors
      if (parsedBankStatement.errors && parsedBankStatement.errors.length > 0) {
        console.error("CSV parsing errors:", parsedBankStatement.errors);
        setError('Error parsing the bank statement CSV. Please check the format.');
        setIsLoading(false);
        return;
      }

      // Process the data and confirm date format before sending
      const processedData = parsedBankStatement.data.map(row => {
        // Example of handling various date formats
        let dateValue = null;
        if (row.Date) {
          // Try various date formats - DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD
          const dateParts = row.Date.split(/[-/]/);
          if (dateParts.length === 3) {
            // Assuming DD-MM-YYYY format
            if (dateParts[0].length === 2 && dateParts[1].length === 2 && dateParts[2].length === 4) {
              dateValue = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
            } else {
              // Try to parse as is
              dateValue = row.Date;
            }
          } else {
            dateValue = row.Date;
          }
        }

        return {
          ...row,
          _processedDate: dateValue
        };
      });

      // Send the pre-processed data to the server
      const userId = "6809d8c606c9ec803ca83ed3"; // Replace with actual userId or make dynamic

      const response = await axios.post('/api/import/finance', {
        bankStatementCsv: bankStatementCsvContent,
        cryptoHoldingsTxt: cryptoHoldingsTxtContent,
        userId: userId,
        dateFormat: 'DD-MM-YYYY' // Explicitly telling the server what format to expect
      });

      setResults(response.data);
    } catch (err) {
      console.error('Import error:', err);
      setError(err.response?.data?.message || 'Error importing file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Import Finance Data</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Bank Statement CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleBankStatementFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Crypto Holdings Text File
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleCryptoHoldingsFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleImport}
        disabled={!bankStatementFile || !cryptoHoldingsFile || isLoading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Importing...' : 'Import Finance Data'}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p>Successfully imported finance data!</p>
        </div>
      )}
    </div>
  );
}