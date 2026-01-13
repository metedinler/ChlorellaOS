import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, RotateCcw, Save, TrendingUp, Beaker, Eye } from 'lucide-react';
import {
  loadCalibrations,
  calculateConcentrationFromCalibration,
  addCalibration,
  updateCalibration,
  deleteCalibration,
  resetCalibration,
  calculateLinearRegression,
  evaluateCalibrationQuality
} from '../utils/calibrationManager.js';
import { useEnforcedChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

const SpectroCalculator = () => {
  // 🔴 ENFORCED MERKEZI SISTEM - OD ölçümleri zorunlu TankID ile
  const { addODMeasurement, getAllTankStates, state } = useEnforcedChlorellaSystem();
  
  const [activeView, setActiveView] = useState('measure'); // 'measure' | 'calibrations'
  const [selectedMethod, setSelectedMethod] = useState('phosphate_880nm');
  const [calibrations, setCalibrations] = useState({});
  
  // Ölçüm state'leri
  const [absorbance, setAbsorbance] = useState('');
  const [tankId, setTankId] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [readings, setReadings] = useState([]);
  const [result, setResult] = useState(null);
  
  // Kalibrasyon editör state'leri
  const [editingCalibration, setEditingCalibration] = useState(null);
  const [isNewCalibration, setIsNewCalibration] = useState(false);
  
  // Kalibrasyonları yükle
  useEffect(() => {
    const loaded = loadCalibrations();
    setCalibrations(loaded);
  }, []);
  
  // Analiz metodları kategorileri
  const methodCategories = {
    'Azot Analizleri': [
      'nitrogen_nessler_425nm',
      'nitrogen_salicylate_655nm',
      'total_ammonia_655nm'
    ],
    'Fosfor Analizleri': [
      'phosphate_880nm',
      'total_phosphorus_880nm'
    ],
    'Su Kalitesi': [
      'alkalinity_bromocresol_630nm',
      'hardness_edta_520nm'
    ],
    'Organik Analizler': [
      'urea_diacetyl_520nm'
    ]
  };
  
  // Okuma ekle
  const addReading = () => {
    if (!absorbance || absorbance <= 0) {
      alert('Geçerli bir absorbans değeri girin!');
      return;
    }
    
    try {
      const calcResult = calculateConcentrationFromCalibration(selectedMethod, parseFloat(absorbance));
      
      const newReading = {
        id: Date.now(),
        absorbance: parseFloat(absorbance),
        ...calcResult,
        timestamp: new Date().toISOString()
      };
      
      setReadings([...readings, newReading]);
      setAbsorbance(''); // Input'u temizle
      
      // Ortalama hesapla
      const allConcentrations = [...readings, newReading].map(r => r.concentration);
      const average = allConcentrations.reduce((a, b) => a + b, 0) / allConcentrations.length;
      const stdDev = Math.sqrt(
        allConcentrations.map(c => Math.pow(c - average, 2)).reduce((a, b) => a + b, 0) / allConcentrations.length
      );
      
      setResult({
        ...calcResult,
        average,
        stdDev,
        readingCount: allConcentrations.length,
        cv: (stdDev / average) * 100 // Varyasyon katsayısı (%)
      });
      
      // 🔴 MERKEZI SİSTEME KAYDET (eğer OD ölçümü ise)
      if (tankId && selectedMethod.includes('OD') || selectedMethod.includes('od')) {
        addODMeasurement(tankId, {
          value: parseFloat(absorbance),
          wavelength: extractWavelengthFromMethod(selectedMethod),
          pathlength: 1, // cm (varsayılan)
          calibratedBiomass: calcResult.concentration, // mg/L → g/L dönüşümü gerekebilir
          confidence: calcResult.quality || 'medium'
        });
        
        console.log(`✅ OD ölçümü merkezi sisteme kaydedildi: Tank ${tankId}, λ=${extractWavelengthFromMethod(selectedMethod)} nm`);
      }
      
    } catch (error) {
      alert('Hesaplama hatası: ' + error.message);
    }
  };
  
  // Dalga boyunu method adından çıkar
  const extractWavelengthFromMethod = (method) => {
    const match = method.match(/(\d+)nm/);
    return match ? parseInt(match[1]) : 680; // varsayılan 680 nm
  };
  
  // Okumaları temizle
  const clearReadings = () => {
    setReadings([]);
    setResult(null);
  };
  
  // Tank'a sonucu aktar
  const transferToTank = () => {
    if (!result || !tankId) {
      alert('Tank ID ve ölçüm sonucu gerekli!');
      return;
    }
    
    // Tank verilerini localStorage'dan yükle
    const tanks = JSON.parse(localStorage.getItem('chlorella_tanks') || '{}');
    
    if (!tanks[tankId]) {
      alert(`Tank bulunamadı: ${tankId}`);
      return;
    }
    
    // Parametre adını belirle
    const paramMap = {
      'phosphate_880nm': 'PO4-P',
      'total_phosphorus_880nm': 'Total_P',
      'nitrogen_nessler_425nm': 'NH4-N',
      'nitrogen_salicylate_655nm': 'NH4-N',
      'total_ammonia_655nm': 'TAN',
      'alkalinity_bromocresol_630nm': 'Alkalinity',
      'hardness_edta_520nm': 'Hardness',
      'urea_diacetyl_520nm': 'Urea'
    };
    
    const paramName = paramMap[selectedMethod] || 'Unknown';
    
    // Tank'a veri ekle
    if (!tanks[tankId].waterQuality) {
      tanks[tankId].waterQuality = {};
    }
    
    if (!tanks[tankId].waterQuality[paramName]) {
      tanks[tankId].waterQuality[paramName] = [];
    }
    
    tanks[tankId].waterQuality[paramName].push({
      date: measurementDate,
      value: result.average,
      unit: result.unit,
      stdDev: result.stdDev,
      readingCount: result.readingCount,
      method: result.method,
      timestamp: new Date().toISOString()
    });
    
    // Kaydet
    localStorage.setItem('chlorella_tanks', JSON.stringify(tanks));
    
    alert(`✅ Sonuç Tank ${tankId} - ${paramName} parametresine aktarıldı!\nDeğer: ${result.average.toFixed(3)} ${result.unit}`);
    
    // Temizle
    clearReadings();
    setTankId('');
  };
  
  // Yeni kalibrasyon başlat
  const startNewCalibration = () => {
    setEditingCalibration({
      name: '',
      method: `custom_${Date.now()}`,
      wavelength: 0,
      unit: '',
      standards: [
        { concentration: 0, absorbance: 0 }
      ],
      notes: ''
    });
    setIsNewCalibration(true);
  };
  
  // Kalibrasyon kaydet
  const saveCalibration = () => {
    if (!editingCalibration) return;
    
    try {
      // Regresyon hesapla
      const regression = calculateLinearRegression(editingCalibration.standards);
      const quality = evaluateCalibrationQuality(regression.rSquared, editingCalibration.standards.length);
      
      if (quality.quality === 'poor') {
        if (!window.confirm(`⚠️ Zayıf kalibrasyon! R² = ${regression.rSquared.toFixed(4)}\n\n${quality.recommendation}\n\nYine de kaydetmek istiyor musunuz?`)) {
          return;
        }
      }
      
      const calibrationData = {
        ...editingCalibration,
        ...regression,
        rSquared: regression.rSquared,
        range: {
          min: Math.min(...editingCalibration.standards.map(s => s.concentration)),
          max: Math.max(...editingCalibration.standards.map(s => s.concentration))
        }
      };
      
      if (isNewCalibration) {
        addCalibration(calibrationData);
      } else {
        updateCalibration(editingCalibration.method, calibrationData);
      }
      
      // Yeniden yükle
      const loaded = loadCalibrations();
      setCalibrations(loaded);
      
      setEditingCalibration(null);
      setIsNewCalibration(false);
      
      alert('✅ Kalibrasyon kaydedildi!');
      
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };
  
  // Kalibrasyon sil
  const handleDeleteCalibration = (methodId) => {
    if (!window.confirm(`Bu kalibrasyonu silmek istediğinizden emin misiniz?\n\n${calibrations[methodId].name}`)) {
      return;
    }
    
    try {
      deleteCalibration(methodId);
      const loaded = loadCalibrations();
      setCalibrations(loaded);
      alert('✅ Kalibrasyon silindi!');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };
  
  // Kalibrasyonu fabrika ayarlarına sıfırla
  const handleResetCalibration = (methodId) => {
    if (!window.confirm('Bu kalibrasyonu fabrika ayarlarına sıfırlamak istiyor musunuz?')) {
      return;
    }
    
    try {
      resetCalibration(methodId);
      const loaded = loadCalibrations();
      setCalibrations(loaded);
      alert('✅ Kalibrasyon sıfırlandı!');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };
  
  // Standart nokta ekle/düzenle
  const updateStandard = (index, field, value) => {
    const updated = { ...editingCalibration };
    updated.standards[index][field] = parseFloat(value) || 0;
    setEditingCalibration(updated);
  };
  
  const addStandard = () => {
    const updated = { ...editingCalibration };
    updated.standards.push({ concentration: 0, absorbance: 0 });
    setEditingCalibration(updated);
  };
  
  const removeStandard = (index) => {
    const updated = { ...editingCalibration };
    updated.standards.splice(index, 1);
    setEditingCalibration(updated);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">🔬 Gelişmiş Spektrofotometre Sistemi</h2>
        <p className="text-purple-100">Çoklu Okuma + Kalibrasyon Yönetimi + Tank Entegrasyonu</p>
      </div>
      
      {/* View Selector */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveView('measure')}
            className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
              activeView === 'measure'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <Eye className="w-5 h-5" />
            <span className="font-bold">Ölçüm Yap</span>
          </button>
          
          <button
            onClick={() => setActiveView('calibrations')}
            className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
              activeView === 'calibrations'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-bold">Kalibrasyon Yönetimi</span>
          </button>
        </div>
      </div>
      
      {/* ÖLÇÜM EKRANI */}
      {activeView === 'measure' && (
        <div className="space-y-6">
          {/* Metod Seçimi */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">📋 Analiz Metodu Seçin</h3>
            
            {Object.entries(methodCategories).map(([category, methods]) => (
              <div key={category} className="mb-6">
                <div className="font-bold text-gray-700 mb-2">{category}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {methods.map(methodId => {
                    const cal = calibrations[methodId];
                    if (!cal) return null;
                    
                    return (
                      <button
                        key={methodId}
                        onClick={() => setSelectedMethod(methodId)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedMethod === methodId
                            ? 'border-purple-500 bg-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-bold">{cal.name}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {cal.wavelength} nm • R² = {cal.rSquared.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Aralık: {cal.range.min} - {cal.range.max} {cal.unit}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Ölçüm Girişi */}
          {selectedMethod && calibrations[selectedMethod] && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-2xl font-bold mb-4 text-purple-800">
                🧪 {calibrations[selectedMethod].name}
              </h3>
              
              {/* Uyarı */}
              {calibrations[selectedMethod].notes && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                  <div className="flex items-start">
                    <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                    <div>
                      <div className="font-bold text-yellow-800 mb-1">Protokol Notları</div>
                      <div className="text-sm text-yellow-700">{calibrations[selectedMethod].notes}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Giriş */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Absorbans ({calibrations[selectedMethod].wavelength} nm)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={absorbance}
                    onChange={(e) => setAbsorbance(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addReading()}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Örn: 0.245"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tank/Kaynak ID (opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={tankId}
                    onChange={(e) => setTankId(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Örn: TANK-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ölçüm Tarihi
                  </label>
                  <input
                    type="date"
                    value={measurementDate}
                    onChange={(e) => setMeasurementDate(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={addReading}
                  disabled={!absorbance}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Okuma Ekle
                </button>
                
                {readings.length > 0 && (
                  <button
                    onClick={clearReadings}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
                  >
                    Temizle
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Okumalar Tablosu */}
          {readings.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-300">
              <h4 className="text-xl font-bold mb-4 text-purple-800">📊 Okumalar ({readings.length} adet)</h4>
              
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-right">Absorbans</th>
                      <th className="px-4 py-2 text-right">Konsantrasyon</th>
                      <th className="px-4 py-2 text-left">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((reading, idx) => (
                      <tr key={reading.id} className="border-b">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2 text-right font-mono">{reading.absorbance.toFixed(4)}</td>
                        <td className="px-4 py-2 text-right font-mono">
                          {reading.concentration.toFixed(3)} {reading.unit}
                        </td>
                        <td className="px-4 py-2">
                          {reading.withinRange ? (
                            <span className="text-green-600">✓ Geçerli</span>
                          ) : (
                            <span className="text-orange-600">⚠️ Aralık dışı</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Sonuç */}
              {result && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
                    <div className="text-sm opacity-90 mb-1">Ortalama Konsantrasyon</div>
                    <div className="text-4xl font-bold">
                      {result.average.toFixed(3)} {result.unit}
                    </div>
                    <div className="text-sm opacity-90 mt-2">
                      Std Dev: ± {result.stdDev.toFixed(3)} • CV: {result.cv.toFixed(1)}%
                    </div>
                  </div>
                  
                  {result.warning && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="text-yellow-800">{result.warning}</div>
                    </div>
                  )}
                  
                  {result.cv > 10 && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                      <div className="text-orange-800">
                        ⚠️ Yüksek varyasyon! (CV &gt; 10%) Ölçümleri kontrol edin.
                      </div>
                    </div>
                  )}
                  
                  {tankId && (
                    <button
                      onClick={transferToTank}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Tank {tankId}'e Aktar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* KALİBRASYON YÖNETİMİ EKRANI */}
      {activeView === 'calibrations' && !editingCalibration && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">🎯 Kalibrasyon Eğrileri</h3>
              <button
                onClick={startNewCalibration}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Yeni Kalibrasyon
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(calibrations).map(([methodId, cal]) => (
                <div key={methodId} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-lg">{cal.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Dalga boyu:</strong> {cal.wavelength} nm •{' '}
                        <strong>R²:</strong> {cal.rSquared.toFixed(4)} •{' '}
                        <strong>Aralık:</strong> {cal.range.min} - {cal.range.max} {cal.unit}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Denklem:</strong> {cal.equation}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Standartlar:</strong> {cal.standards.length} nokta
                      </div>
                      {cal.lastUsed && (
                        <div className="text-xs text-gray-500 mt-1">
                          Son kullanım: {new Date(cal.lastUsed).toLocaleString('tr-TR')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => { setEditingCalibration(cal); setIsNewCalibration(false); }}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200 transition-colors"
                        title="Düzenle"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetCalibration(methodId)}
                        className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded hover:bg-yellow-200 transition-colors"
                        title="Fabrika ayarlarına sıfırla"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCalibration(methodId)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* KALİBRASYON EDİTÖR */}
      {activeView === 'calibrations' && editingCalibration && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold mb-6">
              {isNewCalibration ? '🆕 Yeni Kalibrasyon' : '✏️ Kalibrasyonu Düzenle'}
            </h3>
            
            <div className="space-y-4">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kalibrasyon Adı
                  </label>
                  <input
                    type="text"
                    value={editingCalibration.name}
                    onChange={(e) => setEditingCalibration({...editingCalibration, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Custom Phosphate Method"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dalga Boyu (nm)
                  </label>
                  <input
                    type="number"
                    value={editingCalibration.wavelength}
                    onChange={(e) => setEditingCalibration({...editingCalibration, wavelength: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: 880"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birim
                  </label>
                  <input
                    type="text"
                    value={editingCalibration.unit}
                    onChange={(e) => setEditingCalibration({...editingCalibration, unit: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: mg/L PO4-P"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notlar
                  </label>
                  <textarea
                    value={editingCalibration.notes}
                    onChange={(e) => setEditingCalibration({...editingCalibration, notes: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Protokol notları, özel uyarılar vs."
                  />
                </div>
              </div>
              
              {/* Standart Noktalar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Standart Noktalar (en az 2 gerekli)
                  </label>
                  <button
                    onClick={addStandard}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Nokta Ekle
                  </button>
                </div>
                
                <div className="space-y-2">
                  {editingCalibration.standards.map((std, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                      <div className="font-bold text-gray-600 w-8">#{idx + 1}</div>
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.001"
                          value={std.concentration}
                          onChange={(e) => updateStandard(idx, 'concentration', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Konsantrasyon"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          step="0.001"
                          value={std.absorbance}
                          onChange={(e) => updateStandard(idx, 'absorbance', e.target.value)}
                          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Absorbans"
                        />
                      </div>
                      <button
                        onClick={() => removeStandard(idx)}
                        disabled={editingCalibration.standards.length <= 2}
                        className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Önizleme - Regresyon hesapla */}
              {editingCalibration.standards.length >= 2 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="font-bold text-blue-800 mb-2">📊 Regresyon Önizleme</div>
                  {(() => {
                    try {
                      const regression = calculateLinearRegression(editingCalibration.standards);
                      const quality = evaluateCalibrationQuality(regression.rSquared, editingCalibration.standards.length);
                      
                      return (
                        <div className="space-y-2 text-sm">
                          <div><strong>Denklem:</strong> {regression.equation}</div>
                          <div><strong>R²:</strong> {regression.rSquared.toFixed(6)}</div>
                          <div className={`p-2 rounded ${
                            quality.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                            quality.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                            quality.quality === 'acceptable' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {quality.recommendation}
                          </div>
                        </div>
                      );
                    } catch (error) {
                      return <div className="text-red-600">⚠️ {error.message}</div>;
                    }
                  })()}
                </div>
              )}
              
              {/* Butonlar */}
              <div className="flex gap-3">
                <button
                  onClick={saveCalibration}
                  disabled={editingCalibration.standards.length < 2 || !editingCalibration.name}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Kaydet
                </button>
                <button
                  onClick={() => { setEditingCalibration(null); setIsNewCalibration(false); }}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpectroCalculator;
