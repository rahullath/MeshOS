import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../../../components/layout/Layout';
import Head from 'next/head';

export default function TaskDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTask = async () => {
      try {
        const response = await axios.get(`/api/tasks/${id}`);
        setTask(response.data);
      } catch (err) {
        console.error('Error fetching task:', err);
        setError('Failed to load task details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  if (error) {
    return <Layout>Error: {error}</Layout>;
  }

  if (!task) {
    return <Layout>Task not found</Layout>;
  }

  return (
    <Layout>
       <Head>
        <title>{task.title} | Mesh OS</title>
      </Head>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      {/* Display other task details here */}
    </Layout>
  );
}
