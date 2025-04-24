import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import HealthImporter from '../../components/import/HealthImporter';

export default function HealthImportPage() {
  return (
    <Layout>
      <Head>
        <title>Health Import | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Health Import</h1>
        <HealthImporter />
      </div>
    </Layout>
  );
}
