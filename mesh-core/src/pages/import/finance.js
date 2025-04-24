import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import FinanceImporter from '../../components/import/FinanceImporter';

export default function FinanceImportPage() {
  return (
    <Layout>
      <Head>
        <title>Finance Import | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Finance Import</h1>
        <FinanceImporter />
      </div>
    </Layout>
  );
}
