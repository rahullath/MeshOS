import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import TransactionList from '../../components/finance/TransactionList';
import ExpenseCategories from '../../components/finance/ExpenseCategories';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FinancePage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/finance'); // Replace with your actual API endpoint
        setTransactions(response.data);
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
        <title>Finance | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Finance Overview</h1>
        {loading ? (
          <div>Loading finance data...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <TransactionList transactions={transactions} />
            <ExpenseCategories transactions={transactions} />
          </>
        )}
      </div>
    </Layout>
  );
}
