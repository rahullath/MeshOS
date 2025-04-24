import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import HabitList from '../../components/habits/HabitList';
import { useEffect, useState } from 'react';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    const fetchHabits = async () => {
      const response = await fetch('/api/habits');
      const data = await response.json();
      setHabits(data);
    };

    fetchHabits();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Habits | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Habits</h1>
        <HabitList habits={habits} />
      </div>
    </Layout>
  );
}
