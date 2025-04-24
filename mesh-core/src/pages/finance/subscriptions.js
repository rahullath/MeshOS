import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import SubscriptionTracker from '../../components/finance/SubscriptionTracker';
import RenewalAlerts from '../../components/finance/RenewalAlerts';

export default function SubscriptionsPage() {
  return (
    <Layout>
      <Head>
        <title>Subscriptions | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
        <SubscriptionTracker />
        <RenewalAlerts />
      </div>
    </Layout>
  );
}
