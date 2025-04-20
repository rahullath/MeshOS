import { useState } from 'react';
import axios from 'axios';

export default function HealthImporter() {
  const [heartrateFile, setHeartrateFile] = useState(null);
  const [sleepFile, setSleepFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleHeartrateFileChange = (e) => {
    setHeartrateFile(e.target.files[0]);
    setError(null);
  };

  const handleSleepFileChange = (e) => {
    setSleepFile(e.target.files[0]);
    setError(null);
  };

  const handleImport = async () => {
    if (!heartrateFile || !sleepFile) {
      setError('Please select both Heartrate and Sleep files');
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

      const heartrateTxtContent = await readTextFile(heartrateFile);
      const sleepTxtContent = await readTextFile(sleepFile);

      const response = await axios.post('/api/import/health', {
        heartrateTxt: heartrateTxtContent,
        sleepTxt: sleepTxtContent,
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
      <h2 className="text-lg font-medium mb-4">Import Health Data</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Heartrate Text File
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleHeartrateFileChange}
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
          Select Sleep Text File
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleSleepFileChange}
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
        disabled={!heartrateFile || !sleepFile || isLoading}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Importing...' : 'Import Health Data'}
      </button>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {results && (
        <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          <p>Successfully imported health data!</p>
        </div>
      )}
    </div>
  );
}
