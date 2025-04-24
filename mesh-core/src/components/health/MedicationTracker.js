import React, { useState } from 'react';

const MedicationTracker = () => {
  const [medications, setMedications] = useState([
    { name: 'Bupropion XL 150', time: 'Morning', taken: false },
    { name: 'Bupropion XL 150', time: 'Afternoon', taken: false },
    { name: 'Melatonin', time: 'Evening', taken: false },
  ]);
  const [multivitaminTaken, setMultivitaminTaken] = useState(false);

  const handleMedicationTaken = (index) => {
    const updatedMedications = [...medications];
    updatedMedications[index].taken = !updatedMedications[index].taken;
    setMedications(updatedMedications);
  };

  const handleMultivitaminTaken = () => {
    setMultivitaminTaken(!multivitaminTaken);
  };

  return (
    <div>
      <h3>Medication Tracker</h3>
      <ul>
        {medications.map((medication, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={medication.taken}
                onChange={() => handleMedicationTaken(index)}
              />
              {medication.name} - {medication.time}
            </label>
          </li>
        ))}
      </ul>
      <div>
        <label>
          <input
            type="checkbox"
            checked={multivitaminTaken}
            onChange={handleMultivitaminTaken}
          />
          Multivitamin (Optional)
        </label>
      </div>
    </div>
  );
};

export default MedicationTracker;
