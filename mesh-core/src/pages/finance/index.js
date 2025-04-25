import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // No transactions loaded yet - will connect to API in future
        setTransactions([]);
        
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Finance | MeshOS</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Finance Overview</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading finance data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Transactions Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Transactions</h2>
              {transactions.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.slice(0, 5).map((transaction, index) => (
                    <li key={index} className="py-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                        <p className={`text-sm font-medium ${transaction.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {transaction.type === 'expense' ? '-' : '+'}{transaction.amount}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No transactions found. Import some data to get started!</p>
              )}
              <div className="mt-4">
                <a href="/import/finance" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Import transactions
                </a>
              </div>
            </div>
            
            {/* Crypto Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Crypto Portfolio</h2>
              <p className="text-gray-500 dark:text-gray-400">Track your cryptocurrency investments.</p>
              <div className="mt-4">
                <a href="/finance/crypto" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block">
                  View Portfolio
                </a>
              </div>
            </div>
            
            {/* Subscriptions Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Subscriptions</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Apple TV+</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">$4.99/month</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">HBO Max</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">$14.99/month</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-gray-700 dark:text-gray-300">Spotify</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">$9.99/month</p>
                </div>
              </div>
              <div className="mt-4">
                <a href="/finance/subscriptions" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Manage subscriptions
                </a>
              </div>
            </div>
            
            {/* Import Section */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Import Financial Data</h2>
              <p className="text-gray-500 dark:text-gray-400">Import data from bank statements and other sources.</p>
              <div className="mt-4">
                <a href="/import/finance" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block">
                  Import Data
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
