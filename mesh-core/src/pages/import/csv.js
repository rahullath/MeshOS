import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import CsvImporter from '../../components/import/CsvImporter';

export default function CsvImportPage() {
  return (
    <Layout>
      <Head>
        <title>CSV Import | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">CSV Import</h1>
        <CsvImporter />
      </div>
    </Layout>
  );
}
