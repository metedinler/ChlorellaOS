import React, { useState, useEffect } from 'react';
import { Activity, Droplet, Thermometer, Beaker, Plus, TrendingUp, Syringe, FlaskConical } from 'lucide-react';
import { addIntervention, getInterventionsByTank } from '../utils/interventionManager';
import { getChemicalDisplayName } from '../utils/chemicalNames';

const TankDetails = () => {
  const [selectedTank, setSelectedTank] = useState('');
  const [activeTanks, setActiveTanks] = useState([]);
  const [showAddParam, setShowAddParam] = useState(false);
  const [showAddIntervention, setShowAddIntervention] = useState(false);
  const [showFedBatch, setShowFedBatch] = useState(false);
  const [interventions, setInterventions] = useState([]);
  
  // Aktif tankları yükle (Task 5)
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setActiveTanks(active);
      if (active.length > 0 && !selectedTank) {
        setSelectedTank(active[0].id);
      }
    }
  }, []);
  
  // Müdahaleleri yükle
  useEffect(() => {
    if (selectedTank) {
      const tankInterventions = getInterventionsByTank(selectedTank);
      setInterventions(tankInterventions);
    }
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
    type: 'hcl', // hcl veya carbonate
    volumeMl: 0,
    phBefore: 0,
    phAfter: 0
  });

  // Stok çözeltileri
  const stockSolutions = {
    hcl: {
      name: 'HCl Stok (0.1M)',
      concentration: 0.1,
      preparation: '100 ml HCl (37%) + 900 ml distile su',
      molarMass: 36.5
    },
    carbonate: {
      name: 'Karbonat Stok (Na2CO3)',
      concentration: 0.1,
      preparation: '10.6 g Na2CO3 + 1L distile su',
      molarMass: 106
    }
  };

  // Tank verilerini LocalStorage'dan yükle
  const getTankData = () => {
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    return allData[selectedTank] || {
      qualityParams: [],
      interventions: [],
      cellCounts: [],
      nutrients: { nitrogen: 0, phosphorus: 0, manganese: 0 }
    };
  };

  const tankData = getTankData();

  // Su kalite parametresi ekle
  const addQualityParam = () => {
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!allData[selectedTank]) allData[selectedTank] = { qualityParams: [], interventions: [], cellCounts: [], nutrients: {} };
    
    const newParam = {
      ...newParam,
      timestamp: new Date().toISOString()
    };
    
    allData[selectedTank].qualityParams.push(newParam);
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
  const addIntervention = () => {
    if (!selectedTank) {
      alert('⚠️ Lütfen tank seçin!');
      return;
    }

    const vol = parseFloat(intervention.volumeMl);
    const stock = stockSolutions[intervention.type];
    
    if (isNaN(vol) || vol <= 0) {
      alert('⚠️ Hacim değeri geçersiz!');
      return;
    }

    if (isNaN(intervention.phBefore) || isNaN(intervention.phAfter)) {
      alert('⚠️ pH değerleri geçersiz!');
      return;
    }
    
    // Stokiyometrik hesaplama (basitleştirilmiş)
    const moles = (vol / 1000) * stock.concentration;
    const mass = moles * stock.molarMass;
    
    const allData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!allData[selectedTank]) allData[selectedTank] = { qualityParams: [], interventions: [], cellCounts: [], nutrients: {} };
    if (!allData[selectedTank].interventions) allData[selectedTank].interventions = [];
    
    const newIntervention = {
      ...intervention,
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
      type: 'hcl',
      volumeMl: 0,
      phBefore: 0,
      phAfter: 0
    });

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
  const lastParam = tankData.qualityParams?.[tankData.qualityParams.length - 1];
  const lastCellCount = tankData.cellCounts?.[tankData.cellCounts.length - 1];

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
              {lastParam?.ph || '-'}
            </p>
          </div>

          {/* Son Sıcaklık */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              Son Sıcaklık
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {lastParam?.temp || '-'}°C
            </p>
          </div>

          {/* Hücre Yoğunluğu */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Beaker className="w-4 h-4" />
              Hücre Yoğunluğu
            </p>
            <p className="text-xl font-bold text-green-600">
              {lastCellCount ? `${parseInt(lastCellCount.cellsPerMl).toLocaleString('tr-TR')} /ml` : '-'}
            </p>
          </div>

          {/* Canlılık */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Canlılık
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {lastCellCount ? `${lastCellCount.viability}%` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Besin Elementleri */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">🧪 Stok Besin Elementleri (mg/L)</h3>
        
        <div className="grid grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium mb-2">Manganez (Mn)</label>
            <input
              type="number"
              step="0.01"
              defaultValue={tankData.nutrients?.manganese || 0}
              onChange={(e) => updateNutrient('manganese', e.target.value)}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded">
              <p className="font-semibold text-red-600">{stockSolutions.hcl.name}</p>
              <p className="text-sm text-gray-600">{stockSolutions.hcl.preparation}</p>
            </div>
            <div className="bg-white p-3 rounded">
              <p className="font-semibold text-green-600">{stockSolutions.carbonate.name}</p>
              <p className="text-sm text-gray-600">{stockSolutions.carbonate.preparation}</p>
            </div>
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
                <label className="block text-sm font-medium mb-2">Stok Tipi</label>
                <select
                  value={intervention.type}
                  onChange={(e) => setIntervention({ ...intervention, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="hcl">HCl (pH düşür)</option>
                  <option value="carbonate">Karbonat (pH yükselt)</option>
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
              onClick={addIntervention}
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
                    
                    {int.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{int.notes}</p>
                    )}
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
const FedBatchForm = ({ tankId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: 'fedbatch',
    date: new Date().toISOString().split('T')[0],
    parameters: {
      nutrient: 'N',
      amount: '',
      unit: 'ml',
      concentration: ''
    },
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.parameters.amount) {
      alert('Miktar giriniz');
      return;
    }

    // Müdahaleyi kaydet
    addIntervention({
      tankId,
      ...formData
    });

    // 🧠 MODEL'E BİLDİR - FED-BATCH ANALİZİ + ÖĞRENME
    if (formData.type === 'fedbatch') {
      const modelManager = (await import('../managers/ModelManager.js')).default;
      
      // Fed-batch verisi
      const fedbatchData = {
        nutrient: formData.parameters.nutrient,
        amount_ml: parseFloat(formData.parameters.amount),
        concentration: parseFloat(formData.parameters.concentration || 100)
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

    addIntervention({
      tankId,
      ...formData
    });

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
            <option value="fedbatch">Fed-Batch (Besin Takviyesi)</option>
            <option value="waterchange">Su Değişimi</option>
            <option value="harvest">Hasat</option>
            <option value="pH">pH Düzeltme</option>
            <option value="light">Işık Ayarı</option>
            <option value="temp">Sıcaklık Ayarı</option>
            <option value="co2">CO₂ Ayarı</option>
            <option value="other">Diğer</option>
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
                onChange={(e) => setFormData({ 
                  ...formData, 
                  parameters: { ...formData.parameters, nutrient: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="N">Azot (N)</option>
                <option value="P">Fosfor (P)</option>
                <option value="micronutrients">Mikro Besinler</option>
                <option value="carbon">Karbon Kaynağı</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Miktar</label>
              <input
                type="number"
                step="0.1"
                value={formData.parameters.amount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  parameters: { ...formData.parameters, amount: parseFloat(e.target.value) }
                })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Örn: 50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Birim</label>
              <select
                value={formData.parameters.unit}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  parameters: { ...formData.parameters, unit: e.target.value }
                })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="g">g</option>
                <option value="mg">mg</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Stok Konsantrasyonu (opsiyonel)</label>
            <input
              type="text"
              value={formData.parameters.concentration}
              onChange={(e) => setFormData({ 
                ...formData, 
                parameters: { ...formData.parameters, concentration: e.target.value }
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Örn: 10x NaNO3 stoku"
            />
          </div>
        </>
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
    waterchange: 'bg-blue-100 text-blue-800',
    harvest: 'bg-orange-100 text-orange-800',
    pH: 'bg-purple-100 text-purple-800',
    light: 'bg-yellow-100 text-yellow-800',
    temp: 'bg-red-100 text-red-800',
    co2: 'bg-cyan-100 text-cyan-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return styles[type] || styles.other;
};

const getInterventionTypeName = (type) => {
  const names = {
    fedbatch: 'Fed-Batch',
    waterchange: 'Su Değişimi',
    harvest: 'Hasat',
    pH: 'pH Düzeltme',
    light: 'Işık Ayarı',
    temp: 'Sıcaklık',
    co2: 'CO₂ Ayarı',
    other: 'Diğer'
  };
  return names[type] || 'Müdahale';
};

const getNutrientName = (nutrient) => {
  const names = {
    N: 'Azot (N)',
    P: 'Fosfor (P)',
    micronutrients: 'Mikro Besinler',
    carbon: 'Karbon Kaynağı'
  };
  return names[nutrient] || nutrient;
};

export default TankDetails;
