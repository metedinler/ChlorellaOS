import React, { useState } from 'react';
import { Beaker, Calculator } from 'lucide-react';
import { bbmFormulas, tankSystem } from '../data/systemData';

const NutrientCalculator = () => {
  const [selectedTank, setSelectedTank] = useState('');
  const [volume, setVolume] = useState(1);
  const [results, setResults] = useState(null);

  const calculateNutrients = () => {
    const vol = parseFloat(volume);
    
    // Hacime göre uygun stok formülünü seç
    const stockFormula = vol <= 2 ? bbmFormulas.stockA_1L : bbmFormulas.stockB_5L;
    
    // Ana stok hesapla
    const mainStockMl = vol * (vol <= 2 ? 100 : 20);
    const mainStockCost = stockFormula.components.reduce((sum, comp) => {
      return sum + (comp.amount * comp.pricePerKg / 1000);
    }, 0);
    
    // Ca stok hesapla
    const caStockMl = vol * 5;
    const caStockCost = (0.75 * 103) / 1000;
    
    // Fe stok hesapla
    const feStockMl = vol * 0.1;
    const feStockCost = bbmFormulas.feStock.components.reduce((sum, comp) => {
      return sum + (comp.amount * comp.pricePerKg / 1000);
    }, 0);
    
    // Toplam maliyet
    const totalCost = (mainStockCost * (mainStockMl / (vol <= 2 ? 100 : 20))) + 
                      (caStockCost * (caStockMl / 5)) + 
                      (feStockCost * (feStockMl / 0.1));
    
    setResults({
      volume: vol,
      mainStock: {
        name: stockFormula.name,
        amount: mainStockMl.toFixed(1),
        unit: 'ml',
        components: stockFormula.components,
        costPerBatch: mainStockCost.toFixed(2)
      },
      caStock: {
        name: 'Ca Stok',
        amount: caStockMl.toFixed(1),
        unit: 'ml',
        costPerBatch: caStockCost.toFixed(2)
      },
      feStock: {
        name: 'Fe Stok',
        amount: feStockMl.toFixed(1),
        unit: 'ml',
        costPerBatch: feStockCost.toFixed(2)
      },
      totalCost: totalCost.toFixed(2),
      costPerLiter: (totalCost / vol).toFixed(3)
    });
  };

  const getTankOptions = () => {
    const options = [];
    Object.entries(tankSystem).forEach(([category, types]) => {
      Object.entries(types).forEach(([key, tank]) => {
        if (tank.tanks) {
          tank.tanks.forEach(tankId => {
            options.push({ id: tankId, volume: tank.volume, type: tank.type });
          });
        } else {
          for (let i = 1; i <= tank.count; i++) {
            options.push({ 
              id: `${key}${i}`, 
              volume: tank.volume, 
              type: tank.type 
            });
          }
        }
      });
    });
    return options;
  };

  const handleTankSelect = (tankId) => {
    setSelectedTank(tankId);
    const tank = getTankOptions().find(t => t.id === tankId);
    if (tank) {
      setVolume(tank.volume);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Beaker className="w-6 h-6 text-emerald-600" />
        Besin Yeri Hazırlama Hesaplayıcısı
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tank Seçimi (Opsiyonel)
          </label>
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={selectedTank}
            onChange={(e) => handleTankSelect(e.target.value)}
          >
            <option value="">Manuel hacim gir</option>
            {getTankOptions().map(tank => (
              <option key={tank.id} value={tank.id}>
                {tank.id} ({tank.volume}L - {tank.type})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hacim (Litre)
          </label>
          <input
            type="number"
            step="0.1"
            className="w-full px-4 py-2 border rounded-lg"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
        </div>
      </div>
      
      <button
        onClick={calculateNutrients}
        className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        Besin Yeri Hesapla
      </button>
      
      {results && (
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">
              📊 {results.volume}L İçin Besin Yeri Tarifi
            </h3>
            
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border-l-4 border-emerald-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800">{results.mainStock.name}</span>
                  <span className="text-emerald-600 font-bold">{results.mainStock.amount} {results.mainStock.unit}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  {results.mainStock.components.map((comp, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{comp.name}</span>
                      <span>{comp.amount}g</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{results.caStock.name}</span>
                  <span className="text-blue-600 font-bold">{results.caStock.amount} {results.caStock.unit}</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border-l-4 border-amber-500">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">{results.feStock.name}</span>
                  <span className="text-amber-600 font-bold">{results.feStock.amount} {results.feStock.unit}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-600">Toplam Maliyet</div>
                <div className="text-2xl font-bold text-gray-800">{results.totalCost} ₺</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Litre Başı Maliyet</div>
                <div className="text-2xl font-bold text-emerald-600">{results.costPerLiter} ₺/L</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-gray-700">
              💡 <strong>Not:</strong> Stok solüsyonlarını önceden hazırlayın. Ana Stok ve Ca Stok'u ayrı ayrı saklayın. 
              Fe Stok'u karanlık şişede muhafaza edin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutrientCalculator;
