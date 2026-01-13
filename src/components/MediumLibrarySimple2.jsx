import React, { useState } from 'react';

const MediumLibrarySimple2 = () => {
  const [selectedMedium, setSelectedMedium] = useState('BBM');

  // Direkt burada tanımlıyoruz - import hatası olmasın
  const mediums = {
    BBM: { name: 'BBM (Bold Basal Medium)', description: 'Chlorella vulgaris için standart' },
    BS11: { name: 'BS11', description: 'Synechococcus için' },
    JAWORSKI: { name: 'Jaworski', description: 'Genel amaçlı' },
    FACHB: { name: 'FACHB', description: 'Çin standart ortamı' },
    ZARROUK: { name: 'Zarrouk', description: 'Spirulina için' },
    CUSTOM_BBM: { name: 'Custom BBM', description: 'Modifiye BBM' }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🧪 Besin Yeri Kütüphanesi</h2>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.keys(mediums).map(key => (
          <button
            key={key}
            onClick={() => setSelectedMedium(key)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedMedium === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2">{mediums[selectedMedium].name}</h3>
        <p className="text-gray-600">{mediums[selectedMedium].description}</p>
      </div>
    </div>
  );
};

export default MediumLibrarySimple2;
