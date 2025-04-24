import React from 'react';

const PetCare = () => {
  const catName = 'Marshall';
  const catBirthday = 'October 2nd 2022';

  return (
    <div>
      <h3>Pet Care - {catName}</h3>
      <p>Birthday: {catBirthday}</p>
      {/* Add pet care UI elements here */}
    </div>
  );
};

export default PetCare;
