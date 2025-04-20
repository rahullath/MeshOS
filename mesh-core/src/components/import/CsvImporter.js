import { useState } from 'react';
// import axios from 'axios';

export default function CsvImporter() {
  const [habitsFile, setHabitsFile] = useState(null);
  const [checkmarksFile, setCheckmarksFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleHabitsFileChange = (e) => {
    setHabitsFile(e.target.files[0]);
    setError(null);
  };

  const handleCheckmarksFileChange = (e) => {
    setCheckmarksFile(e.target.files[0]);
    setError(null);
  };

  const handleImport = async () => {
    if (!habitsFile || !checkmarksFile) {
      setError('Please select both Habits and Checkmarks files');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const readCsvFile = (file) => {
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

      const habitsCsvContent = await readCsvFile(habitsFile);
      const checkmarksCsvContent = await readCsvFile(checkmarksFile);

      const response = await axios.post('/api/import/loop-habits', {
        habitsCsv: habitsCsvContent,
        checkmarksCsv: checkmarksCsvContent,
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
      <h2 className="text-lg font-medium mb-4">Import Habits from CSV</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Habits CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleHabitsFileChange}
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
          Select Checkmarks CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCheckmarksFileChange}
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
        disabled={!habitsFile || !checkmarksFile || isLoading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Importing...' : 'Import Habits'}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p>Successfully imported {results.imported} habits!</p>
        </div>
      )}
    </div>
  );
}
