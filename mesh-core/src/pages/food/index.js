import Head from 'next/head';
import Layout from '../../components/layout/Layout';

export default function FoodPage() {
  return (
    <Layout>
      <Head>
        <title>Food | MeshOS</title>
      </Head>
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Food Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Meal Planner */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Meal Planner</h2>
            <p className="text-gray-500 dark:text-gray-400">Plan your meals for the week to maintain a healthy diet.</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Meal Plan</button>
            </div>
          </div>
          
          {/* Grocery Inventory */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Grocery Inventory</h2>
            <p className="text-gray-500 dark:text-gray-400">Keep track of what food items you have at home.</p>
            <div className="mt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Manage Inventory</button>
            </div>
          </div>
          
          {/* Pet Care */}
          <div className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Pet Care - Marshall</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-2">Birthday: October 2nd 2022</p>
            
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mt-4 mb-2">Pet Supplies</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Petcrux Smart Litter 5kg - 2 bags</li>
              <li>• Royal Canin Hair & Skin Care Wet Chicken in Gravy - 30 packets</li>
              <li>• Carniwel Ocean Fish, or Fish Shrimp Krill - 3 kgs</li>
              <li>• Treats - Temptations, Sheba - 1 pack</li>
              <li>• Catnip, Matatabi Sticks - 1 pack</li>
              <li>• Medicines - Gabapentin, Deworming Tablet, Tick Spot on - 1 set</li>
              <li>• Toys - 5 items</li>
            </ul>
            
            <div className="mt-4 flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Supply</button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                Log Feeding
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
