import React, { useState } from 'react';

const SubscriptionTracker = () => {
  const [subscriptions, setSubscriptions] = useState([
    { name: 'Apple TV+', renewalDate: '2023-05-01', cost: 4.99 },
    { name: 'HBO Max', renewalDate: '2023-05-15', cost: 14.99 },
    { name: 'Google One Storage', renewalDate: '2023-05-20', cost: 1.99 },
    { name: 'Google Cloud Console - Gemini API Credits', renewalDate: '2023-05-25', cost: 20.00 },
    { name: 'Blackbox Pro AI Agent Trial', renewalDate: '2023-05-30', cost: 0.00 },
    { name: 'Spotify', renewalDate: '2023-06-01', cost: 9.99 },
    { name: 'Yulu', renewalDate: '2023-06-10', cost: 25.00 },
    { name: 'Jio Recharge', renewalDate: '2023-06-15', cost: 15.00 },
  ]);

  return (
    <div>
      <h3>Subscription Tracker</h3>
      <ul>
        {subscriptions.map((subscription, index) => (
          <li key={index}>
            {subscription.name} - Renews on {subscription.renewalDate} - Cost: ${subscription.cost}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SubscriptionTracker;
