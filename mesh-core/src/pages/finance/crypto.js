import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import CryptoPortfolio from '../../components/finance/CryptoPortfolio';
import CoinPerformance from '../../components/finance/CoinPerformance';

export default function CryptoDashboard() {
  return (
    <Layout>
      <Head>
        <title>Crypto Portfolio | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Crypto Portfolio</h1>
        <CryptoPortfolio />
        <CoinPerformance />
      </div>
    </Layout>
  );
}
