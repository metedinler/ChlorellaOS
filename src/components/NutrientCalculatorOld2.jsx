import React, { useState } from 'react';
import { Beaker, Calculator, Plus, Settings } from 'lucide-react';

const NutrientCalculator = () => {
  const [selectedMedium, setSelectedMedium] = useState('BBM');
  const [isCustom, setIsCustom] = useState(false);
  const [volume, setVolume] = useState(1);
  const [customFormula, setCustomFormula] = useState([]);
  const [results, setResults] = useState(null);

  // Besin yeri kütüphanesi
  const mediums = {
    BBM: {
      name: 'BBM (Bold Basal Medium)',
      mainStock: [
        { chemical: 'NaNO3', amount: 25, unit: 'g/L', price: 150 },
        { chemical: 'K2HPO4', amount: 7.5, unit: 'g/L', price: 120 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g/L', price: 80 },
        { chemical: 'NaCl', amount: 2.5, unit: 'g/L', price: 20 },
        { chemical: 'KH2PO4', amount: 17.5, unit: 'g/L', price: 130 }
      ],
      caStock: [{ chemical: 'CaCl2·2H2O', amount: 2.5, unit: 'g/L', price: 103 }],
      feStock: [
        { chemical: 'FeSO4·7H2O', amount: 4.98, unit: 'g/L', price: 95 },
        { chemical: 'EDTA', amount: 6.72, unit: 'g/L', price: 250 }
      ],
      usageRatio: { main: 100, ca: 5, fe: 0.1 } // ml stok / L kültür
    },
    BS11: {
      name: 'BS11 (Siyanobakteri için)',
      mainStock: [
        { chemical: 'NaNO3', amount: 15, unit: 'g/L', price: 150 },
        { chemical: 'K2HPO4', amount: 4, unit: 'g/L', price: 120 },
        { chemical: 'MgSO4·7H2O', amount: 7.5, unit: 'g/L', price: 80 }
      ],
      caStock: [{ chemical: 'CaCl2·2H2O', amount: 3.6, unit: 'g/L', price: 103 }],
      feStock: [
        { chemical: 'Ferric ammonium citrate', amount: 6, unit: 'g/L', price: 180 }
      ],
      usageRatio: { main: 100, ca: 5, fe: 0.1 }
    },
    JAWORSKI: {
      name: 'Jaworski (A+B+C)',
      mainStock: [
        { chemical: 'Ca(NO3)2·4H2O', amount: 10, unit: 'g/L', price: 110 },
        { chemical: 'KNO3', amount: 20, unit: 'g/L', price: 95 },
        { chemical: 'MgSO4·7H2O', amount: 10, unit: 'g/L', price: 80 }
      ],
      caStock: [{ chemical: 'K2HPO4', amount: 10, unit: 'g/L', price: 120 }],
      feStock: [
        { chemical: 'FeSO4·7H2O', amount: 0.7, unit: 'g/L', price: 95 },
        { chemical: 'EDTA', amount: 0.93, unit: 'g/L', price: 250 }
      ],
      usageRatio: { main: 20, ca: 10, fe: 0.1 }
    },
    CUSTOM: {
      name: 'Özel Formülasyon',
      mainStock: [],
      caStock: [],
      feStock: [],
      usageRatio: { main: 100, ca: 5, fe: 0.1 }
    }
  };

  // Özel formülasyona kimyasal ekle
  const addCustomChemical = (stockType) => {
    setCustomFormula([...customFormula, {
      id: Date.now(),
      stockType,
      chemical: '',
      amount: 0,
      unit: 'g/L',
      price: 0
    }]);
  };

  // Özel kimyasal güncelle
  const updateCustomChemical = (id, field, value) => {
    setCustomFormula(customFormula.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Özel kimyasal sil
  const removeCustomChemical = (id) => {
    setCustomFormula(customFormula.filter(item => item.id !== id));
  };

  // Kullanım oranı güncelle
  const updateUsageRatio = (field, value) => {
    mediums.CUSTOM.usageRatio[field] = parseFloat(value);
  };

  // Hesaplama
  const calculateNutrients = () => {
    const medium = selectedMedium === 'CUSTOM' && customFormula.length > 0
      ? {
          ...mediums.CUSTOM,
          mainStock: customFormula.filter(c => c.stockType === 'main'),
          caStock: customFormula.filter(c => c.stockType === 'ca'),
          feStock: customFormula.filter(c => c.stockType === 'fe')
        }
      : mediums[selectedMedium];

    const vol = parseFloat(volume);
    const ratio = medium.usageRatio;

    // Ana stok hesapla
    const mainStockMl = vol * ratio.main;
    const mainStockCost = medium.mainStock.reduce((sum, comp) => 
      sum + (comp.amount * comp.price / 1000), 0);

    // Ca stok hesapla
    const caStockMl = vol * ratio.ca;
    const caStockCost = medium.caStock.reduce((sum, comp) =>
      sum + (comp.amount * comp.price / 1000), 0);

    // Fe stok hesapla
    const feStockMl = vol * ratio.fe;
    const feStockCost = medium.feStock.reduce((sum, comp) =>
      sum + (comp.amount * comp.price / 1000), 0);

    // Toplam maliyet
    const totalCost = (mainStockCost * (mainStockMl / 1000)) +
                      (caStockCost * (caStockMl / 1000)) +
                      (feStockCost * (feStockMl / 1000));

    setResults({
      volume: vol,
      medium: medium.name,
      mainStock: {
        amount: mainStockMl.toFixed(1),
        components: medium.mainStock,
        cost: (mainStockCost * (mainStockMl / 1000)).toFixed(2)
      },
      caStock: {
        amount: caStockMl.toFixed(1),
        components: medium.caStock,
        cost: (caStockCost * (caStockMl / 1000)).toFixed(2)
      },
      feStock: {
        amount: feStockMl.toFixed(1),
        components: medium.feStock,
        cost: (feStockCost * (feStockMl / 1000)).toFixed(2)
      },
      totalCost: totalCost.toFixed(2)
    });
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <Beaker className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Besin Yeri Hesaplama</h2>
            <p className="text-green-100">Hangi besin yerini kullanacağınızı seçin veya özel formülasyon oluşturun</p>
          </div>
        </div>
      </div>

      {/* Besin Yeri Seçimi */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Besin Yeri Seçimi
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.keys(mediums).map(key => (
            <button
              key={key}
              onClick={() => {
                setSelectedMedium(key);
                setIsCustom(key === 'CUSTOM');
              }}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                selectedMedium === key
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mediums[key].name}
            </button>
          ))}
        </div>

        {/* Özel Formülasyon */}
        {isCustom && (
          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-3">Özel Kimyasal Ekle</h4>
            
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => addCustomChemical('main')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ana Stok
              </button>
              <button
                onClick={() => addCustomChemical('ca')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ca Stok
              </button>
              <button
                onClick={() => addCustomChemical('fe')}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Fe Stok
              </button>
            </div>

            {/* Kimyasal Listesi */}
            {customFormula.map(item => (
              <div key={item.id} className="grid grid-cols-5 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Kimyasal adı"
                  value={item.chemical}
                  onChange={(e) => updateCustomChemical(item.id, 'chemical', e.target.value)}
                  className="col-span-2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Miktar"
                  value={item.amount}
                  onChange={(e) => updateCustomChemical(item.id, 'amount', parseFloat(e.target.value))}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Fiyat (₺/kg)"
                  value={item.price}
                  onChange={(e) => updateCustomChemical(item.id, 'price', parseFloat(e.target.value))}
                  className="px-3 py-2 border rounded-lg"
                />
                <button
                  onClick={() => removeCustomChemical(item.id)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Sil
                </button>
              </div>
            ))}

            {/* Kullanım Oranları */}
            <div className="grid grid-cols-3 gap-4 mt-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Ana Stok (ml/L)</label>
                <input
                  type="number"
                  defaultValue={100}
                  onChange={(e) => updateUsageRatio('main', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ca Stok (ml/L)</label>
                <input
                  type="number"
                  defaultValue={5}
                  onChange={(e) => updateUsageRatio('ca', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fe Stok (ml/L)</label>
                <input
                  type="number"
                  step="0.1"
                  defaultValue={0.1}
                  onChange={(e) => updateUsageRatio('fe', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Hacim Girişi */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Kültür Hacmi (L)</label>
          <input
            type="number"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={calculateNutrients}
          className="w-full mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          Hesapla
        </button>
      </div>

      {/* Sonuçlar */}
      {results && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Hesaplama Sonuçları</h3>
          
          <div className="bg-emerald-50 p-4 rounded-lg mb-4">
            <p className="text-lg"><strong>Besin Yeri:</strong> {results.medium}</p>
            <p className="text-lg"><strong>Hacim:</strong> {results.volume} L</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">Toplam Maliyet: {results.totalCost} ₺</p>
          </div>

          {/* Ana Stok */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Ana Stok: {results.mainStock.amount} ml</h4>
            <div className="bg-blue-50 p-3 rounded-lg">
              {results.mainStock.components.map((comp, idx) => (
                <p key={idx} className="text-sm">{comp.chemical}: {comp.amount} {comp.unit}</p>
              ))}
              <p className="font-bold mt-2">Maliyet: {results.mainStock.cost} ₺</p>
            </div>
          </div>

          {/* Ca Stok */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Ca Stok: {results.caStock.amount} ml</h4>
            <div className="bg-purple-50 p-3 rounded-lg">
              {results.caStock.components.map((comp, idx) => (
                <p key={idx} className="text-sm">{comp.chemical}: {comp.amount} {comp.unit}</p>
              ))}
              <p className="font-bold mt-2">Maliyet: {results.caStock.cost} ₺</p>
            </div>
          </div>

          {/* Fe Stok */}
          <div>
            <h4 className="font-semibold mb-2">Fe Stok: {results.feStock.amount} ml</h4>
            <div className="bg-orange-50 p-3 rounded-lg">
              {results.feStock.components.map((comp, idx) => (
                <p key={idx} className="text-sm">{comp.chemical}: {comp.amount} {comp.unit}</p>
              ))}
              <p className="font-bold mt-2">Maliyet: {results.feStock.cost} ₺</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutrientCalculator;
