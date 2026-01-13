import React, { useState } from 'react';
import { Flask, Beaker, AlertCircle, CheckCircle, TrendingUp, Calculator } from 'lucide-react';
import { mediumLibrary, materialInventory } from '../data/systemDataExtended';

const MediumLibrary = () => {
  const [selectedMedium, setSelectedMedium] = useState('BBM');
  const [targetVolume, setTargetVolume] = useState(1000);
  const [showElementAnalysis, setShowElementAnalysis] = useState(false);

  const medium = mediumLibrary[selectedMedium];

  // Eksik malzeme kontrolü
  const checkMissingMaterials = () => {
    const required = [];
    const missing = [];
    
    // Ana stok bileşenleri
    if (medium.mainStock) {
      medium.mainStock.components.forEach(comp => {
        const material = materialInventory.find(m => 
          m.name.toLowerCase().includes(comp.chemical.split('·')[0].toLowerCase())
        );
        
        if (material && material.currentStock > 0) {
          required.push({ ...comp, available: true, stock: material.currentStock });
        } else {
          required.push({ ...comp, available: false, stock: 0 });
          missing.push(comp.chemical);
        }
      });
    }

    // Mikro stok
    if (medium.microStock) {
      medium.microStock.components.forEach(comp => {
        const material = materialInventory.find(m => 
          m.name.toLowerCase().includes(comp.chemical.split('·')[0].toLowerCase())
        );
        
        if (material && material.currentStock > 0) {
          required.push({ ...comp, available: true, stock: material.currentStock });
        } else {
          required.push({ ...comp, available: false, stock: 0 });
          missing.push(comp.chemical);
        }
      });
    }

    return { required, missing };
  };

  const { required, missing } = checkMissingMaterials();

  // Stok hesaplama
  const calculateStockRequirements = () => {
    const results = [];
    
    if (medium.mainStock) {
      const stockVol = medium.mainStock.stockVolume;
      const dosage = medium.mainStock.dosage;
      const stocksNeeded = Math.ceil(targetVolume / 1000 * (dosage.amount / dosage.per.replace('L', '').replace('medium', '').trim()));
      
      results.push({
        name: medium.mainStock.name,
        stockVolume: stockVol,
        stocksNeeded,
        totalStockVolume: stocksNeeded * stockVol,
        components: medium.mainStock.components.map(comp => ({
          ...comp,
          totalAmount: (comp.amount * stocksNeeded).toFixed(2)
        }))
      });
    }

    if (medium.microStock) {
      const stockVol = medium.microStock.stockVolume;
      const dosage = medium.microStock.dosage;
      const stocksNeeded = Math.ceil(targetVolume / 1000);
      
      results.push({
        name: medium.microStock.name,
        stockVolume: stockVol,
        stocksNeeded,
        totalStockVolume: stocksNeeded * stockVol,
        components: medium.microStock.components.map(comp => ({
          ...comp,
          totalAmount: (comp.amount * stocksNeeded).toFixed(2)
        }))
      });
    }

    return results;
  };

  const stockRequirements = calculateStockRequirements();

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🧪 Besin Yeri Kütüphanesi</h2>
        <p className="text-teal-100">6 Standart Formülasyon - Elementel Analiz - Eksik Malzeme Kontrolü</p>
      </div>

      {/* Besin Yeri Seçimi */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.keys(mediumLibrary).map(key => (
          <button
            key={key}
            onClick={() => setSelectedMedium(key)}
            className={`p-4 rounded-xl font-semibold transition ${
              selectedMedium === key
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:shadow-md'
            }`}
          >
            <div className="text-sm">{mediumLibrary[key].name}</div>
            <div className="text-xs opacity-75 mt-1">{key}</div>
          </button>
        ))}
      </div>

      {/* Seçili Besin Yeri Detayları */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Genel Bilgi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{medium.name}</h3>
                <p className="text-gray-600 mt-1">{medium.description}</p>
              </div>
              <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold">
                pH {medium.finalPH}
              </span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Hedef Türler:</p>
              <div className="flex flex-wrap gap-2">
                {medium.targetSpecies.map(species => (
                  <span key={species} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700">
                    {species}
                  </span>
                ))}
              </div>
            </div>

            {medium.notes && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Not:</strong> {medium.notes}
                </p>
              </div>
            )}
          </div>

          {/* Stok Hazırlama */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Flask className="w-5 h-5 text-teal-600" />
              Stok Çözelti Hazırlama
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hedef Hacim (Ortam)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="1000"
                />
                <span className="px-4 py-2 bg-gray-100 rounded-lg">Litre</span>
              </div>
            </div>

            <div className="space-y-4">
              {stockRequirements.map((stock, idx) => (
                <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800">{stock.name}</h4>
                    <span className="text-sm bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
                      {stock.stocksNeeded} adet x {stock.stockVolume}ml
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-3 py-2 text-left">Kimyasal</th>
                        <th className="px-3 py-2 text-right">Her Stok</th>
                        <th className="px-3 py-2 text-right">Toplam</th>
                        <th className="px-3 py-2 text-center">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock.components.map((comp, i) => {
                        const material = required.find(r => r.chemical === comp.chemical);
                        return (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{comp.chemical}</td>
                            <td className="px-3 py-2 text-right">{comp.amount}g</td>
                            <td className="px-3 py-2 text-right font-semibold">{comp.totalAmount}g</td>
                            <td className="px-3 py-2 text-center">
                              {material?.available ? (
                                <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600 mx-auto" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Elementel Analiz */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Beaker className="w-5 h-5 text-purple-600" />
                Elementel Kompozisyon
              </h3>
              <button
                onClick={() => setShowElementAnalysis(!showElementAnalysis)}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
                {showElementAnalysis ? 'Gizle' : 'Göster'}
              </button>
            </div>

            {showElementAnalysis && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(medium.elementalComposition).map(([element, value]) => (
                  <div key={element} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{element}</div>
                    <div className="text-sm text-gray-600 mt-1">{value} mg/L</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Eksik Malzeme Kontrolü */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              Malzeme Durumu
            </h3>

            {missing.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-semibold">Tüm Malzemeler Mevcut!</p>
                <p className="text-green-600 text-sm mt-1">Bu besin yerini hazırlayabilirsiniz</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 font-semibold">Eksik Malzemeler</p>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {missing.map(m => (
                      <li key={m}>• {m}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-semibold text-sm mb-2">Alınması Gerekenler:</p>
                  {stockRequirements.map(stock => (
                    <div key={stock.name} className="mt-2">
                      <p className="text-xs text-blue-600 font-semibold">{stock.name}:</p>
                      <ul className="text-xs text-blue-700 space-y-1 mt-1">
                        {stock.components
                          .filter(c => missing.includes(c.chemical))
                          .map(c => (
                            <li key={c.chemical}>
                              • {c.chemical}: <strong>{c.totalAmount}g</strong>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Maliyet Tahmini
            </h3>

            <div className="space-y-3">
              {stockRequirements.map((stock, idx) => {
                const cost = stock.components.reduce((sum, comp) => {
                  const material = materialInventory.find(m => 
                    m.name.toLowerCase().includes(comp.chemical.split('·')[0].toLowerCase())
                  );
                  const price = material?.unitPrice || 0;
                  return sum + (parseFloat(comp.totalAmount) / 1000 * price);
                }, 0);

                return (
                  <div key={idx} className="border-b pb-2">
                    <p className="text-sm text-gray-600">{stock.name}</p>
                    <p className="text-lg font-bold text-gray-800">{cost.toFixed(2)} ₺</p>
                  </div>
                );
              })}

              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-3 text-white mt-4">
                <p className="text-sm opacity-90">Toplam Maliyet ({targetVolume}L için)</p>
                <p className="text-2xl font-bold">
                  {stockRequirements.reduce((sum, stock) => {
                    const cost = stock.components.reduce((s, comp) => {
                      const material = materialInventory.find(m => 
                        m.name.toLowerCase().includes(comp.chemical.split('·')[0].toLowerCase())
                      );
                      const price = material?.unitPrice || 0;
                      return s + (parseFloat(comp.totalAmount) / 1000 * price);
                    }, 0);
                    return sum + cost;
                  }, 0).toFixed(2)} ₺
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Litre başı: {(stockRequirements.reduce((sum, stock) => {
                    const cost = stock.components.reduce((s, comp) => {
                      const material = materialInventory.find(m => 
                        m.name.toLowerCase().includes(comp.chemical.split('·')[0].toLowerCase())
                      );
                      const price = material?.unitPrice || 0;
                      return s + (parseFloat(comp.totalAmount) / 1000 * price);
                    }, 0);
                    return sum + cost;
                  }, 0) / targetVolume).toFixed(3)} ₺/L
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediumLibrary;
