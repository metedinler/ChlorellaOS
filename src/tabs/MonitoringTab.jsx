import React, { useState, useEffect } from 'react';
import { Thermometer, Droplet, Waves, Eye, TestTube, Clock, Save, Plus, Trash2, Camera, AlertTriangle, BookOpen, Activity } from 'lucide-react';
import { tankSystem } from '../data/systemData';
import { monitoringParameters } from '../data/systemDataExtended';
import RiskAssessment from '../components/RiskAssessment';
import LabJournal from '../components/LabJournal';
import modelManager from '../managers/ModelManager';

const MonitoringTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('measurement'); // measurement, risk, lab-journal
  const [entryMode, setEntryMode] = useState('classic'); // classic or quick
  const [selectedTank, setSelectedTank] = useState('');
  const [measurementTime, setMeasurementTime] = useState('morning'); // morning or evening
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurements, setMeasurements] = useState({});
  const [savedRecords, setSavedRecords] = useState([]);
  const [notes, setNotes] = useState('');
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [riskAlarms, setRiskAlarms] = useState([]);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // Hızlı Giriş için state
  const [quickData, setQuickData] = useState({});
  const [selectedParams, setSelectedParams] = useState({
    // Varsayılan olarak temel ve kritik parametreler seçili
    pH: true,
    temperature: true,
    TDS: true,
    DO: true,
    OD680: true,
    OD750: true,
    luxFront: true,
    cellDensity: true
  });

  // LocalStorage'dan kayıtları yükle
  useEffect(() => {
    const saved = localStorage.getItem('chlorellaMonitoringRecords');
    if (saved) {
      setSavedRecords(JSON.parse(saved));
    }
  }, []);

  // Aktif tankları yükle (Task 5)
  const [activeTanks, setActiveTanks] = useState([]);
  
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      setActiveTanks(allTanks.filter(t => t.active));
    }
  }, []);

  // 🚨 Risk alarm kontrolü (Task 25)
  useEffect(() => {
    const checkRiskAlarms = () => {
      const alarms = [];
      
      activeTanks.forEach(tank => {
        const state = modelManager.getTankState(tank.id);
        
        if (state && state.riskHistory && state.riskHistory.length > 0) {
          const latestRisk = state.riskHistory[state.riskHistory.length - 1];
          const CRI = latestRisk.CRI;
          
          if (CRI >= 0.6) {
            alarms.push({
              tankId: tank.id,
              level: 'CRITICAL',
              message: `Tank ${tank.id}: KRİTİK DURUM! CRI ${(CRI * 100).toFixed(0)}%`,
              CRI
            });
          } else if (CRI >= 0.4) {
            alarms.push({
              tankId: tank.id,
              level: 'WARNING',
              message: `Tank ${tank.id}: UYARI - CRI ${(CRI * 100).toFixed(0)}%`,
              CRI
            });
          }
        }
      });
      
      setRiskAlarms(alarms);
    };

    checkRiskAlarms();
    
    // Her 5 dakikada bir kontrol et
    const interval = setInterval(checkRiskAlarms, 5 * 60 * 1000);
    
    // SimulationWorker'dan event dinle
    const handleSimulationCompleted = () => {
      checkRiskAlarms();
    };
    
    window.addEventListener('simulation-completed', handleSimulationCompleted);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-completed', handleSimulationCompleted);
    };
  }, [activeTanks]);

  // Kayıtları LocalStorage'a kaydet
  const saveRecord = () => {
    if (!selectedTank) {
      alert('Lütfen bir tank seçin!');
      return;
    }

    const record = {
      id: Date.now(),
      date: currentDate,
      time: measurementTime,
      tankId: selectedTank,
      measurements: { ...measurements },
      notes: notes,
      timestamp: new Date().toISOString()
    };

    const newRecords = [record, ...savedRecords];
    setSavedRecords(newRecords);
    localStorage.setItem('chlorellaMonitoringRecords', JSON.stringify(newRecords));
    
    // ModelManager'a ölçümü kaydet (LearningEngine ile kalibrasyon)
    if (measurements.pH || measurements.temp || measurements.OD750) {
      try {
        modelManager.addMeasurement(selectedTank, {
          date: currentDate,
          type: 'manual',
          pH: measurements.pH,
          temperature: measurements.temp,
          OD750: measurements.OD750,
          cellDensity: measurements.cellDensity,
          alkalinity: measurements.alkalinity,
          TAN: measurements.TAN,
          NO3: measurements.nitrate,
          NO2: measurements.nitrite,
          DO: measurements.DO,
          notes: notes
        });
        console.log(`✅ Ölçüm ModelManager'a kaydedildi (Tank ${selectedTank})`);
      } catch (error) {
        console.error('❌ ModelManager kayıt hatası:', error);
      }
    }
    
    // Formu temizle
    setMeasurements({});
    setNotes('');
    alert('Kayıt başarıyla eklendi!');
  };

  // Kayıt sil
  const deleteRecord = (id) => {
    const newRecords = savedRecords.filter(r => r.id !== id);
    setSavedRecords(newRecords);
    localStorage.setItem('chlorellaMonitoringRecords', JSON.stringify(newRecords));
  };

  // Kayıt düzenlemeye başla
  const startEditRecord = (record) => {
    setEditingRecordId(record.id);
    setEditingData({ ...record });
  };

  // Düzenleme iptal
  const cancelEdit = () => {
    setEditingRecordId(null);
    setEditingData(null);
  };

  // Kayıt güncelle
  const updateRecord = () => {
    if (!editingData) return;

    const updatedRecords = savedRecords.map(r => 
      r.id === editingRecordId ? editingData : r
    );
    
    setSavedRecords(updatedRecords);
    localStorage.setItem('chlorellaMonitoringRecords', JSON.stringify(updatedRecords));
    
    // ModelManager'a güncellenmiş ölçümü kaydet
    if (editingData.measurements.pH || editingData.measurements.temp || editingData.measurements.OD750) {
      try {
        modelManager.addMeasurement(editingData.tankId, {
          date: editingData.date,
          type: 'manual',
          pH: editingData.measurements.pH,
          temperature: editingData.measurements.temp,
          OD750: editingData.measurements.OD750,
          cellDensity: editingData.measurements.cellDensity,
          alkalinity: editingData.measurements.alkalinity,
          TAN: editingData.measurements.TAN,
          NO3: editingData.measurements.nitrate,
          NO2: editingData.measurements.nitrite,
          DO: editingData.measurements.DO,
          notes: editingData.notes
        });
        console.log(`✅ Güncellenen ölçüm ModelManager'a kaydedildi (Tank ${editingData.tankId})`);
      } catch (error) {
        console.error('❌ ModelManager güncelleme hatası:', error);
      }
    }
    
    setEditingRecordId(null);
    setEditingData(null);
    alert('Kayıt başarıyla güncellendi!');
  };

  // Düzenleme sırasında değer güncelle
  const updateEditingMeasurement = (key, value) => {
    setEditingData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [key]: parseFloat(value) || 0
      }
    }));
  };

  // Parametre değerini güncelle
  const updateMeasurement = (key, value) => {
    setMeasurements(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  // Hızlı Giriş: Tank verisini güncelle
  const updateQuickData = (tankId, key, value) => {
    setQuickData(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        [key]: value ? parseFloat(value) : ''
      }
    }));
  };

  // Hızlı Giriş: Tüm tank verilerini kaydet
  const saveQuickData = () => {
    let saveCount = 0;
    const newRecords = [];

    activeTanks.forEach(tank => {
      const tankData = quickData[tank.id];
      if (!tankData || Object.keys(tankData).length === 0) return;

      // En az bir parametre girilmiş mi kontrol et
      const hasData = Object.values(tankData).some(v => v !== '' && v !== null && v !== undefined);
      if (!hasData) return;

      const record = {
        id: Date.now() + saveCount, // Benzersiz ID
        date: currentDate,
        time: measurementTime,
        tankId: tank.id,
        measurements: { ...tankData },
        notes: `Hızlı giriş - ${Object.keys(selectedParams).filter(k => selectedParams[k]).length} parametre`,
        timestamp: new Date().toISOString(),
        source: 'quick-entry'
      };

      newRecords.push(record);
      saveCount++;

      // ModelManager'a kaydet
      if (tankData.pH || tankData.temperature || Object.keys(tankData).some(k => k.startsWith('OD'))) {
        try {
          const measurementData = {
            date: currentDate,
            type: 'manual-quick',
            ...tankData, // Tüm verileri aktar
            notes: record.notes
          };

          modelManager.addMeasurement(tank.id, measurementData);
        } catch (error) {
          console.error(`❌ ModelManager kayıt hatası (Tank ${tank.id}):`, error);
        }
      }
    });

    if (saveCount > 0) {
      const updatedRecords = [...newRecords, ...savedRecords];
      setSavedRecords(updatedRecords);
      localStorage.setItem('chlorellaMonitoringRecords', JSON.stringify(updatedRecords));
      
      // Formu temizle
      setQuickData({});
      alert(`✅ ${saveCount} tank verisi kaydedildi!`);
    } else {
      alert('⚠️ Lütfen en az bir tank için veri girin!');
    }
  };

  // Parametre seçimi toggle
  const toggleParam = (paramKey) => {
    setSelectedParams(prev => ({
      ...prev,
      [paramKey]: !prev[paramKey]
    }));
  };

  // Parametre status rengi
  const getParamStatus = (key, value) => {
    const allParams = [...monitoringParameters.primary, ...monitoringParameters.optical, 
                       ...monitoringParameters.chemical, ...monitoringParameters.biological];
    const param = allParams.find(p => p.key === key);
    if (!param || !value) return 'gray';
    
    if (value >= param.min && value <= param.max) {
      if (Math.abs(value - param.optimal) / param.optimal < 0.15) return 'green';
      return 'yellow';
    }
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🔬 Tank İzleme & Günlük Ölçüm</h2>
        <p className="text-blue-100">pH, TDS, Absorbans, Hücre Sayısı ve diğer parametreleri kaydedin</p>
      </div>

      {/* 🚨 Risk Alarmları (Task 25) */}
      {riskAlarms.length > 0 && (
        <div className="space-y-3">
          {riskAlarms.map((alarm, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-4 flex items-center justify-between ${
                alarm.level === 'CRITICAL'
                  ? 'bg-red-50 border-2 border-red-500'
                  : 'bg-yellow-50 border-2 border-yellow-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${
                  alarm.level === 'CRITICAL' ? 'text-red-600 animate-pulse' : 'text-yellow-600'
                }`} />
                <div>
                  <div className={`font-bold ${
                    alarm.level === 'CRITICAL' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {alarm.message}
                  </div>
                  <div className={`text-sm ${
                    alarm.level === 'CRITICAL' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alarm.level === 'CRITICAL' 
                      ? 'Acil müdahale gerekiyor! Risk değerlendirmesine bakın.'
                      : 'Durumu izleyin, müdahale gerekebilir.'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTank(alarm.tankId);
                  setActiveSubTab('risk');
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  alarm.level === 'CRITICAL'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                Risk Analizi
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ALT SEKME NAVİGASYONU */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab('measurement')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeSubTab === 'measurement'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TestTube className="w-5 h-5" />
            Ölçüm Girişi
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/20">📊 Hızlı</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('risk')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeSubTab === 'risk'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Risk Değerlendirmesi
          </button>
          
          <button
            onClick={() => setActiveSubTab('lab-journal')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeSubTab === 'lab-journal'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Lab Defteri
          </button>
        </div>
      </div>

      {/* SEKME İÇERİĞİ */}
      {activeSubTab === 'measurement' && (
        <div className="space-y-6">
          {/* ÖLÇÜM GİRİŞİ MOD SEÇİCİ */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex gap-3">
              <button
                onClick={() => setEntryMode('classic')}
                className={`flex-1 px-6 py-4 rounded-lg font-semibold transition ${
                  entryMode === 'classic'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <TestTube className="w-6 h-6" />
                  <span>Klasik Giriş</span>
                  <span className="text-xs opacity-75">Tek tank, detaylı parametreler</span>
                </div>
              </button>
              
              <button
                onClick={() => setEntryMode('quick')}
                className={`flex-1 px-6 py-4 rounded-lg font-semibold transition ${
                  entryMode === 'quick'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Activity className="w-6 h-6" />
                  <span>Hızlı Giriş</span>
                  <span className="text-xs opacity-75">Çoklu tank, tablo görünümü</span>
                </div>
              </button>
            </div>
          </div>

          {/* HIZLI GİRİŞ MODU */}
          {entryMode === 'quick' && (
            <div className="space-y-6">
              {/* Tarih ve Zaman */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Hızlı Veri Girişi - Tüm Tanklar
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                    <input
                      type="date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ölçüm Zamanı</label>
                    <select
                      value={measurementTime}
                      onChange={(e) => setMeasurementTime(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="morning">Sabah Ölçümü</option>
                      <option value="evening">Akşam Ölçümü</option>
                    </select>
                  </div>
                </div>

                {/* PARAMETRE SEÇİMİ */}
                <div className="bg-purple-50 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    📊 Ölçülecek Parametreler (Seçili olanlar tabloda gösterilecek):
                  </label>
                  
                  {/* Temel Parametreler */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Temel Parametreler:</p>
                    <div className="flex flex-wrap gap-2">
                      {monitoringParameters.primary.map(param => (
                        <label key={param.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParams[param.key] || false}
                            onChange={() => toggleParam(param.key)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedParams[param.key]
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {param.name} ({param.unit})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Optik Ölçümler */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Optik Ölçümler (Absorbans):</p>
                    <div className="flex flex-wrap gap-2">
                      {monitoringParameters.optical.map(param => (
                        <label key={param.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParams[param.key] || false}
                            onChange={() => toggleParam(param.key)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedParams[param.key]
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {param.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Işık Parametreleri */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Işık ve Fotoperyot:</p>
                    <div className="flex flex-wrap gap-2">
                      {monitoringParameters.light.map(param => (
                        <label key={param.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParams[param.key] || false}
                            onChange={() => toggleParam(param.key)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedParams[param.key]
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {param.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Kimyasal Parametreler */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-purple-700 mb-2">Kimyasal Analizler:</p>
                    <div className="flex flex-wrap gap-2">
                      {monitoringParameters.chemical.map(param => (
                        <label key={param.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParams[param.key] || false}
                            onChange={() => toggleParam(param.key)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedParams[param.key]
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {param.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Biyolojik Parametreler */}
                  <div>
                    <p className="text-xs font-semibold text-purple-700 mb-2">Biyolojik Parametreler:</p>
                    <div className="flex flex-wrap gap-2">
                      {monitoringParameters.biological.map(param => (
                        <label key={param.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedParams[param.key] || false}
                            onChange={() => toggleParam(param.key)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                            selectedParams[param.key]
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {param.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3">
                    ℹ️ Seçili parametreler tüm tanklar için tabloda gösterilecek. Hiçbir parametre seçilmezse tablo boş olacaktır.
                  </p>
                </div>

                {/* Veri Tablosu */}
                {activeTanks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>⚠️ Aktif tank yok</p>
                    <p className="text-sm mt-2">Tank Yönetimi sekmesinden tank aktifleştirin</p>
                  </div>
                ) : Object.keys(selectedParams).filter(k => selectedParams[k]).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>⚠️ Hiçbir parametre seçilmedi</p>
                    <p className="text-sm mt-2">Yukarıdaki checkbox'lardan en az bir parametre seçin</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          <th className="border border-purple-700 px-3 py-2 text-left font-semibold sticky left-0 bg-purple-600 z-10">Tank</th>
                          {[...monitoringParameters.primary, ...monitoringParameters.optical, ...monitoringParameters.light, ...monitoringParameters.chemical, ...monitoringParameters.biological].filter(p => selectedParams[p.key]).map(param => (
                            <th key={param.key} className="border border-purple-700 px-3 py-2 text-center font-semibold">
                              {param.name}
                              {param.unit && <><br/><span className="text-xs opacity-75">({param.unit})</span></>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeTanks.map((tank, idx) => (
                          <tr key={tank.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                            <td className="border border-gray-300 px-3 py-2 font-semibold text-purple-700 sticky left-0 z-10" style={{backgroundColor: idx % 2 === 0 ? 'white' : 'rgb(250 245 255)'}}>
                              {tank.id}
                              <div className="text-xs text-gray-500">{tank.volume}L</div>
                            </td>
                            {[...monitoringParameters.primary, ...monitoringParameters.optical, ...monitoringParameters.light, ...monitoringParameters.chemical, ...monitoringParameters.biological].filter(p => selectedParams[p.key]).map(param => (
                              <td key={param.key} className="border border-gray-300 px-2 py-2">
                                <input
                                  type="number"
                                  step={param.key.includes('pH') ? '0.01' : param.key.includes('OD') ? '0.001' : param.key.includes('lux') ? '10' : '0.1'}
                                  placeholder={param.optimal.toString()}
                                  value={quickData[tank.id]?.[param.key] || ''}
                                  onChange={(e) => updateQuickData(tank.id, param.key, e.target.value)}
                                  className="w-24 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-purple-500 text-sm"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Kaydet Butonu */}
                <button
                  onClick={saveQuickData}
                  disabled={activeTanks.length === 0}
                  className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Tüm Tank Verilerini Kaydet
                </button>
              </div>
            </div>
          )}

          {/* KLASİK GİRİŞ MODU */}
          {entryMode === 'classic' && (
            <div className="space-y-6">
          {/* ÖLÇÜM GİRİŞİ - ESKİ SISTEM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel: Ölçüm Girişi */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tank ve Zaman Seçimi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Ölçüm Bilgileri
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zaman</label>
                <select
                  value={measurementTime}
                  onChange={(e) => setMeasurementTime(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="morning">Sabah</option>
                  <option value="evening">Akşam</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tank</label>
                <select
                  value={selectedTank}
                  onChange={(e) => setSelectedTank(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tank Seçin...</option>
                  {activeTanks.length > 0 ? (
                    activeTanks.map(tank => (
                      <option key={tank.id} value={tank.id}>
                        {tank.id} ({tank.volume}L - {tank.medium || 'Besin Yeri Seçilmemiş'})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Aktif tank yok (Tanklar sekmesinden tank aktifleştirin)</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Temel Parametreler */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Temel Parametreler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {monitoringParameters.primary.map(param => (
                <div key={param.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.name} ({param.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements[param.key] || ''}
                    onChange={(e) => updateMeasurement(param.key, e.target.value)}
                    placeholder={`Optimal: ${param.optimal}`}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                      ${measurements[param.key] ? `border-${getParamStatus(param.key, measurements[param.key])}-500` : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Optik Ölçümler */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Optik Ölçümler (Absorbans & Renk)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {monitoringParameters.optical.map(param => (
                <div key={param.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.name}
                    {param.note && <span className="text-xs text-gray-500 block">{param.note}</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={measurements[param.key] || ''}
                    onChange={(e) => updateMeasurement(param.key, e.target.value)}
                    placeholder={`Optimal: ${param.optimal}`}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kimyasal Analizler */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-green-600" />
              Kimyasal Analizler (TAN, TP, Alkalinite)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {monitoringParameters.chemical.map(param => (
                <div key={param.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.name}
                    {param.note && <span className="text-xs text-gray-500 block">{param.note}</span>}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements[param.key] || ''}
                    onChange={(e) => updateMeasurement(param.key, e.target.value)}
                    placeholder={`Optimal: ${param.optimal} ${param.unit}`}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Biyolojik Parametreler */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Biyolojik Parametreler</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {monitoringParameters.biological.map(param => (
                <div key={param.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.name}
                    {param.note && <span className="text-xs text-gray-500 block">{param.note}</span>}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={measurements[param.key] || ''}
                    onChange={(e) => updateMeasurement(param.key, e.target.value)}
                    placeholder={`Optimal: ${param.optimal}`}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notlar ve Kaydet */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notlar & Gözlemler</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Tankın durumu, renk değişimi, gözlemler..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            <button
              onClick={saveRecord}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Kaydı Kaydet
            </button>
          </div>
        </div>

        {/* Sağ Panel: Kayıtlar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Son Kayıtlar</h3>
            
            {savedRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz kayıt yok</p>
            ) : (
              <div className="space-y-3 max-h-[800px] overflow-y-auto">
                {savedRecords.slice(0, 20).map(record => (
                  <div key={record.id} className="border rounded-lg p-3 hover:shadow-md transition">
                    {editingRecordId === record.id ? (
                      // EDIT MODE
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-semibold text-blue-600">Düzenleniyor</p>
                        </div>
                        
                        {/* Tarih, Zaman ve Tank */}
                        <div className="grid grid-cols-3 gap-2 pb-3 border-b">
                          <div>
                            <label className="text-xs font-medium text-gray-700">Tarih</label>
                            <input
                              type="date"
                              value={editingData.date}
                              onChange={(e) => setEditingData(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Zaman</label>
                            <select
                              value={editingData.time}
                              onChange={(e) => setEditingData(prev => ({ ...prev, time: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              <option value="morning">Sabah</option>
                              <option value="evening">Akşam</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Tank</label>
                            <select
                              value={editingData.tankId}
                              onChange={(e) => setEditingData(prev => ({ ...prev, tankId: e.target.value }))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              {activeTanks.map(tank => (
                                <option key={tank.id} value={tank.id}>
                                  {tank.id}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        {/* Temel parametreler */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium text-gray-700">Sıcaklık (°C)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingData.measurements.temp || ''}
                              onChange={(e) => updateEditingMeasurement('temp', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">pH</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingData.measurements.pH || ''}
                              onChange={(e) => updateEditingMeasurement('pH', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">TDS (ppm)</label>
                            <input
                              type="number"
                              step="1"
                              value={editingData.measurements.TDS || ''}
                              onChange={(e) => updateEditingMeasurement('TDS', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">DO (mg/L)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingData.measurements.DO || ''}
                              onChange={(e) => updateEditingMeasurement('DO', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">OD680</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingData.measurements.OD680 || ''}
                              onChange={(e) => updateEditingMeasurement('OD680', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">OD750</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingData.measurements.OD750 || ''}
                              onChange={(e) => updateEditingMeasurement('OD750', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Hücre (10⁶/mL)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingData.measurements.cellDensity || ''}
                              onChange={(e) => updateEditingMeasurement('cellDensity', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">TAN (mg/L)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingData.measurements.TAN || ''}
                              onChange={(e) => updateEditingMeasurement('TAN', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Nitrat (mg/L)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={editingData.measurements.nitrate || ''}
                              onChange={(e) => updateEditingMeasurement('nitrate', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Nitrit (mg/L)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingData.measurements.nitrite || ''}
                              onChange={(e) => updateEditingMeasurement('nitrite', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">Alkalinite (mg/L)</label>
                            <input
                              type="number"
                              step="1"
                              value={editingData.measurements.alkalinity || ''}
                              onChange={(e) => updateEditingMeasurement('alkalinity', e.target.value)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                        </div>
                        
                        {/* Notlar */}
                        <div>
                          <label className="text-xs font-medium text-gray-700">Notlar</label>
                          <textarea
                            value={editingData.notes || ''}
                            onChange={(e) => setEditingData(prev => ({ ...prev, notes: e.target.value }))}
                            rows="2"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        
                        {/* Kaydet/İptal butonları */}
                        <div className="flex gap-2">
                          <button
                            onClick={updateRecord}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Kaydet
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex-1 bg-gray-400 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-gray-500 transition"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      // NORMAL VIEW MODE
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-blue-600">{record.tankId}</p>
                            <p className="text-xs text-gray-500">
                              {record.date} - {record.time === 'morning' ? 'Sabah' : 'Akşam'}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEditRecord(record)}
                              className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded transition"
                              title="Düzenle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {record.measurements.temp && (
                            <p>🌡 {record.measurements.temp}°C</p>
                          )}
                          {record.measurements.pH && (
                            <p>💧 pH: {record.measurements.pH}</p>
                          )}
                          {record.measurements.TDS && (
                            <p>🌊 TDS: {record.measurements.TDS}</p>
                          )}
                          {record.measurements.OD680 && (
                            <p>👁 OD680: {record.measurements.OD680}</p>
                          )}
                          {record.measurements.OD750 && (
                            <p>👁 OD750: {record.measurements.OD750}</p>
                          )}
                          {record.measurements.cellDensity && (
                            <p>🦠 {record.measurements.cellDensity}×10⁶/mL</p>
                          )}
                          {record.measurements.DO && (
                            <p>🫧 DO: {record.measurements.DO} mg/L</p>
                          )}
                          {record.measurements.TAN && (
                            <p>🧪 TAN: {record.measurements.TAN} mg/L</p>
                          )}
                        </div>
                        
                        {record.notes && (
                          <p className="text-xs text-gray-600 mt-2 italic">{record.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
            </div>
          )}
        </div>
      )}

      {/* RİSK DEĞERLENDİRMESİ SEKMESİ */}
      {activeSubTab === 'risk' && (
        <div className="space-y-6">
          {/* TANK ÖZET TABLOSU */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Tüm Tanklar Risk Durumu
            </h3>
            
            {activeTanks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>⚠️ Aktif tank yok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
                      <th className="border border-red-700 px-4 py-3 text-left font-semibold">Tank Kodu</th>
                      <th className="border border-red-700 px-4 py-3 text-left font-semibold">Tank Adı</th>
                      <th className="border border-red-700 px-4 py-3 text-center font-semibold">CRI (%)</th>
                      <th className="border border-red-700 px-4 py-3 text-center font-semibold">Risk Seviyesi</th>
                      <th className="border border-red-700 px-4 py-3 text-left font-semibold">Kritik Uyarılar</th>
                      <th className="border border-red-700 px-4 py-3 text-center font-semibold">Son Güncelleme</th>
                      <th className="border border-red-700 px-4 py-3 text-center font-semibold">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTanks.map((tank, idx) => {
                      const tankState = modelManager.getTankState(tank.id);
                      const latestRisk = tankState?.riskHistory?.[tankState.riskHistory.length - 1];
                      const CRI = latestRisk?.CRI || 0;
                      const CRIPercent = (CRI * 100).toFixed(0);
                      
                      // Risk seviyesi belirle
                      let riskLevel = { emoji: '🟢', text: 'Düşük', color: 'text-green-600', bg: 'bg-green-50' };
                      if (CRI >= 0.6) {
                        riskLevel = { emoji: '🔴', text: 'Yüksek', color: 'text-red-600', bg: 'bg-red-50' };
                      } else if (CRI >= 0.4) {
                        riskLevel = { emoji: '🟡', text: 'Orta', color: 'text-yellow-600', bg: 'bg-yellow-50' };
                      }
                      
                      // Kritik uyarılar (>50% risk)
                      const criticalRisks = latestRisk ? Object.entries(latestRisk.factors || {})
                        .filter(([_, value]) => value > 0.5)
                        .map(([key, _]) => {
                          const names = {
                            tempRisk: 'Sıcaklık',
                            phRisk: 'pH',
                            oxygenRisk: 'Oksijen',
                            nutrientRisk: 'Besin',
                            lightRisk: 'Işık',
                            densityRisk: 'Yoğunluk',
                            contaminationRisk: 'Kontaminasyon',
                            growthRisk: 'Büyüme'
                          };
                          return names[key] || key;
                        })
                        .slice(0, 3) : [];
                      
                      const moreCount = latestRisk ? Object.values(latestRisk.factors || {}).filter(v => v > 0.5).length - 3 : 0;
                      
                      return (
                        <tr key={tank.id} 
                            className={`${idx % 2 === 0 ? 'bg-white' : riskLevel.bg} hover:bg-blue-50 transition cursor-pointer border-l-4 ${
                              selectedTank === tank.id ? 'border-blue-600 bg-blue-50' : 'border-transparent'
                            }`}
                            onClick={() => setSelectedTank(tank.id)}>
                          <td className="border border-gray-300 px-4 py-3 font-bold text-purple-700">
                            {tank.customName || `KA${idx + 1}`}
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="font-semibold">{tank.name || tank.id}</div>
                            <div className="text-xs text-gray-500">{tank.volume}L - {tank.category || 'Üretim'}</div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold ${
                              CRI >= 0.6 ? 'bg-red-100 text-red-700' :
                              CRI >= 0.4 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {CRIPercent}%
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`font-semibold ${riskLevel.color}`}>
                              {riskLevel.emoji} {riskLevel.text}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            {criticalRisks.length === 0 ? (
                              <span className="text-gray-400 text-sm italic">Risk yok</span>
                            ) : (
                              <div className="text-sm">
                                {criticalRisks.map((risk, i) => (
                                  <span key={i} className="inline-block bg-red-100 text-red-700 px-2 py-0.5 rounded mr-1 mb-1 text-xs font-medium">
                                    ⚠️ {risk}
                                  </span>
                                ))}
                                {moreCount > 0 && (
                                  <span className="text-red-600 text-xs font-medium">+{moreCount} daha</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-xs text-gray-600">
                            {latestRisk?.timestamp ? new Date(latestRisk.timestamp).toLocaleString('tr-TR') : 'Veri yok'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            {selectedTank === tank.id ? (
                              <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold">
                                ✓ Seçili
                              </span>
                            ) : (
                              <span className="text-blue-600 text-xs font-medium">
                                Tıkla →
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DETAYLI RİSK ANALİZİ */}
          {selectedTank ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-blue-600" />
                  Detaylı Risk Analizi - {activeTanks.find(t => t.id === selectedTank)?.customName || selectedTank}
                </h3>
                <button
                  onClick={() => setSelectedTank('')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300 transition"
                >
                  ✕ Kapat
                </button>
              </div>
              <RiskAssessment tankId={selectedTank} />
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
              <Activity className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Tank Seçin</h3>
              <p className="text-gray-600">
                Detaylı risk analizi görmek için yukarıdaki tablodan bir tank seçin
              </p>
            </div>
          )}
        </div>
      )}

      {/* LAB DEFTERİ SEKMESİ */}
      {activeSubTab === 'lab-journal' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <LabJournal tankId={selectedTank} />
        </div>
      )}
    </div>
  );
};

export default MonitoringTab;
