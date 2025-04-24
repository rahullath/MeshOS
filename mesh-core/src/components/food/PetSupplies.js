import React, { useState } from 'react';

const PetSupplies = () => {
  const [supplies, setSupplies] = useState({
    litter: { name: 'Petcrux Smart Litter 5kg', quantity: 2, unit: 'bags' },
    foodWet: { name: 'Royal Canin Hair & Skin Care Wet Chicken in Gravy', quantity: 30, unit: 'packets' },
    foodDry: { name: 'Carniwel Ocean Fish, or Fish Shrimp Krill', quantity: 3, unit: 'kgs' },
    treats: { name: 'Treats - Temptations, Sheba', quantity: 1, unit: 'pack' },
    catnip: { name: 'Catnip, Matatabi Sticks', quantity: 1, unit: 'pack' },
    medicines: { name: 'Medicines - Gabapentin, Deworming Tablet, Tick Spot on', quantity: 1, unit: 'set' },
    toys: { name: 'Toys', quantity: 5, unit: 'items' },
  });

  return (
    <div>
      <h3>Pet Supplies</h3>
      <ul>
        <li>{supplies.litter.name} - {supplies.litter.quantity} {supplies.litter.unit}</li>
        <li>{supplies.foodWet.name} - {supplies.foodWet.quantity} {supplies.foodWet.unit}</li>
        <li>{supplies.foodDry.name} - {supplies.foodDry.quantity} {supplies.foodDry.unit}</li>
        <li>{supplies.treats.name} - {supplies.treats.quantity} {supplies.treats.unit}</li>
        <li>{supplies.catnip.name} - {supplies.catnip.quantity} {supplies.catnip.unit}</li>
        <li>{supplies.medicines.name} - {supplies.medicines.quantity} {supplies.medicines.unit}</li>
        <li>{supplies.toys.name} - {supplies.toys.quantity} {supplies.toys.unit}</li>
      </ul>
    </div>
  );
};

export default PetSupplies;
