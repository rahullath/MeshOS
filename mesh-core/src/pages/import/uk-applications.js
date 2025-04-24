import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import UkApplicationImporter from '../../components/import/UkApplicationImporter';

export default function UkApplicationImportPage() {
  return (
    <Layout>
      <Head>
        <title>UK Application Import | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">UK Application Import</h1>
        <UkApplicationImporter />
      </div>
    </Layout>
  );
}
