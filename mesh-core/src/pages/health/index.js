import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import HealthMetrics from '../../components/health/HealthMetrics';
import HealthCharts from '../../components/health/HealthCharts';
import SleepTracker from '../../components/health/SleepTracker';
import SleepChart from '../../components/health/SleepChart';
import SleepImporter from '../../components/health/SleepImporter';
import MedicationTracker from '../../components/health/MedicationTracker';
import Reminders from '../../components/health/Reminders';
import MedicationSchedule from '../../components/health/MedicationSchedule';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HealthPage() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/health'); // Replace with your actual API endpoint
        setHealthData(response.data);
      } catch (err) {
        console.error('Error fetching health data:', err);
        setError('Failed to load health data.');
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  return (
    <Layout>
      <Head>
        <title>Health | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Health Overview</h1>
        {loading ? (
          <div>Loading health data...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <HealthMetrics healthData={healthData} />
            <HealthCharts healthData={healthData} />
            <SleepTracker />
            <SleepChart />
            <SleepImporter />
            <MedicationTracker />
            <Reminders />
            <MedicationSchedule />
          </>
        )}
      </div>
    </Layout>
  );
}
