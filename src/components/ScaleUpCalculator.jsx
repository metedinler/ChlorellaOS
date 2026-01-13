import React, { useState } from 'react';
import { 
  calculateScaleUpNutrients, 
  calculateResidue,
  detectPHCrisis,
  calculateRescueFeed 
} from '../utils/stoichiometryEngine.js';
import { calculateRecipeComposition, analyzeNPRatio } from '../data/chemicalDatabase.js';

const ScaleUpCalculator = () => {
  const [mode, setMode] = useState('HYBRID');  // AUTO, MANUAL, HYBRID
  const [oldVolume, setOldVolume] = useState(1);
  const [newVolume, setNewVolume] = useState(5);
  const [oldTDS, setOldTDS] = useState(600);
  const [targetTDS, setTargetTDS] = useState(800);
  const [measurements, setMeasurements] = useState({
    TAN: '',  // Total Ammonia Nitrogen (mg/L)
    TP: '',   // Total Phosphorus (mg/L)
    pH: '',
    cellDensity: ''
  });
  const [recipe, setRecipe] = useState('custom');  // custom, bbm, bg11
  const [result, setResult] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Önceden tanımlı reçeteler
  const predefinedRecipes = {
    custom: [
      { name: "Üre", mass: 1.5 },
      { name: "MKP (Monopotasyum Fosfat)", mass: 0.75 },
      { name: "Magnezyum Sülfat", mass: 1.2 },
      { name: "Sodyum Karbonat", mass: 1.0 },
      { name: "Kalsiyum Klorür", mass: 0.025 },
      { name: "Demir Sülfat", mass: 0.005 }
    ],
    customV2: [  // V2.0 - pH krizi çözümü
      { name: "Üre", mass: 1.5 },
      { name: "MKP (Monopotasyum Fosfat)", mass: 2.5 },  // 3x artırıldı
      { name: "Magnezyum Sülfat", mass: 1.2 },
      { name: "Kalsiyum Klorür", mass: 0.025 },
      { name: "Demir Sülfat", mass: 0.005 }
      // Karbonat ÇIKARILDI
    ],
    bbm: [
      { name: "Sodyum Nitrat", mass: 0.25 },
      { name: "MKP (Monopotasyum Fosfat)", mass: 0.175 },
      { name: "Dipotasyum Fosfat", mass: 0.075 },
      { name: "Magnezyum Sülfat", mass: 0.075 },
      { name: "Kalsiyum Klorür", mass: 0.025 },
      { name: "Sodyum Klorür", mass: 0.025 }
    ],
    bg11: [
      { name: "Sodyum Nitrat", mass: 1.5 },
      { name: "Dipotasyum Fosfat", mass: 0.04 },
      { name: "Magnezyum Sülfat", mass: 0.075 },
      { name: "Kalsiyum Klorür", mass: 0.036 },
      { name: "Sodyum Karbonat", mass: 0.02 }
    ]
  };

  const handleCalculate = () => {
    const selectedRecipe = predefinedRecipes[recipe];
    
    const params = {
      oldVolume: parseFloat(oldVolume),
      newVolume: parseFloat(newVolume),
      oldTDS: parseFloat(oldTDS),
      targetTDS: parseFloat(targetTDS),
      measurements: {
        TAN: measurements.TAN ? parseFloat(measurements.TAN) : undefined,
        TP: measurements.TP ? parseFloat(measurements.TP) : undefined,
        pH: measurements.pH ? parseFloat(measurements.pH) : undefined,
        cellDensity: measurements.cellDensity ? parseFloat(measurements.cellDensity) * 1e6 : undefined
      }
    };

    try {
      const calculation = calculateScaleUpNutrients(params, selectedRecipe, mode);
      
      // pH krizi kontrolü
      let phCrisisData = null;
      if (measurements.pH) {
        phCrisisData = detectPHCrisis(
          parseFloat(measurements.pH),
          parseFloat(oldTDS),
          measurements.cellDensity ? parseFloat(measurements.cellDensity) * 1e6 : null
        );
      }

      setResult({
        ...calculation,
        phCrisis: phCrisisData
      });
    } catch (error) {
      alert('Hesaplama hatası: ' + error.message);
    }
  };

  const handleApprove = () => {
    if (result) {
      alert('✅ Öneri onaylandı! Aşağıdaki kimyasalları ekleyebilirsiniz.');
      // Burada localStorage'a kaydedilebilir veya başka işlem yapılabilir
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">🧮 Akıllı Scale-Up Hesaplayıcı</h2>
        <p className="text-blue-100">Artıkları hesapla • Sadece eksiği tamamla • Tasarruf et</p>
      </div>

      {/* Mod Seçimi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>⚙️</span> Hesaplama Modu
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {['AUTO', 'HYBRID', 'MANUAL'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode === m 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="font-bold text-lg mb-2">
                {m === 'AUTO' && '🤖 Otomatik'}
                {m === 'HYBRID' && '🔄 Hibrit'}
                {m === 'MANUAL' && '✋ Manuel'}
              </div>
              <div className="text-sm text-gray-600">
                {m === 'AUTO' && 'Sistem karar verir'}
                {m === 'HYBRID' && 'Öneri sun, onay bekle'}
                {m === 'MANUAL' && 'Tamamen senin kontrolün'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Ana Girdiler */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">📊 Temel Bilgiler</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mevcut Hacim (L)</label>
            <input
              type="number"
              value={oldVolume}
              onChange={(e) => setOldVolume(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Yeni Hacim (L)</label>
            <input
              type="number"
              value={newVolume}
              onChange={(e) => setNewVolume(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mevcut TDS (ppm)</label>
            <input
              type="number"
              value={oldTDS}
              onChange={(e) => setOldTDS(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hedef TDS (ppm)</label>
            <input
              type="number"
              value={targetTDS}
              onChange={(e) => setTargetTDS(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Besiyeri Reçetesi</label>
          <select
            value={recipe}
            onChange={(e) => setRecipe(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="custom">Özel Formül (Orijinal)</option>
            <option value="customV2">Özel Formül V2.0 (pH Fix)</option>
            <option value="bbm">BBM (Bold's Basal Medium)</option>
            <option value="bg11">BG-11</option>
          </select>
        </div>
      </div>

      {/* Gelişmiş Ölçümler */}
      <div className="bg-white p-6 rounded-lg shadow">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-xl font-semibold">🔬 Spektrofotometre Ölçümleri (Opsiyonel)</h3>
          <span className="text-2xl">{showAdvanced ? '▼' : '▶'}</span>
        </button>
        
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">TAN - Amonyum Azotu (mg/L)</label>
              <input
                type="number"
                value={measurements.TAN}
                onChange={(e) => setMeasurements({...measurements, TAN: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="Ölçülmediyse boş bırak"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">TP - Toplam Fosfor (mg/L)</label>
              <input
                type="number"
                value={measurements.TP}
                onChange={(e) => setMeasurements({...measurements, TP: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="Ölçülmediyse boş bırak"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">pH</label>
              <input
                type="number"
                value={measurements.pH}
                onChange={(e) => setMeasurements({...measurements, pH: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="pH ölçümü"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hücre Yoğunluğu (milyon/ml)</label>
              <input
                type="number"
                value={measurements.cellDensity}
                onChange={(e) => setMeasurements({...measurements, cellDensity: e.target.value})}
                className="w-full p-3 border rounded-lg"
                placeholder="Örn: 30"
                step="1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hesapla Butonu */}
      <button
        onClick={handleCalculate}
        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all"
      >
        🧪 HESAPLA
      </button>

      {/* Sonuçlar */}
      {result && (
        <div className="space-y-4">
          {/* pH Krizi Uyarısı */}
          {result.phCrisis && result.phCrisis.detected && (
            <div className={`p-6 rounded-lg border-2 ${
              result.phCrisis.severity === 'critical' 
                ? 'bg-red-50 border-red-500' 
                : 'bg-yellow-50 border-yellow-500'
            }`}>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span>⚠️</span>
                {result.phCrisis.severity === 'critical' ? 'pH KRİZİ ALGILANDI!' : 'pH Uyarısı'}
              </h3>
              <div className="space-y-2">
                <p><strong>Sebepler:</strong> {result.phCrisis.causes.join(', ')}</p>
                {result.phCrisis.actions.map((action, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border">
                    {action.immediate && <p><strong>Hemen:</strong> {action.immediate}</p>}
                    {action.expected && <p className="text-sm text-gray-600">{action.expected}</p>}
                    {action.preventive && <p><strong>Önleyici:</strong> {action.preventive}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scale-Up Bilgileri */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h3 className="text-xl font-bold mb-4">📐 Scale-Up Analizi</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Eski Hacim</p>
                <p className="text-2xl font-bold">{result.scaleUpInfo.oldVolume} L</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Yeni Hacim</p>
                <p className="text-2xl font-bold">{result.scaleUpInfo.newVolume} L</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Eklenen Su</p>
                <p className="text-2xl font-bold text-blue-600">{result.scaleUpInfo.addedWater} L</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-sm text-gray-600">Su Oranı</p>
                <p className="text-2xl font-bold text-green-600">{result.scaleUpInfo.waterPercentage}</p>
              </div>
            </div>
          </div>

          {/* Artık Analizi */}
          <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
            <h3 className="text-xl font-bold mb-4">♻️ Artık Analizi</h3>
            <div className="space-y-2">
              {result.residueAnalysis.warning.map((warn, idx) => (
                <div key={idx} className="bg-white p-3 rounded border">
                  {warn}
                </div>
              ))}
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer font-semibold text-lg hover:text-blue-600">
                🔍 Detaylı Element Analizi
              </summary>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {Object.entries(result.residueAnalysis.elementResiduals).map(([element, amount]) => (
                  amount > 0 && (
                    <div key={element} className="bg-white p-3 rounded border">
                      <p className="font-semibold">{element}</p>
                      <p className="text-2xl text-gray-700">{amount.toFixed(2)} mg</p>
                      <p className="text-sm text-gray-500">
                        {(amount / result.scaleUpInfo.oldVolume).toFixed(2)} mg/L
                      </p>
                    </div>
                  )
                ))}
              </div>
            </details>
          </div>

          {/* Eksik Analizi */}
          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
            <h3 className="text-xl font-bold mb-4">📉 Eksiklik Analizi</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(result.deficit).map(([element, amount]) => (
                amount > 0 && (
                  <div key={element} className="bg-white p-4 rounded text-center">
                    <p className="text-sm text-gray-600">{element}</p>
                    <p className="text-xl font-bold text-orange-600">{amount.toFixed(1)} mg</p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Kimyasal Dozaj Önerisi */}
          <div className={`p-6 rounded-lg border-2 ${
            mode === 'HYBRID' ? 'bg-purple-50 border-purple-300' : 'bg-green-50 border-green-300'
          }`}>
            <h3 className="text-2xl font-bold mb-4">💊 Kimyasal Dozaj</h3>
            <div className="mb-4 p-4 bg-white rounded-lg">
              <p className="font-semibold text-lg">Mod: {result.recommendation.mode}</p>
              <p className="text-gray-700">{result.recommendation.action}</p>
            </div>

            <div className="space-y-3">
              {result.dosing.chemicals.map((chem, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{chem.name}</p>
                      <p className="text-sm text-gray-600">{chem.reason}</p>
                    </div>
                    <p className="text-2xl font-bold">{chem.amount.toFixed(2)} {chem.unit}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p><strong>Sağlayacağı:</strong></p>
                    <ul className="list-disc list-inside">
                      {Object.entries(chem.provides).map(([elem, val]) => (
                        <li key={elem}>{elem}: {val.toFixed(2)} mg</li>
                      ))}
                    </ul>
                  </div>
                  {chem.note && (
                    <p className="mt-2 text-sm text-orange-600 font-semibold">💡 {chem.note}</p>
                  )}
                  {chem.warning && (
                    <p className="mt-2 text-sm text-red-600 font-semibold">⚠️ {chem.warning}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="text-lg"><strong>Toplam Kütle:</strong> {result.dosing.totalMass.toFixed(2)} g</p>
              <p className="text-lg"><strong>Tahmini Maliyet:</strong> {result.dosing.costEstimate.toFixed(2)} TL</p>
            </div>

            {result.recommendation.savings && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg border-2 border-green-400">
                <p className="text-xl font-bold text-green-700 mb-2">💰 Tasarruf Raporu</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Akıllı Sistem</p>
                    <p className="text-2xl font-bold text-green-600">{result.recommendation.savings.smartCost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tam Doz</p>
                    <p className="text-2xl font-bold text-gray-500 line-through">{result.recommendation.savings.fullCost}</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-2xl font-bold text-green-700">
                  Tasarruf: {result.recommendation.savings.savings} ({result.recommendation.savings.savingsPercent})
                </p>
              </div>
            )}
          </div>

          {/* N:P Oranı */}
          <div className="bg-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
            <h3 className="text-xl font-bold mb-4">⚖️ N:P Oranı Analizi</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded text-center">
                <p className="text-sm text-gray-600">Azot (N)</p>
                <p className="text-2xl font-bold">{result.npRatio.N_mass.toFixed(1)} mg</p>
              </div>
              <div className="bg-white p-4 rounded text-center">
                <p className="text-sm text-gray-600">Fosfor (P)</p>
                <p className="text-2xl font-bold">{result.npRatio.P_mass.toFixed(1)} mg</p>
              </div>
              <div className="bg-white p-4 rounded text-center">
                <p className="text-sm text-gray-600">N:P Oranı</p>
                <p className="text-2xl font-bold text-indigo-600">{result.npRatio.massRatio}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg">
              <p className="font-semibold">Redfield Optimal: {result.npRatio.redfield}:1</p>
              <p className="text-sm text-gray-600">Sapma: {result.npRatio.deviation}</p>
              <p className={`mt-2 font-bold text-lg ${
                result.npRatio.assessment.includes('DENGEDE') ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.npRatio.assessment}
              </p>
            </div>
          </div>

          {/* Onay Butonu (Hybrid Modda) */}
          {mode === 'HYBRID' && (
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition"
              >
                ✅ ÖNERİYİ ONAYLA
              </button>
              <button
                onClick={() => setMode('MANUAL')}
                className="flex-1 bg-gray-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition"
              >
                ✋ MANUEL MODA GEÇ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScaleUpCalculator;
