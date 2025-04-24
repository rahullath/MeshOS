import Layout from '../../components/layout/Layout';
import Head from 'next/head';
import MealPlanner from '../../components/food/MealPlanner';
import GroceryInventory from '../../components/food/GroceryInventory';

import PetSupplies from '../../components/food/PetSupplies';

export default function FoodPage() {
  return (
    <Layout>
      <Head>
        <title>Food | Mesh OS</title>
      </Head>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Food Dashboard</h1>
        <MealPlanner />
        <GroceryInventory />
        <PetCare />
        <PetSupplies />
      </div>
    </Layout>
  );
}
