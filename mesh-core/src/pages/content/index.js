import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import WatchedList from '../../components/content/WatchedList';
import Recommendations from '../../components/content/Recommendations';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ContentPage() {
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatched = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/content/watched'); // Replace with your actual API endpoint
        setWatched(response.data);
      } catch (err) {
        console.error('Error fetching watched content:', err);
        setError('Failed to load watched content.');
      } finally {
        setLoading(false);
      }
    };

    fetchWatched();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Content | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Dashboard</h1>
        {loading ? (
          <div>Loading content data...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <WatchedList watched={watched} />
            <Recommendations watched={watched} />
          </>
        )}
      </div>
    </Layout>
  );
}
