import React, { useState } from 'react';
import { Syringe } from 'lucide-react';
import { useMaterials } from '../contexts/MaterialsContext';
import { getChemicalDisplayName } from '../utils/chemicalNames';
import { useEnforcedChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

/**
 * Task 9: ENFORCED Kimyasal Dozaj Hesaplayıcı
 * TankID zorunlu, müdahale otomatik kayıt, model'e direkt yansıma
 */
const ChemicalDosageCalculator = () => {
  // 🔴 ENFORCED MERKEZI SISTEM - Müdahale zorunlu TankID ile
  const { addIntervention, getAllTankStates, state } = useEnforcedChlorellaSystem();
  const { reduceStock } = useMaterials();
  
  // State Management
  const [waterParams, setWaterParams] = useState({
    tankVolume: '',
    // TDS (Total Dissolved Solids)
    currentTDS: '',
    targetTDS: '',
    // pH
    currentPH: '',
    targetPH: '',
    // Nitrat (NO₃⁻)
    currentNitrate: '',
    targetNitrate: '',
    // Fosfat (PO₄³⁻)
    currentPhosphate: '',
    targetPhosphate: '',
    // Alkalinite (as CaCO₃)
    currentAlkalinity: '',
    targetAlkalinity: '',
    // Sertlik (Hardness as CaCO₃)
    currentHardness: '',
    targetHardness: '',
    // Klorür (Cl⁻)
    currentChloride: '',
    targetChloride: '',
    // Sülfat (SO₄²⁻)
    currentSulfate: '',
    targetSulfate: '',
    // Karbonat (CO₃²⁻)
    currentCarbonate: '',
    targetCarbonate: ''
  });

  const [dosageResult, setDosageResult] = useState(null);

  // Hesaplama Fonksiyonu
  const calculateChemicalDosage = () => {
    const volume = parseFloat(waterParams.tankVolume);
    
    if (!volume || volume <= 0) {
      alert('Lütfen geçerli bir tank hacmi girin');
      return;
    }

    const dosages = [];

    // 1. TDS Hesaplama
    if (waterParams.currentTDS && waterParams.targetTDS) {
      const current = parseFloat(waterParams.currentTDS);
      const target = parseFloat(waterParams.targetTDS);
      const diff = target - current;
      
      if (Math.abs(diff) > 50) {  // 50 ppm threshold
        dosages.push({
          parameter: 'TDS (Total Dissolved Solids)',
          current,
          target,
          difference: diff,
          chemical: diff > 0 ? `${getChemicalDisplayName('NaCl', 'nameWithCommon')} + ${getChemicalDisplayName('KCl', 'nameWithCommon')} karışımı` : 'Su seyreltme',
          amount: diff > 0 ? (diff * volume / 1000).toFixed(2) : ((current - target) / current * volume).toFixed(2),
          unit: diff > 0 ? 'g' : 'L su',
          priority: 'Orta',
          formula: diff > 0 ? 'TDS farkı × Hacim / 1000' : 'Seyreltme oranı × Hacim'
        });
      }
    }

    // 2. pH Hesaplama (Claude Boyd Metodu)
    if (waterParams.currentPH && waterParams.targetPH) {
      const current = parseFloat(waterParams.currentPH);
      const target = parseFloat(waterParams.targetPH);
      const diff = target - current;
      
      if (Math.abs(diff) > 0.2) {  // 0.2 pH unit threshold
        dosages.push({
          parameter: 'pH',
          current,
          target,
          difference: diff,
          chemical: diff > 0 ? getChemicalDisplayName('Na2CO3', 'full') : getChemicalDisplayName('H3PO4', 'full'),
          amount: (Math.abs(diff) * volume * (diff > 0 ? 0.5 : 0.3)).toFixed(2),
          unit: 'g',
          priority: 'Yüksek',
          formula: diff > 0 
            ? 'Boyd: 0.5g Na₂CO₃ / L / pH ünitesi' 
            : 'Boyd: 0.3g H₃PO₄ / L / pH ünitesi'
        });
      }
    }

    // 3. Nitrat Hesaplama (Tommasso Metodu)
    if (waterParams.currentNitrate && waterParams.targetNitrate) {
      const current = parseFloat(waterParams.currentNitrate);
      const target = parseFloat(waterParams.targetNitrate);
      const diff = target - current;
      
      if (Math.abs(diff) > 5) {  // 5 mg/L threshold
        const nitrogenDiff = diff / 4.43;  // NO₃⁻ to N conversion
        dosages.push({
          parameter: 'Nitrat (NO₃⁻)',
          current,
          target,
          difference: diff,
          chemical: 'Kalsiyum Nitrat [Ca(NO₃)₂]',
          amount: (Math.abs(nitrogenDiff) * volume * 5.88).toFixed(2),
          unit: 'g',
          priority: 'Yüksek',
          formula: 'Tommasso: N × 5.88 = Ca(NO₃)₂ miktarı'
        });
      }
    }

    // 4. Fosfat Hesaplama (Tommasso Metodu)
    if (waterParams.currentPhosphate && waterParams.targetPhosphate) {
      const current = parseFloat(waterParams.currentPhosphate);
      const target = parseFloat(waterParams.targetPhosphate);
      const diff = target - current;
      
      if (Math.abs(diff) > 1) {  // 1 mg/L threshold
        const phosphorusDiff = diff / 3.07;  // PO₄³⁻ to P conversion
        dosages.push({
          parameter: 'Fosfat (PO₄³⁻)',
          current,
          target,
          difference: diff,
          chemical: getChemicalDisplayName('KH2PO4', 'full'),
          amount: (Math.abs(phosphorusDiff) * volume * 4.39).toFixed(2),
          unit: 'g',
          priority: 'Yüksek',
          formula: 'Tommasso: P × 4.39 = KH₂PO₄ miktarı'
        });
      }
    }

    // 5. Alkalinite Hesaplama (Boyd Metodu)
    if (waterParams.currentAlkalinity && waterParams.targetAlkalinity) {
      const current = parseFloat(waterParams.currentAlkalinity);
      const target = parseFloat(waterParams.targetAlkalinity);
      const diff = target - current;
      
      if (Math.abs(diff) > 10) {  // 10 mg/L CaCO₃ threshold
        dosages.push({
          parameter: 'Alkalinite (as CaCO₃)',
          current,
          target,
          difference: diff,
          chemical: getChemicalDisplayName('NaHCO3', 'full'),
          amount: (Math.abs(diff) * volume * 1.68 / 1000).toFixed(2),
          unit: 'g',
          priority: 'Orta',
          formula: 'Boyd: 1.68g NaHCO₃ / L / mg CaCO₃'
        });
      }
    }

    // 6. Sertlik Hesaplama (Boyd Metodu)
    if (waterParams.currentHardness && waterParams.targetHardness) {
      const current = parseFloat(waterParams.currentHardness);
      const target = parseFloat(waterParams.targetHardness);
      const diff = target - current;
      
      if (Math.abs(diff) > 10) {  // 10 mg/L CaCO₃ threshold
        dosages.push({
          parameter: 'Sertlik (as CaCO₃)',
          current,
          target,
          difference: diff,
          chemical: getChemicalDisplayName('CaCl2', 'full'),
          amount: (Math.abs(diff) * volume * 1.47 / 1000).toFixed(2),
          unit: 'g',
          priority: 'Orta',
          formula: 'Boyd: 1.47g CaCl₂ / L / mg CaCO₃'
        });
      }
    }

    // 7. Klorür Hesaplama
    if (waterParams.currentChloride && waterParams.targetChloride) {
      const current = parseFloat(waterParams.currentChloride);
      const target = parseFloat(waterParams.targetChloride);
      const diff = target - current;
      
      if (Math.abs(diff) > 10) {  // 10 mg/L threshold
        dosages.push({
          parameter: 'Klorür (Cl⁻)',
          current,
          target,
          difference: diff,
          chemical: getChemicalDisplayName('NaCl', 'full'),
          amount: (Math.abs(diff) * volume * 1.65 / 1000).toFixed(2),
          unit: 'g',
          priority: 'Düşük',
          formula: '1.65g NaCl / L / mg Cl⁻'
        });
      }
    }

    // 8. Sülfat Hesaplama
    if (waterParams.currentSulfate && waterParams.targetSulfate) {
      const current = parseFloat(waterParams.currentSulfate);
      const target = parseFloat(waterParams.targetSulfate);
      const diff = target - current;
      
      if (Math.abs(diff) > 10) {  // 10 mg/L threshold
        dosages.push({
          parameter: 'Sülfat (SO₄²⁻)',
          current,
          target,
          difference: diff,
          chemical: getChemicalDisplayName('MgSO4', 'full'),
          amount: (Math.abs(diff) * volume * 1.25 / 1000).toFixed(2),
          unit: 'g',
          priority: 'Düşük',
          formula: '1.25g MgSO₄ / L / mg SO₄²⁻'
        });
      }
    }

    // 9. Karbonat Hesaplama
    if (waterParams.currentCarbonate && waterParams.targetCarbonate) {
      const current = parseFloat(waterParams.currentCarbonate);
      const target = parseFloat(waterParams.targetCarbonate);
      const diff = target - current;
      
      if (Math.abs(diff) > 5) {  // 5 mg/L threshold
        dosages.push({
          parameter: 'Karbonat (CO₃²⁻)',
          current,
          target,
          difference: diff,
          chemical: getChemicalDisplayName('Na2CO3', 'full'),
          amount: (Math.abs(diff) * volume * 1.77 / 1000).toFixed(2),
          unit: 'g',
          priority: 'Düşük',
          formula: '1.77g Na₂CO₃ / L / mg CO₃²⁻'
        });
      }
    }

    // Sonuçları kaydet
    setDosageResult({
      dosages,
      timestamp: new Date().toISOString(),
      tankVolume: volume,
      totalChemicals: dosages.length
    });
  };

  // Input handler
  const handleInputChange = (field, value) => {
    setWaterParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">⚗️ 9-Parametre Kimyasal Dozaj Hesaplayıcı</h2>
        <p className="text-purple-100">Boyd ve Tommasso metodolojilerine göre profesyonel su kalitesi yönetimi</p>
      </div>

      {/* Tank Hacmi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🛢️</span> Tank Hacmi
        </h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium mb-2">Tank Hacmi (L)</label>
          <input
            type="number"
            value={waterParams.tankVolume}
            onChange={(e) => handleInputChange('tankVolume', e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Örn: 1000"
          />
        </div>
      </div>

      {/* 9 Parametre Grid (3x3) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>⚗️</span> Su Kalitesi Parametreleri
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Claude Boyd ve Tommasso metotlarına göre kimyasal dozaj hesaplaması
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. TDS */}
          <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
            <h4 className="font-semibold mb-2 text-blue-700 flex items-center gap-2">
              <span>📊</span> TDS (Total Dissolved Solids)
            </h4>
            <p className="text-xs text-gray-600 mb-2">ppm veya mg/L</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentTDS}
                onChange={(e) => handleInputChange('currentTDS', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                placeholder="Mevcut TDS"
              />
              <input
                type="number"
                value={waterParams.targetTDS}
                onChange={(e) => handleInputChange('targetTDS', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                placeholder="Hedef TDS"
              />
            </div>
          </div>

          {/* 2. pH */}
          <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
            <h4 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
              <span>🧪</span> pH
            </h4>
            <p className="text-xs text-gray-600 mb-2">0-14 aralığı</p>
            <div className="space-y-2">
              <input
                type="number"
                step="0.1"
                value={waterParams.currentPH}
                onChange={(e) => handleInputChange('currentPH', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                placeholder="Mevcut pH"
              />
              <input
                type="number"
                step="0.1"
                value={waterParams.targetPH}
                onChange={(e) => handleInputChange('targetPH', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-400"
                placeholder="Hedef pH"
              />
            </div>
          </div>

          {/* 3. Nitrat */}
          <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
            <h4 className="font-semibold mb-2 text-red-700 flex items-center gap-2">
              <span>🔴</span> Nitrat (NO₃⁻)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentNitrate}
                onChange={(e) => handleInputChange('currentNitrate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-400"
                placeholder="Mevcut Nitrat"
              />
              <input
                type="number"
                value={waterParams.targetNitrate}
                onChange={(e) => handleInputChange('targetNitrate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-400"
                placeholder="Hedef Nitrat"
              />
            </div>
          </div>

          {/* 4. Fosfat */}
          <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
            <h4 className="font-semibold mb-2 text-purple-700 flex items-center gap-2">
              <span>🟣</span> Fosfat (PO₄³⁻)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentPhosphate}
                onChange={(e) => handleInputChange('currentPhosphate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-400"
                placeholder="Mevcut Fosfat"
              />
              <input
                type="number"
                value={waterParams.targetPhosphate}
                onChange={(e) => handleInputChange('targetPhosphate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-400"
                placeholder="Hedef Fosfat"
              />
            </div>
          </div>

          {/* 5. Alkalinite */}
          <div className="border-2 border-indigo-300 rounded-lg p-4 bg-indigo-50">
            <h4 className="font-semibold mb-2 text-indigo-700 flex items-center gap-2">
              <span>💎</span> Alkalinite (as CaCO₃)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L CaCO₃</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentAlkalinity}
                onChange={(e) => handleInputChange('currentAlkalinity', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400"
                placeholder="Mevcut Alkalinite"
              />
              <input
                type="number"
                value={waterParams.targetAlkalinity}
                onChange={(e) => handleInputChange('targetAlkalinity', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-400"
                placeholder="Hedef Alkalinite"
              />
            </div>
          </div>

          {/* 6. Sertlik */}
          <div className="border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
            <h4 className="font-semibold mb-2 text-yellow-700 flex items-center gap-2">
              <span>⭐</span> Sertlik (as CaCO₃)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L CaCO₃</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentHardness}
                onChange={(e) => handleInputChange('currentHardness', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
                placeholder="Mevcut Sertlik"
              />
              <input
                type="number"
                value={waterParams.targetHardness}
                onChange={(e) => handleInputChange('targetHardness', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-yellow-400"
                placeholder="Hedef Sertlik"
              />
            </div>
          </div>

          {/* 7. Klorür */}
          <div className="border-2 border-teal-300 rounded-lg p-4 bg-teal-50">
            <h4 className="font-semibold mb-2 text-teal-700 flex items-center gap-2">
              <span>🔵</span> Klorür (Cl⁻)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentChloride}
                onChange={(e) => handleInputChange('currentChloride', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-400"
                placeholder="Mevcut Klorür"
              />
              <input
                type="number"
                value={waterParams.targetChloride}
                onChange={(e) => handleInputChange('targetChloride', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-400"
                placeholder="Hedef Klorür"
              />
            </div>
          </div>

          {/* 8. Sülfat */}
          <div className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50">
            <h4 className="font-semibold mb-2 text-orange-700 flex items-center gap-2">
              <span>🟠</span> Sülfat (SO₄²⁻)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentSulfate}
                onChange={(e) => handleInputChange('currentSulfate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400"
                placeholder="Mevcut Sülfat"
              />
              <input
                type="number"
                value={waterParams.targetSulfate}
                onChange={(e) => handleInputChange('targetSulfate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-400"
                placeholder="Hedef Sülfat"
              />
            </div>
          </div>

          {/* 9. Karbonat */}
          <div className="border-2 border-pink-300 rounded-lg p-4 bg-pink-50">
            <h4 className="font-semibold mb-2 text-pink-700 flex items-center gap-2">
              <span>💖</span> Karbonat (CO₃²⁻)
            </h4>
            <p className="text-xs text-gray-600 mb-2">mg/L</p>
            <div className="space-y-2">
              <input
                type="number"
                value={waterParams.currentCarbonate}
                onChange={(e) => handleInputChange('currentCarbonate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-400"
                placeholder="Mevcut Karbonat"
              />
              <input
                type="number"
                value={waterParams.targetCarbonate}
                onChange={(e) => handleInputChange('targetCarbonate', e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-400"
                placeholder="Hedef Karbonat"
              />
            </div>
          </div>
        </div>

        {/* Hesapla Butonu */}
        <div className="mt-6">
          <button
            onClick={calculateChemicalDosage}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
          >
            🧮 DOZAJ HESAPLA
          </button>
        </div>
      </div>

      {/* Sonuçlar */}
      {dosageResult && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold mb-4 text-purple-600">💊 Dozaj Önerileri</h3>
          <p className="text-sm text-gray-600 mb-4">
            Tank Hacmi: <strong>{dosageResult.tankVolume} L</strong> • 
            Toplam Parametre: <strong>{dosageResult.totalChemicals}</strong> • 
            Tarih: <strong>{new Date(dosageResult.timestamp).toLocaleString('tr-TR')}</strong>
          </p>

          {dosageResult.dosages.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-green-50 rounded-lg border-2 border-green-200">
              <p className="text-lg">✅ Tüm parametreler hedef aralıkta!</p>
              <p className="text-sm mt-2">Kimyasal eklenmesine gerek yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dosageResult.dosages
                .sort((a, b) => {
                  const priority = { 'Yüksek': 3, 'Orta': 2, 'Düşük': 1 };
                  return priority[b.priority] - priority[a.priority];
                })
                .map((dose, idx) => (
                  <div 
                    key={idx} 
                    className={`border-2 rounded-lg p-4 ${
                      dose.priority === 'Yüksek' ? 'border-red-400 bg-red-50' :
                      dose.priority === 'Orta' ? 'border-yellow-400 bg-yellow-50' :
                      'border-green-400 bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg">{dose.parameter}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        dose.priority === 'Yüksek' ? 'bg-red-500 text-white' :
                        dose.priority === 'Orta' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      }`}>
                        {dose.priority} Öncelik
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Mevcut:</span>
                        <span className="font-semibold ml-2">{dose.current}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hedef:</span>
                        <span className="font-semibold ml-2">{dose.target}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Fark:</span>
                        <span className={`font-semibold ml-2 ${dose.difference > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                          {dose.difference > 0 ? '+' : ''}{dose.difference.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border">
                      <p className="font-semibold text-purple-700 mb-1">
                        🧪 {dose.chemical}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {dose.amount} {dose.unit}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        📐 {dose.formula}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {dosageResult.dosages.length > 0 && (
            <div className="mt-6 space-y-3">
              {/* Tank Seçici - Enforced sistem için ZORUNLU */}
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-lg mb-4">
                <label className="block text-sm font-bold mb-2 text-yellow-800">
                  🎯 Hedef Tank (ZORUNLU)
                </label>
                <select
                  id="target-tank-select"
                  className="w-full p-3 border-2 border-yellow-400 rounded-lg font-semibold"
                >
                  <option value="">Tank seçin...</option>
                  {Object.keys(state.tanks).map(tankId => (
                    <option key={tankId} value={tankId}>
                      {state.tanks[tankId].tankName} (ID: {tankId})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition shadow flex items-center justify-center gap-2"
                onClick={() => {
                  // Enforced: TankID zorunlu kontrolü
                  const tankSelect = document.getElementById('target-tank-select');
                  const selectedTankId = tankSelect?.value;
                  
                  if (!selectedTankId) {
                    alert('❌ HATA: Tank seçmeden kimyasal uygulanamaz!\n\nEnforced sistem kuralı: TankID zorunlu.');
                    return;
                  }
                  
                  // ✨ STOK AZALTMA: Kimyasalları stoklardan düş
                  const errors = [];
                  const warnings = [];
                  
                  dosageResult.dosages.forEach(dose => {
                    const result = reduceStock(
                      dose.chemical,
                      dose.amount,
                      dose.unit || 'g',
                      {
                        type: 'parameter_adjustment',
                        parameter: dose.parameter,
                        tankVolume: waterParams.tankVolume,
                        targetValue: dose.target,
                        currentValue: dose.current,
                        timestamp: new Date().toISOString()
                      }
                    );

                    if (!result.success) {
                      errors.push(`${dose.chemical}: ${result.error}`);
                    } else if (result.warning) {
                      warnings.push(result.warning);
                    }
                  });

                  if (errors.length > 0) {
                    alert('❌ STOK YETERSİZ!\n\n' + errors.join('\n') + '\n\nKimyasal uygulanamadı.');
                  } else {
                    // ✅ ENFORCED SİSTEME MÜDAHALE KAYDI
                    dosageResult.dosages.forEach(dose => {
                      addIntervention(selectedTankId, {
                        type: 'chemical_dosage',
                        details: {
                          parameter: dose.parameter,
                          chemical: dose.chemical,
                          amount: parseFloat(dose.amount),
                          unit: dose.unit,
                          targetValue: dose.target,
                          currentValue: dose.current,
                          difference: dose.difference,
                          formula: dose.formula
                        },
                        result: {
                          success: true,
                          tankVolume: waterParams.tankVolume,
                          appliedAt: new Date().toISOString()
                        },
                        notes: `9-Parametre Kimyasal Dozaj: ${dose.parameter} düzenleme`
                      });
                    });
                    
                    let message = '✅ Kimyasallar başarıyla uygulandı!\n\n';
                    message += `📋 Tank: ${state.tanks[selectedTankId].tankName}\n`;
                    message += `🔬 ${dosageResult.dosages.length} parametre ayarlandı\n`;
                    message += `📊 Tüm müdahaleler merkezi sisteme kaydedildi`;
                    
                    if (warnings.length > 0) {
                      message += '\n\n⚠️ UYARILAR:\n' + warnings.join('\n');
                    }
                    alert(message);
                    
                    console.log(`✅ ${dosageResult.dosages.length} kimyasal müdahale Tank ${selectedTankId}'ye kaydedildi`);
                  }
                }}
              >
                <Syringe className="w-5 h-5" />
                🚀 KİMYASALLARI UYGULA (Enforced Sistem)
              </button>
              
              <button
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition shadow"
                onClick={() => {
                  const report = JSON.stringify(dosageResult, null, 2);
                  const blob = new Blob([report], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `dozaj_raporu_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                💾 RAPOR İNDİR (JSON)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Metodoloji Bilgisi */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
        <h4 className="font-bold mb-3 text-gray-800">📚 Metodoloji Kaynakları</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Claude E. Boyd</strong> - Water Quality in Aquaculture (Auburn University)</li>
          <li>• <strong>Tommasso et al.</strong> - Microalgae Cultivation Techniques</li>
          <li>• <strong>Stoichiometric Calculations</strong> - Chemical Dosing Formulas</li>
          <li>• <strong>ISO 5667</strong> - Water Sampling Standards</li>
        </ul>
      </div>
    </div>
  );
};

export default ChemicalDosageCalculator;
