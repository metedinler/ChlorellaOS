import React, { useState } from 'react';
import { Flask, Beaker, Calculator } from 'lucide-react';
import { mediumLibrary } from '../data/systemDataExtended';

const MediumLibrarySimple = () => {
  const [selectedMedium, setSelectedMedium] = useState('BBM');
  const [targetVolume, setTargetVolume] = useState(1000);

  const medium = mediumLibrary[selectedMedium];
  if (!medium) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🧪 Besin Yeri Kütüphanesi</h2>
        <p className="text-blue-100">6 Standart Besin Ortamı Formülasyonu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol: Besin Yeri Seçimi */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Besin Ortamı Seç</h3>
            <div className="space-y-2">
              {Object.keys(mediumLibrary).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedMedium(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    selectedMedium === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <p className="font-semibold">{mediumLibrary[key].name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Hacim (L)</label>
            <input
              type="number"
              value={targetVolume}
              onChange={(e) => setTargetVolume(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sağ: Detaylar */}
        <div className="lg:col-span-3 space-y-6">
          {/* Açıklama */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{medium.name}</h3>
            <p className="text-gray-600 mb-4">{medium.description}</p>
            <div className="flex gap-2 flex-wrap">
              {medium.targetSpecies.map((species, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {species}
                </span>
              ))}
            </div>
          </div>

          {/* Ana Stok */}
          {medium.mainStock && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Beaker className="w-5 h-5 text-blue-600" />
                {medium.mainStock.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Stok Hacim: {medium.mainStock.stockVolume}ml | 
                Dozaj: {medium.mainStock.dosage.amount}{medium.mainStock.dosage.unit}/{medium.mainStock.dosage.per}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Kimyasal</th>
                      <th className="px-4 py-2 text-right text-sm font-semibold">Miktar</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">MW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medium.mainStock.components.map((comp, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{comp.chemical}</td>
                        <td className="px-4 py-2 text-right">{comp.amount} {comp.unit}</td>
                        <td className="px-4 py-2">{comp.mw}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mikro Stok */}
          {medium.microStock && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flask className="w-5 h-5 text-purple-600" />
                {medium.microStock.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Stok Hacim: {medium.microStock.stockVolume}ml | 
                Dozaj: {medium.microStock.dosage.amount}{medium.microStock.dosage.unit}/{medium.microStock.dosage.per}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Kimyasal</th>
                      <th className="px-3 py-2 text-right">Miktar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medium.microStock.components.map((comp, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-3 py-2">{comp.chemical}</td>
                        <td className="px-3 py-2 text-right">{comp.amount} {comp.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Element Analizi */}
          {medium.elementalComposition && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-orange-600" />
                Elementel Kompozisyon
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(medium.elementalComposition).map(([element, value]) => (
                  <div key={element} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600">{element}</p>
                    <p className="text-lg font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediumLibrarySimple;
