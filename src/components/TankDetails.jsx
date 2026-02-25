import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Droplet, Thermometer, Beaker, Plus, TrendingUp, Syringe, FlaskConical } from 'lucide-react';
import { addIntervention, getInterventionsByTank } from '../utils/interventionManager';
import { getChemicalDisplayName } from '../utils/chemicalNames';
import { ensureKnowledgeDatabases, getSpecialStocks } from '../utils/knowledgeDatabase';

const TankDetails = () => {
  const [selectedTank, setSelectedTank] = useState('');
  const [activeTanks, setActiveTanks] = useState([]);
  const [showAddParam, setShowAddParam] = useState(false);
  const [showAddIntervention, setShowAddIntervention] = useState(false);
  const [showFedBatch, setShowFedBatch] = useState(false);
  const [interventions, setInterventions] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);

  const fallbackPhStocks = [
    {
      id: 'fallback_hcl_0_1m',
      name: 'HCl Stok (0.1M)',
      concentration: '0.1 M',
      preparation: '100 ml HCl (%37) + 900 ml distile su',
      category: 'pH',
      molarMass: 36.5,
      molarity: 0.1,
      compatibleInterventions: ['pH', 'pH_stock']
    },
    {
      id: 'fallback_carbonate_0_1m',
      name: 'Karbonat Stok (Na2CO3 0.1M)',
      concentration: '0.1 M',
      preparation: '10.6 g Na2CO3 + 1L distile su',
      category: 'pH',
      molarMass: 106,
      molarity: 0.1,
      compatibleInterventions: ['pH', 'pH_stock']
    }
  ];

  const loadAvailableStocks = () => {
    ensureKnowledgeDatabases();
    const seedStocks = getSpecialStocks();

    let formulationStocks = [];
    try {
      const formulations = JSON.parse(localStorage.getItem('customFormulations') || '[]');
      if (Array.isArray(formulations)) {
        formulationStocks = formulations.flatMap((formulation) => {
          const stocks = Array.isArray(formulation?.stocks) ? formulation.stocks : [];
          return stocks.map((stock) => ({
            id: `form_${formulation.id || 'unknown'}_${stock.id || stock.name}`,
            name: stock?.name || 'Adsız Stok',
            concentration: `${Number(stock?.usageRatio || 0)} ml/L kullanım`,
            preparation: `${Number(stock?.finalVolume || 0)} L final stok hacmi`,
            category: 'formulation',
            source: 'formulation',
            formulationName: formulation?.name || 'Özel Formülasyon',
            compatibleInterventions: ['fedbatch', 'chemical_dosage', 'pH', 'pH_stock']
          }));
        });
      }
    } catch (error) {
      console.warn('customFormulations stokları okunamadı:', error);
    }

    const merged = [...fallbackPhStocks, ...(Array.isArray(seedStocks) ? seedStocks : []), ...formulationStocks];
    const seen = new Set();
    const deduped = merged.filter((item) => {
      const key = `${item?.id || ''}_${item?.name || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setAvailableStocks(deduped);
  };

  const getUnifiedInterventions = (tankId) => {
    if (!tankId) return [];

    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    const tankDetailsInterventions = Array.isArray(allData?.[tankId]?.interventions)
      ? allData[tankId].interventions
      : [];

    const mappedTankDetails = tankDetailsInterventions.map((item, index) => ({
      id: item.id || `TD-${tankId}-${index}-${item.timestamp || item.date || Date.now()}`,
      source: 'tankDetails',
      type: item.type === 'hcl' || item.type === 'carbonate' ? 'pH_stock' : (item.type || 'other'),
      date: item.timestamp || `${item.date || new Date().toISOString().split('T')[0]}T${item.time || '00:00'}`,
      parameters: {
        stockType: item.type,
        stockName: item.stockName,
        volumeMl: parseFloat(item.volumeMl) || 0,
        phBefore: parseFloat(item.phBefore),
        phAfter: parseFloat(item.phAfter),
        molesUsed: parseFloat(item.molesUsed),
        massUsed: parseFloat(item.massUsed)
      },
      notes: item.notes || ''
    }));

    const managerInterventions = getInterventionsByTank(tankId).map(item => ({
      ...item,
      source: 'interventionManager',
      date: item.date || item.timestamp || new Date().toISOString(),
      parameters: item.parameters || {}
    }));

    const enforcedState = JSON.parse(localStorage.getItem('enforcedChlorellaSystem') || '{}');
    const enforcedInterventions = Array.isArray(enforcedState?.operations?.interventions)
      ? enforcedState.operations.interventions
      : [];

    const mappedEnforced = enforcedInterventions
      .filter(item => item.tankId === tankId)
      .map((item, index) => ({
        id: item.id || `ENF-${tankId}-${index}-${item.timestamp || Date.now()}`,
        source: 'enforced',
        type: item.type || 'other',
        date: item.timestamp || new Date().toISOString(),
        parameters: {
          ...item.details,
          ...(item.result || {})
        },
        notes: item.notes || ''
      }));

    const merged = [...mappedTankDetails, ...managerInterventions, ...mappedEnforced];

    const uniqueMap = new Map();
    merged.forEach(item => {
      const chemicalKey = item.parameters?.chemical || item.parameters?.stockName || '';
      const amountKey = item.parameters?.amount || item.parameters?.volumeMl || '';
      const dedupeKey = `${item.date}-${item.type}-${chemicalKey}-${amountKey}`;
      if (!uniqueMap.has(dedupeKey)) {
        uniqueMap.set(dedupeKey, item);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const loadUnifiedInterventions = (tankId) => {
    setInterventions(getUnifiedInterventions(tankId));
  };

  const loadActiveTanks = () => {
    const tankStates = localStorage.getItem('tankStates');
    if (!tankStates) {
      setActiveTanks([]);
      setSelectedTank('');
      return;
    }

    const allTanks = JSON.parse(tankStates);
    const active = allTanks.filter(t => t.active);
    setActiveTanks(active);

    if (active.length === 0) {
      setSelectedTank('');
      return;
    }

    setSelectedTank((currentSelectedTank) => {
      const currentStillActive = active.some(t => t.id === currentSelectedTank);
      if (!currentSelectedTank || !currentStillActive) {
        return active[0].id;
      }
      return currentSelectedTank;
    });
  };
  
  // Aktif tankları yükle (Task 5)
  useEffect(() => {
    loadActiveTanks();
    loadAvailableStocks();

    const handleTankStatesUpdated = () => loadActiveTanks();
    const handleStorage = (event) => {
      if (!event.key || event.key === 'tankStates') {
        loadActiveTanks();
      }
    };

    window.addEventListener('tankStatesUpdated', handleTankStatesUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('tankStatesUpdated', handleTankStatesUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
  
  // Müdahaleleri yükle
  useEffect(() => {
    if (selectedTank) {
      loadUnifiedInterventions(selectedTank);
    }
  }, [selectedTank]);

  useEffect(() => {
    const handleTankDataUpdate = (event) => {
      if (!selectedTank) return;
      const changedTankId = event?.detail?.tankId;
      if (!changedTankId || changedTankId !== selectedTank) return;
      loadUnifiedInterventions(selectedTank);
    };

    window.addEventListener('tankDataUpdate', handleTankDataUpdate);
    return () => window.removeEventListener('tankDataUpdate', handleTankDataUpdate);
  }, [selectedTank]);
  
  // Su kalite parametresi ekle
  const [newParam, setNewParam] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    ph: 7.0,
    temp: 22,
    do: 0,
    conductivity: 0
  });

  // pH stok müdahalesi
  const [intervention, setIntervention] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    stockId: 'fallback_hcl_0_1m',
    type: 'pH_stock',
    volumeMl: 0,
    phBefore: 0,
    phAfter: 0,
    notes: ''
  });

  const interventionStockMap = availableStocks.reduce((acc, stock) => {
    acc[stock.id] = stock;
    return acc;
  }, {});

  // Tank verilerini LocalStorage'dan yükle
  const getTankData = () => {
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    return allData[selectedTank] || {
      qualityParams: [],
      interventions: [],
      cellCounts: [],
      nutrients: { nitrogen: 0, phosphorus: 0, potassium: 0, magnesium: 0, calcium: 0, sodium: 0, carbon: 0, sulfur: 0 }
    };
  };

  const tankData = getTankData();

  // Su kalite parametresi ekle
  const addQualityParam = () => {
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!allData[selectedTank]) allData[selectedTank] = { qualityParams: [], interventions: [], cellCounts: [], nutrients: {} };
    
    const qualityParam = {
      ...newParam,
      timestamp: new Date().toISOString()
    };
    
    allData[selectedTank].qualityParams.push(qualityParam);
    localStorage.setItem('tankDetails', JSON.stringify(allData));
    
    // 🔥 MODEL'E BİLDİR
    window.dispatchEvent(new CustomEvent('tankDataUpdate', {
      detail: {
        tankId: selectedTank,
        type: 'qualityParam',
        data: {
          ph: parseFloat(newParam.ph),
          temp: parseFloat(newParam.temp),
          do: parseFloat(newParam.do),
          conductivity: parseFloat(newParam.conductivity)
        }
      }
    }));
    
    console.log(`🔔 Model'e kalite parametreleri gönderildi: pH ${newParam.ph}, Temp ${newParam.temp}°C`);
    
    setShowAddParam(false);
    setNewParam({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      ph: 7.0,
      temp: 22,
      do: 0,
      conductivity: 0
    });
  };

  // pH müdahalesi ekle ve stokiyometrik hesapla
  const addPhIntervention = () => {
    if (!selectedTank) {
      alert('⚠️ Lütfen tank seçin!');
      return;
    }

    const vol = parseFloat(intervention.volumeMl);
    const stock = interventionStockMap[intervention.stockId] || fallbackPhStocks[0];
    const stockMolarity = Number(stock?.molarity || 0.1);
    const stockMolarMass = Number(stock?.molarMass || 36.5);
    
    if (isNaN(vol) || vol <= 0) {
      alert('⚠️ Hacim değeri geçersiz!');
      return;
    }

    if (isNaN(intervention.phBefore) || isNaN(intervention.phAfter)) {
      alert('⚠️ pH değerleri geçersiz!');
      return;
    }
    
    // Stokiyometrik hesaplama (basitleştirilmiş)
    const moles = (vol / 1000) * stockMolarity;
    const mass = moles * stockMolarMass;
    
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!allData[selectedTank]) allData[selectedTank] = { qualityParams: [], interventions: [], cellCounts: [], nutrients: {} };
    if (!allData[selectedTank].interventions) allData[selectedTank].interventions = [];
    
    const newIntervention = {
      ...intervention,
      type: 'pH_stock',
      stockName: stock.name,
      molesUsed: moles.toFixed(6),
      massUsed: mass.toFixed(3),
      timestamp: new Date(`${intervention.date}T${intervention.time}`).toISOString()
    };

    allData[selectedTank].interventions.push(newIntervention);
    localStorage.setItem('tankDetails', JSON.stringify(allData));
    
    // 🔥 MODEL'E BİLDİR - pH MÜDAHALESİ
    window.dispatchEvent(new CustomEvent('tankDataUpdate', {
      detail: {
        tankId: selectedTank,
        type: 'intervention',
        data: {
          interventionType: 'pH',
          phBefore: parseFloat(intervention.phBefore),
          phAfter: parseFloat(intervention.phAfter),
          chemical: stock.name,
          volume: vol,
          moles: moles,
          mass: mass,
          timestamp: newIntervention.timestamp
        }
      }
    }));
    
    console.log(`🔔 Model'e pH müdahalesi gönderildi: ${selectedTank}, pH ${intervention.phBefore} → ${intervention.phAfter}`);
    
    setShowAddIntervention(false);
    setIntervention({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: 'pH_stock',
      stockId: 'fallback_hcl_0_1m',
      volumeMl: 0,
      phBefore: 0,
      phAfter: 0,
      notes: ''
    });

    loadUnifiedInterventions(selectedTank);

    alert('✅ pH müdahalesi kaydedildi ve model güncellendi!');
  };

  // Besin elementi güncelle
  const updateNutrient = (element, value) => {
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!allData[selectedTank]) allData[selectedTank] = { qualityParams: [], interventions: [], cellCounts: [], nutrients: {} };
    if (!allData[selectedTank].nutrients) allData[selectedTank].nutrients = {};
    
    allData[selectedTank].nutrients[element] = parseFloat(value);
    localStorage.setItem('tankDetails', JSON.stringify(allData));
    
    // 🔥 MODEL'E BİLDİR
    window.dispatchEvent(new CustomEvent('tankDataUpdate', {
      detail: {
        tankId: selectedTank,
        type: 'nutrient',
        data: allData[selectedTank].nutrients
      }
    }));
    
    console.log(`🔔 Model'e besin güncellemesi gönderildi: ${element} = ${value} mg/L`);
  };

  // Son ölçümler
  const qualityParams = Array.isArray(tankData.qualityParams) ? tankData.qualityParams : [];
  const cellCountRecords = Array.isArray(tankData.cellCounts) ? tankData.cellCounts : [];

  const findLatestNumeric = (records, keys = []) => {
    for (let index = records.length - 1; index >= 0; index -= 1) {
      const record = records[index] || {};
      for (const key of keys) {
        const raw = record?.[key];
        const value = Number(raw);
        if (raw !== undefined && raw !== null && raw !== '' && !Number.isNaN(value)) {
          return value;
        }
      }
    }
    return null;
  };

  const latestCellDensity = findLatestNumeric(
    [...cellCountRecords, ...qualityParams],
    ['cellsPerMl', 'cellDensity', 'hucresayisi', 'cell_count_ml']
  );
  const latestViability = findLatestNumeric(
    [...cellCountRecords, ...qualityParams],
    ['viability', 'canlilik', 'livePercent']
  );
  const latestPh = findLatestNumeric(qualityParams, ['ph', 'pH']);
  const latestTemp = findLatestNumeric(qualityParams, ['temp', 'temperature']);
  const latestColor = findLatestNumeric(qualityParams, ['color', 'colorG']);

  const timelineRows = [
    ...qualityParams.map((entry) => ({
      type: 'measurement',
      date: entry.timestamp || `${entry.date || ''}T${entry.time || '00:00'}`,
      summary: `${entry.parameterName || entry.parameter || 'Ölçüm'} ${entry.ph !== undefined ? `pH ${entry.ph}` : ''} ${entry.temp !== undefined ? `T ${entry.temp}°C` : ''}`.trim()
    })),
    ...interventions.map((entry) => ({
      type: 'intervention',
      date: entry.date,
      summary: `${getInterventionTypeName(entry.type)} ${entry.parameters?.stockName || entry.parameters?.chemical || ''}`.trim()
    }))
  ]
    .filter((row) => row.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <Activity className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Tank Detay Bilgileri</h2>
            <p className="text-blue-100">Su kalitesi, hücre yoğunluğu ve pH stok müdahaleleri</p>
          </div>
        </div>
      </div>

      {/* Tank Seçimi */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium mb-2">Tank Seçin</label>
        <select
          value={selectedTank}
          onChange={(e) => setSelectedTank(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {activeTanks.length > 0 ? (
            activeTanks.map(tank => (
              <option key={tank.id} value={tank.id}>
                {tank.id} - {tank.volume}L ({tank.medium || 'Besin yeri seçilmemiş'})
              </option>
            ))
          ) : (
            <option value="" disabled>Aktif tank yok - Tanklar sekmesinden tank aktifleştirin</option>
          )}
        </select>
      </div>

      {/* Özet Bilgiler */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">📊 {selectedTank} - Özet Bilgiler</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Son pH */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              Son pH
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {latestPh !== null ? latestPh.toFixed(2) : '-'}
            </p>
          </div>

          {/* Son Sıcaklık */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Son Sıcaklık
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {latestTemp !== null ? `${latestTemp.toFixed(1)}°C` : '-'}
            </p>
          </div>

          {/* Hücre Yoğunluğu */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Hücre Yoğunluğu
            </p>
            <p className="text-xl font-bold text-green-600">
              {latestCellDensity !== null ? `${parseInt(latestCellDensity, 10).toLocaleString('tr-TR')} /ml` : '-'}
            </p>
          </div>

          {/* Canlılık */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Canlılık
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {latestViability !== null ? `${latestViability.toFixed(1)}%` : '-'}
            </p>
          </div>
        </div>

        <div className="mt-4 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-700 font-medium">
            Optik ölçüm özeti: <strong>Renk Tonu (G)</strong> {latestColor !== null ? latestColor : '-'}
          </p>
        </div>
      </div>

      {/* Besin Elementleri */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">🧪 Stok Besin Elementleri (mg/L)</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Azot (N)</label>
            <input
              type="number"
              step="0.1"
              defaultValue={tankData.nutrients?.nitrogen || 0}
              onChange={(e) => updateNutrient('nitrogen', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fosfor (P)</label>
            <input
              type="number"
              step="0.1"
              defaultValue={tankData.nutrients?.phosphorus || 0}
              onChange={(e) => updateNutrient('phosphorus', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Potasyum (K)</label>
            <input
              type="number"
              step="0.1"
              defaultValue={tankData.nutrients?.potassium || 0}
              onChange={(e) => updateNutrient('potassium', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Magnezyum (Mg)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={tankData.nutrients?.magnesium || 0}
              onChange={(e) => updateNutrient('magnesium', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kalsiyum (Ca)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={tankData.nutrients?.calcium || 0}
              onChange={(e) => updateNutrient('calcium', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sodyum (Na)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={tankData.nutrients?.sodium || 0}
              onChange={(e) => updateNutrient('sodium', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Karbon (C)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={tankData.nutrients?.carbon || 0}
              onChange={(e) => updateNutrient('carbon', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sülfür (S)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={tankData.nutrients?.sulfur || 0}
              onChange={(e) => updateNutrient('sulfur', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Su Kalite Parametreleri */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">💧 Su Kalite Parametreleri</h3>
          <button
            onClick={() => setShowAddParam(!showAddParam)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Ölçüm
          </button>
        </div>

        {showAddParam && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tarih</label>
                <input
                  type="date"
                  value={newParam.date}
                  onChange={(e) => setNewParam({ ...newParam, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Saat</label>
                <input
                  type="time"
                  value={newParam.time}
                  onChange={(e) => setNewParam({ ...newParam, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">pH</label>
                <input
                  type="number"
                  step="0.1"
                  value={newParam.ph}
                  onChange={(e) => setNewParam({ ...newParam, ph: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sıcaklık (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newParam.temp}
                  onChange={(e) => setNewParam({ ...newParam, temp: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Çözünmüş O₂ (mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newParam.do}
                  onChange={(e) => setNewParam({ ...newParam, do: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">İletkenlik (µS/cm)</label>
                <input
                  type="number"
                  value={newParam.conductivity}
                  onChange={(e) => setNewParam({ ...newParam, conductivity: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={addQualityParam}
              className="w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Kaydet
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Tarih/Saat</th>
                <th className="px-4 py-2 text-center">pH</th>
                <th className="px-4 py-2 text-center">Sıcaklık</th>
                <th className="px-4 py-2 text-center">DO</th>
                <th className="px-4 py-2 text-center">İletkenlik</th>
              </tr>
            </thead>
            <tbody>
              {tankData.qualityParams?.slice(-5).reverse().map((param, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">{param.date} {param.time}</td>
                  <td className="px-4 py-2 text-center">{param.ph}</td>
                  <td className="px-4 py-2 text-center">{param.temp}°C</td>
                  <td className="px-4 py-2 text-center">{param.do} mg/L</td>
                  <td className="px-4 py-2 text-center">{param.conductivity} µS/cm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* pH Stok Müdahaleleri */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">⚗️ pH Stok Müdahaleleri</h3>
          <button
            onClick={() => setShowAddIntervention(!showAddIntervention)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Müdahale
          </button>
        </div>

        {/* Stok Hazırlama Bilgileri */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">📋 Stok Çözeltileri</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableStocks.slice(0, 6).map((stock) => (
              <div key={stock.id} className="bg-white p-3 rounded border border-yellow-200">
                <p className="font-semibold text-gray-800">{stock.name}</p>
                <p className="text-sm text-gray-600">{stock.preparation || '-'}</p>
                <p className="text-xs text-gray-500 mt-1">Konsantrasyon: {stock.concentration || '-'}</p>
              </div>
            ))}
          </div>
        </div>

        {showAddIntervention && (
          <div className="bg-purple-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tarih</label>
                <input
                  type="date"
                  value={intervention.date}
                  onChange={(e) => setIntervention({ ...intervention, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Saat</label>
                <input
                  type="time"
                  value={intervention.time}
                  onChange={(e) => setIntervention({ ...intervention, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stok Solüsyon</label>
                <select
                  value={intervention.stockId}
                  onChange={(e) => setIntervention({ ...intervention, stockId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {availableStocks
                    .filter((stock) => (stock.compatibleInterventions || []).includes('pH_stock') || (stock.category || '').toLowerCase() === 'pH')
                    .map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Hacim (ml)</label>
                <input
                  type="number"
                  step="0.1"
                  value={intervention.volumeMl}
                  onChange={(e) => setIntervention({ ...intervention, volumeMl: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">pH Önce</label>
                <input
                  type="number"
                  step="0.1"
                  value={intervention.phBefore}
                  onChange={(e) => setIntervention({ ...intervention, phBefore: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">pH Sonra</label>
                <input
                  type="number"
                  step="0.1"
                  value={intervention.phAfter}
                  onChange={(e) => setIntervention({ ...intervention, phAfter: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={addPhIntervention}
              className="w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Kaydet ve Hesapla
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Tarih/Saat</th>
                <th className="px-4 py-2 text-left">Stok</th>
                <th className="px-4 py-2 text-center">Hacim (ml)</th>
                <th className="px-4 py-2 text-center">pH Önce → Sonra</th>
                <th className="px-4 py-2 text-center">Mol Kullanılan</th>
                <th className="px-4 py-2 text-center">Kütle (g)</th>
              </tr>
            </thead>
            <tbody>
              {tankData.interventions?.slice(-5).reverse().map((int, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">{int.date} {int.time}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      int.type === 'hcl' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {int.stockName}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{int.volumeMl}</td>
                  <td className="px-4 py-2 text-center">{int.phBefore} → {int.phAfter}</td>
                  <td className="px-4 py-2 text-center">{int.molesUsed}</td>
                  <td className="px-4 py-2 text-center">{int.massUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zaman Serisi Özet */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">🕒 Tank Zaman Serisi (Son 12 Kayıt)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Zaman</th>
                <th className="px-4 py-2 text-left">Tip</th>
                <th className="px-4 py-2 text-left">Özet</th>
              </tr>
            </thead>
            <tbody>
              {timelineRows.map((row, index) => (
                <tr key={`${row.date}_${index}`} className="border-b">
                  <td className="px-4 py-2">{new Date(row.date).toLocaleString('tr-TR')}</td>
                  <td className="px-4 py-2">{row.type === 'measurement' ? 'Ölçüm' : 'Müdahale'}</td>
                  <td className="px-4 py-2">{row.summary || '-'}</td>
                </tr>
              ))}
              {timelineRows.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-gray-500" colSpan={3}>Henüz zaman serisi kaydı yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FED-BATCH MÜDAHALELERİ - YENİ STRUCTURED SYSTEM */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Syringe className="w-6 h-6 text-emerald-600" />
              🧪 Fed-Batch Müdahaleleri
            </h3>
            <p className="text-sm text-gray-600 mt-1">Besin takviyesi, su değişimi ve diğer müdahaleler</p>
          </div>
          <button
            onClick={() => setShowFedBatch(!showFedBatch)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Yeni Müdahale
          </button>
        </div>

        {showFedBatch && (
          <FedBatchForm
            tankId={selectedTank}
            availableStocks={availableStocks}
            onSave={() => {
              setShowFedBatch(false);
              const updated = getInterventionsByTank(selectedTank);
              setInterventions(updated);
            }}
            onCancel={() => setShowFedBatch(false)}
          />
        )}

        {/* Müdahale Listesi */}
        <div className="space-y-3 mt-4">
          {interventions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FlaskConical className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Henüz müdahale kaydı yok</p>
              <p className="text-sm">Yukarıdaki butonu kullanarak yeni müdahale ekleyin</p>
            </div>
          ) : (
            interventions.slice().reverse().slice(0, 10).map((int) => (
              <div key={int.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getInterventionTypeStyle(int.type)}`}>
                        {getInterventionTypeName(int.type)}
                      </span>
                      <span className="text-sm text-gray-600">{new Date(int.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    
                    {int.type === 'fedbatch' && (
                      <div className="text-sm space-y-1">
                        <p><strong>Besin:</strong> {getNutrientName(int.parameters.nutrient)}</p>
                        <p><strong>Miktar:</strong> {int.parameters.amount} {int.parameters.unit}</p>
                        {int.parameters.concentration && (
                          <p><strong>Konsantrasyon:</strong> {int.parameters.concentration}</p>
                        )}
                      </div>
                    )}
                    
                    {int.type === 'pH' && (
                      <div className="text-sm">
                        <p><strong>Hedef pH:</strong> {int.parameters.targetpH}</p>
                        <p><strong>Asit/Baz:</strong> {int.parameters.acidBase}</p>
                      </div>
                    )}

                    {int.type === 'pH_stock' && (
                      <div className="text-sm space-y-1">
                        <p><strong>Stok:</strong> {int.parameters.stockName || '-'}</p>
                        <p><strong>Hacim:</strong> {int.parameters.volumeMl || 0} ml</p>
                        <p><strong>pH:</strong> {int.parameters.phBefore} → {int.parameters.phAfter}</p>
                        <p><strong>Stokiyometri:</strong> {Number.isFinite(int.parameters.molesUsed) ? int.parameters.molesUsed.toFixed(6) : '-'} mol / {Number.isFinite(int.parameters.massUsed) ? int.parameters.massUsed.toFixed(3) : '-'} g</p>
                      </div>
                    )}

                    {int.type === 'chemical_dosage' && (
                      <div className="text-sm space-y-1">
                        <p><strong>Kimyasal:</strong> {int.parameters.chemical || '-'}</p>
                        <p><strong>Miktar:</strong> {int.parameters.amount} {int.parameters.unit}</p>
                        <p><strong>Parametre:</strong> {int.parameters.parameter || '-'}</p>
                        <p><strong>Hedef:</strong> {int.parameters.currentValue} → {int.parameters.targetValue}</p>
                        {int.parameters.formula && (
                          <p><strong>Formül:</strong> {int.parameters.formula}</p>
                        )}
                      </div>
                    )}

                    {!['fedbatch', 'pH', 'pH_stock', 'chemical_dosage'].includes(int.type) && (
                      <div className="text-sm space-y-1">
                        <p><strong>Miktar:</strong> {int.parameters.amount ?? '-'} {int.parameters.unit || ''}</p>
                        <p><strong>Hedef:</strong> {int.parameters.currentValue ?? '-'} → {int.parameters.targetValue ?? '-'}</p>
                        <p><strong>Süre:</strong> {int.parameters.durationMin ?? '-'} dk</p>
                        {int.parameters.stockName && <p><strong>Stok:</strong> {int.parameters.stockName}</p>}
                      </div>
                    )}
                    
                    {int.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{int.notes}</p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">Kaynak: {int.source || 'bilinmiyor'}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// FED-BATCH FORM COMPONENT
const FedBatchForm = ({ tankId, onSave, onCancel, availableStocks = [] }) => {
  const defaultInterventionTypeOptions = [
    { value: 'fedbatch', label: 'Fed-Batch (Besin Takviyesi)' },
    { value: 'chemical_dosage', label: 'Kimyasal Dozaj' },
    { value: 'waterchange', label: 'Su Değişimi' },
    { value: 'topup', label: 'Hacim Tamamlama' },
    { value: 'harvest', label: 'Hasat' },
    { value: 'flocculation', label: 'Flokülasyon' },
    { value: 'deflocculation', label: 'Deflokülasyon' },
    { value: 'pH', label: 'pH Düzeltme' },
    { value: 'co2', label: 'CO₂ Ayarı' },
    { value: 'aeration', label: 'Havalandırma Ayarı' },
    { value: 'mixing', label: 'Karıştırma Ayarı' },
    { value: 'light', label: 'Işık Ayarı' },
    { value: 'temp', label: 'Sıcaklık Ayarı' },
    { value: 'salinity_adjust', label: 'Tuzluluk Ayarı' },
    { value: 'tds_adjust', label: 'TDS Ayarı' },
    { value: 'dechlorination', label: 'Dechlorination / Oksijen Tüketimi' },
    { value: 'shock_control', label: 'Şok Kontrol Müdahalesi' },
    { value: 'cold_chain_transfer', label: 'Soğuk Zincir Transferi' },
    { value: 'incident_recovery', label: 'Olay Kurtarma' },
    { value: 'other', label: 'Diğer' }
  ];

  const interventionTypeOptions = useMemo(() => {
    try {
      const raw = localStorage.getItem('chlorellaInterventionDictionary');
      const parsed = JSON.parse(raw || '[]');
      const dbOptions = Array.isArray(parsed)
        ? parsed
            .map((item) => ({ value: item?.type, label: item?.label }))
            .filter((item) => item.value && item.label)
        : [];

      const merged = [...defaultInterventionTypeOptions];
      dbOptions.forEach((option) => {
        if (!merged.some((existing) => existing.value === option.value)) {
          merged.push(option);
        }
      });
      return merged;
    } catch {
      return defaultInterventionTypeOptions;
    }
  }, []);

  const nutrientOptions = [
    { value: 'N', label: 'Azot (N)' },
    { value: 'P', label: 'Fosfor (P)' },
    { value: 'K', label: 'Potasyum (K)' },
    { value: 'C', label: 'Karbon (C)' },
    { value: 'Mg', label: 'Magnezyum (Mg)' },
    { value: 'Na', label: 'Sodyum (Na)' },
    { value: 'Ca', label: 'Kalsiyum (Ca)' },
    { value: 'B', label: 'Bor (B)' },
    { value: 'Mo', label: 'Molibden (Mo)' },
    { value: 'Fe', label: 'Demir (Fe)' },
    { value: 'Mn', label: 'Manganez (Mn)' },
    { value: 'Zn', label: 'Çinko (Zn)' },
    { value: 'Co', label: 'Kobalt (Co)' },
    { value: 'Cu', label: 'Bakır (Cu)' },
    { value: 'S', label: 'Sülfür (S)' },
    { value: 'Cl', label: 'Klor (Cl)' },
    { value: 'trace_mix', label: 'İz Element Karışımı' }
  ];

  const [formData, setFormData] = useState({
    type: 'fedbatch',
    date: new Date().toISOString().split('T')[0],
    parameters: {
      nutrient: 'N',
      amount: '',
      unit: 'ml',
      concentration: '',
      stockConcentrationValue: '',
      stockConcentrationUnit: 'mg/L',
      stockId: ''
    },
    notes: ''
  });

  const setParam = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value
      }
    }));
  };

  const fedBatchStocks = availableStocks.filter((stock) => {
    const category = (stock.category || '').toLowerCase();
    return (
      (stock.compatibleInterventions || []).includes('fedbatch') ||
      (stock.compatibleInterventions || []).includes('chemical_dosage') ||
      category.includes('besin') ||
      category.includes('karbon') ||
      category.includes('iz_element') ||
      stock.source === 'formulation'
    );
  });

  const selectedStock = availableStocks.find((stock) => stock.id === formData.parameters.stockId);

  const handleSubmit = async () => {
    if (!formData.parameters.amount) {
      alert('Miktar giriniz');
      return;
    }

    const normalizedAmount = Number(formData.parameters.amount) || 0;
    const normalizedStockConcentration = Number(formData.parameters.stockConcentrationValue) || null;

    const payload = {
      tankId,
      ...formData,
      parameters: {
        ...formData.parameters,
        amount: normalizedAmount,
        stockName: selectedStock?.name || formData.parameters.stockName || '',
        stockSource: selectedStock?.source || '',
        stockCategory: selectedStock?.category || '',
        stockConcentrationValue: normalizedStockConcentration,
        modelInput: {
          interventionType: formData.type,
          nutrient: formData.parameters.nutrient || null,
          amount: normalizedAmount,
          unit: formData.parameters.unit || 'ml',
          concentration: normalizedStockConcentration,
          concentrationUnit: formData.parameters.stockConcentrationUnit || 'mg/L',
          targetValue: Number(formData.parameters.targetValue) || null,
          currentValue: Number(formData.parameters.currentValue) || null,
          durationMin: Number(formData.parameters.durationMin) || null,
          flowRate: Number(formData.parameters.flowRate) || null
        }
      }
    };

    // Müdahaleyi kaydet
    addIntervention(payload);

    // 🧠 MODEL'E BİLDİR - FED-BATCH ANALİZİ + ÖĞRENME
    if (formData.type === 'fedbatch') {
      const modelManager = (await import('../managers/ModelManager.js')).default;
      
      // Fed-batch verisi
      const fedbatchData = {
        nutrient: formData.parameters.nutrient,
        amount_ml: normalizedAmount,
        concentration: Number(formData.parameters.concentration || normalizedStockConcentration || 100)
      };

      // 🧠 Gerçek veri asimilasyonu + Fed-Batch analizi
      const result = await modelManager.assimilateRealData(tankId, {
        fedbatch: fedbatchData
      });

      if (result && result.fedbatchAnalysis) {
        const analysis = result.fedbatchAnalysis;
        
        // Kullanıcıya feedback göster
        alert(
          `💉 Fed-Batch Analiz Sonucu:\n\n` +
          `Eklenen: ${analysis.amountAdded_ml} ml (${analysis.amountAdded_mg} mg)\n` +
          `Yeni Seviye: ${analysis.newLevel} mg/L\n` +
          `Saatlik Tüketim: ${analysis.hourlyConsumption} mg/L/saat\n` +
          `Tükenme Süresi: ${analysis.hoursUntilDepletion} saat\n\n` +
          `${analysis.recommendation}`
        );
      }
    }

    onSave();
  };

  return (
    <div className="bg-emerald-50 p-4 rounded-lg mb-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">Müdahale Tipi</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {interventionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tarih</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {formData.type === 'fedbatch' && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Besin Elementi</label>
              <select
                value={formData.parameters.nutrient}
                onChange={(e) => setParam('nutrient', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {nutrientOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Miktar</label>
              <input
                type="number"
                step="0.1"
                value={formData.parameters.amount}
                onChange={(e) => setParam('amount', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Örn: 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Birim</label>
              <select
                value={formData.parameters.unit}
                onChange={(e) => setParam('unit', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Stok Konsantrasyonu</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.parameters.stockConcentrationValue || ''}
                  onChange={(e) => setParam('stockConcentrationValue', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Örn: 100"
                />
                <select
                  value={formData.parameters.stockConcentrationUnit}
                  onChange={(e) => setParam('stockConcentrationUnit', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="mg/L">mg/L</option>
                  <option value="g/L">g/L</option>
                  <option value="ppm">ppm</option>
                  <option value="M">M</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model Hedef Değeri (opsiyonel)</label>
              <input
                type="number"
                step="0.01"
                value={formData.parameters.targetValue || ''}
                onChange={(e) => setParam('targetValue', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Örn: 12.5"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hazır Stok Solüsyon (opsiyonel)</label>
            <select
              value={formData.parameters.stockId || ''}
              onChange={(e) => setParam('stockId', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">Stok seçin (opsiyonel)</option>
              {fedBatchStocks
                .map((stock) => (
                  <option key={stock.id} value={stock.id}>
                    {stock.name} {stock.formulationName ? `• ${stock.formulationName}` : ''}
                  </option>
                ))}
            </select>
            {selectedStock && (
              <p className="text-xs text-gray-600 mt-1">
                Seçilen stok: {selectedStock.concentration || '-'} • {selectedStock.preparation || '-'}
              </p>
            )}
          </div>
        </>
      )}

      {formData.type !== 'fedbatch' && formData.type !== 'pH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mevcut Değer (opsiyonel)</label>
            <input
              type="number"
              step="0.01"
              value={formData.parameters.currentValue || ''}
              onChange={(e) => setParam('currentValue', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: 8.9"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Hedef Değer (opsiyonel)</label>
            <input
              type="number"
              step="0.01"
              value={formData.parameters.targetValue || ''}
              onChange={(e) => setParam('targetValue', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: 8.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Süre (dk, opsiyonel)</label>
            <input
              type="number"
              step="1"
              value={formData.parameters.durationMin || ''}
              onChange={(e) => setParam('durationMin', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: 30"
            />
          </div>
        </div>
      )}

      {formData.type === 'pH' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hedef pH</label>
            <input
              type="number"
              step="0.1"
              onChange={(e) => setFormData({ 
                ...formData, 
                parameters: { ...formData.parameters, targetpH: parseFloat(e.target.value) }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kullanılan Kimyasal</label>
            <select
              onChange={(e) => setFormData({ 
                ...formData, 
                parameters: { ...formData.parameters, acidBase: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="NaOH">NaOH (Sodyum Hidroksit)</option>
              <option value="HCl">HCl (Hidroklorik Asit)</option>
              <option value="H2SO4">H₂SO₄ (Sülfürik Asit)</option>
              <option value="other">Diğer</option>
            </select>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Neden / Sebep</label>
        <input
          type="text"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Örn: N tükenmesi, pH düşüklüğü, büyüme durması"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Notlar (opsiyonel)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          rows="2"
          placeholder="Ek bilgi veya gözlemler..."
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          💾 Kaydet
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          İptal
        </button>
      </div>
    </div>
  );
};

// Helper functions
const getInterventionTypeStyle = (type) => {
  const styles = {
    fedbatch: 'bg-emerald-100 text-emerald-800',
    topup: 'bg-sky-100 text-sky-800',
    waterchange: 'bg-blue-100 text-blue-800',
    harvest: 'bg-orange-100 text-orange-800',
    pH: 'bg-purple-100 text-purple-800',
    pH_stock: 'bg-fuchsia-100 text-fuchsia-800',
    flocculation: 'bg-indigo-100 text-indigo-800',
    deflocculation: 'bg-violet-100 text-violet-800',
    chemical_dosage: 'bg-indigo-100 text-indigo-800',
    light: 'bg-yellow-100 text-yellow-800',
    temp: 'bg-red-100 text-red-800',
    co2: 'bg-cyan-100 text-cyan-800',
    aeration: 'bg-cyan-100 text-cyan-800',
    mixing: 'bg-lime-100 text-lime-800',
    salinity_adjust: 'bg-teal-100 text-teal-800',
    tds_adjust: 'bg-teal-100 text-teal-800',
    dechlorination: 'bg-slate-100 text-slate-800',
    shock_control: 'bg-amber-100 text-amber-800',
    cold_chain_transfer: 'bg-blue-100 text-blue-800',
    incident_recovery: 'bg-rose-100 text-rose-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return styles[type] || styles.other;
};

const getInterventionTypeName = (type) => {
  const names = {
    fedbatch: 'Fed-Batch',
    topup: 'Hacim Tamamlama',
    waterchange: 'Su Değişimi',
    harvest: 'Hasat',
    pH: 'pH Düzeltme',
    pH_stock: 'pH Stok Müdahalesi',
    flocculation: 'Flokülasyon',
    deflocculation: 'Deflokülasyon',
    chemical_dosage: 'Kimyasal Dozaj',
    light: 'Işık Ayarı',
    temp: 'Sıcaklık',
    co2: 'CO₂ Ayarı',
    aeration: 'Havalandırma Ayarı',
    mixing: 'Karıştırma Ayarı',
    salinity_adjust: 'Tuzluluk Ayarı',
    tds_adjust: 'TDS Ayarı',
    dechlorination: 'Dechlorination',
    shock_control: 'Şok Kontrol',
    cold_chain_transfer: 'Soğuk Zincir Transferi',
    incident_recovery: 'Olay Kurtarma',
    other: 'Diğer'
  };
  return names[type] || 'Müdahale';
};

const getNutrientName = (nutrient) => {
  const names = {
    N: 'Azot (N)',
    P: 'Fosfor (P)',
    K: 'Potasyum (K)',
    C: 'Karbon (C)',
    Mg: 'Magnezyum (Mg)',
    Na: 'Sodyum (Na)',
    Ca: 'Kalsiyum (Ca)',
    Fe: 'Demir (Fe)',
    B: 'Bor (B)',
    Mo: 'Molibden (Mo)',
    Mn: 'Manganez (Mn)',
    Cu: 'Bakır (Cu)',
    Co: 'Kobalt (Co)',
    Zn: 'Çinko (Zn)',
    S: 'Sülfür (S)',
    Cl: 'Klor (Cl)',
    micronutrients: 'Mikro Besinler',
    carbon: 'Karbon Kaynağı',
    trace_mix: 'İz Element Karışımı'
  };
  return names[nutrient] || nutrient;
};

export default TankDetails;
