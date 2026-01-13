import React, { useState, useEffect } from 'react';
import { Scan, Plus, Save, Trash2, TrendingUp, Beaker, Database } from 'lucide-react';

const SpectroOD = () => {
  const [activeTanks, setActiveTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [measurements, setMeasurements] = useState({});
  const [savedMeasurements, setSavedMeasurements] = useState([]);
  const [calibrations, setCalibrations] = useState({});
  const [showCalibrationEditor, setShowCalibrationEditor] = useState(false);
  const [editingCalibration, setEditingCalibration] = useState(null);

  // OD dalga boyları
  const wavelengths = [
    { id: 'od430', label: 'OD 430nm', color: 'violet' },
    { id: 'od440', label: 'OD 440nm', color: 'blue' },
    { id: 'od480', label: 'OD 480nm', color: 'cyan' },
    { id: 'od540', label: 'OD 540nm', color: 'green' },
    { id: 'od600', label: 'OD 600nm', color: 'orange' },
    { id: 'od650', label: 'OD 650nm', color: 'red' },
    { id: 'od680', label: 'OD 680nm', color: 'red' },
    { id: 'od750', label: 'OD 750nm', color: 'darkred' }
  ];

  // Yükleme
  useEffect(() => {
    // Tank listesi
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setActiveTanks(active);
      if (active.length > 0 && !selectedTank) {
        setSelectedTank(active[0].id);
      }
    }

    // Kalibrasyonlar
    const storedCal = localStorage.getItem('spectroCalibrations');
    if (storedCal) {
      setCalibrations(JSON.parse(storedCal));
    }

    // Geçmiş ölçümler
    const storedMeas = localStorage.getItem('spectroODMeasurements');
    if (storedMeas) {
      setSavedMeasurements(JSON.parse(storedMeas));
    }
  }, []);

  // Ölçüm değeri güncelle
  const updateMeasurement = (wavelengthId, value) => {
    setMeasurements(prev => ({
      ...prev,
      [wavelengthId]: value
    }));
  };

  // Kalibrasyondan konsantrasyona çevir
  const convertToConcentration = (wavelengthId, odValue) => {
    const cal = calibrations[wavelengthId];
    if (!cal || !cal.slope) return null;

    // Y = mX + b → X = (Y - b) / m
    const concentration = (odValue - cal.intercept) / cal.slope;
    return concentration > 0 ? concentration : 0;
  };

  // Tüm ölçümleri kaydet
  const saveAllMeasurements = () => {
    if (!selectedTank) {
      alert('⚠️ Lütfen tank seçin!');
      return;
    }

    const hasData = Object.keys(measurements).some(k => measurements[k]);
    if (!hasData) {
      alert('⚠️ Lütfen en az bir OD değeri girin!');
      return;
    }

    // Ölçümü kaydet
    const newMeasurement = {
      id: Date.now(),
      date: measurementDate,
      tankId: selectedTank,
      timestamp: new Date().toISOString(),
      readings: { ...measurements }
    };

    const updated = [newMeasurement, ...savedMeasurements];
    setSavedMeasurements(updated);
    localStorage.setItem('spectroODMeasurements', JSON.stringify(updated));

    // TankDetails'a da kaydet
    const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!tankDetails[selectedTank]) {
      tankDetails[selectedTank] = { qualityParams: [] };
    }
    if (!tankDetails[selectedTank].qualityParams) {
      tankDetails[selectedTank].qualityParams = [];
    }

    Object.keys(measurements).forEach(wavelengthId => {
      if (measurements[wavelengthId]) {
        const wl = wavelengths.find(w => w.id === wavelengthId);
        const odValue = parseFloat(measurements[wavelengthId]);
        const concentration = convertToConcentration(wavelengthId, odValue);

        tankDetails[selectedTank].qualityParams.push({
          date: measurementDate,
          time: new Date().toLocaleTimeString('tr-TR'),
          parameter: wl.label,
          odValue: odValue,
          concentration: concentration,
          unit: calibrations[wavelengthId]?.unit || 'mg/L',
          source: 'Spektrofotometre OD',
          timestamp: new Date().toISOString()
        });
      }
    });

    localStorage.setItem('tankDetails', JSON.stringify(tankDetails));

    setMeasurements({});
    alert(`✅ ${Object.keys(measurements).length} OD değeri kaydedildi!`);
  };

  // Kalibrasyon oluştur/düzenle
  const startCalibration = (wavelengthId) => {
    const existing = calibrations[wavelengthId];
    setEditingCalibration({
      wavelengthId: wavelengthId,
      name: existing?.name || wavelengths.find(w => w.id === wavelengthId).label,
      unit: existing?.unit || 'mg/L',
      standards: existing?.standards || [
        { od: 0, concentration: 0 },
        { od: 0.1, concentration: 10 }
      ]
    });
    setShowCalibrationEditor(true);
  };

  // Kalibrasyon kaydet
  const saveCalibration = () => {
    if (!editingCalibration || !editingCalibration.standards || editingCalibration.standards.length < 2) {
      alert('⚠️ En az 2 standart nokta gerekli!');
      return;
    }

    // Lineer regresyon hesapla (y = mx + b)
    const n = editingCalibration.standards.length;
    const sumX = editingCalibration.standards.reduce((sum, s) => sum + s.od, 0);
    const sumY = editingCalibration.standards.reduce((sum, s) => sum + s.concentration, 0);
    const sumXY = editingCalibration.standards.reduce((sum, s) => sum + (s.od * s.concentration), 0);
    const sumX2 = editingCalibration.standards.reduce((sum, s) => sum + (s.od * s.od), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R² hesapla
    const meanY = sumY / n;
    const ssTotal = editingCalibration.standards.reduce((sum, s) => 
      sum + Math.pow(s.concentration - meanY, 2), 0
    );
    const ssResidual = editingCalibration.standards.reduce((sum, s) => 
      sum + Math.pow(s.concentration - (slope * s.od + intercept), 2), 0
    );
    const rSquared = 1 - (ssResidual / ssTotal);

    const newCalibration = {
      ...editingCalibration,
      slope,
      intercept,
      rSquared,
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...calibrations,
      [editingCalibration.wavelengthId]: newCalibration
    };

    setCalibrations(updated);
    localStorage.setItem('spectroCalibrations', JSON.stringify(updated));
    setShowCalibrationEditor(false);
    setEditingCalibration(null);

    alert(`✅ Kalibrasyon kaydedildi!\nR² = ${rSquared.toFixed(4)}\nEğim = ${slope.toFixed(4)}\nKesim = ${intercept.toFixed(4)}`);
  };

  // Standart ekle/çıkar
  const addStandard = () => {
    setEditingCalibration(prev => ({
      ...prev,
      standards: [...prev.standards, { od: 0, concentration: 0 }]
    }));
  };

  const removeStandard = (index) => {
    setEditingCalibration(prev => ({
      ...prev,
      standards: prev.standards.filter((_, i) => i !== index)
    }));
  };

  const updateStandard = (index, field, value) => {
    setEditingCalibration(prev => {
      const updated = [...prev.standards];
      updated[index][field] = parseFloat(value) || 0;
      return { ...prev, standards: updated };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Scan className="w-10 h-10" />
          Spektrofotometre - Optik Yoğunluk (OD) Ölçümleri
        </h2>
        <p className="text-purple-100">
          OD 430, 440, 480, 540, 600, 650, 680, 750nm ölçümleri + Kalibrasyon sistemi
        </p>
      </div>

      {/* Ölçüm Paneli */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Tank ve Tarih Seçimi */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-4">📋 Ölçüm Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tank</label>
              <select
                value={selectedTank}
                onChange={(e) => setSelectedTank(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Tank seçin...</option>
                {activeTanks.map(tank => (
                  <option key={tank.id} value={tank.id}>
                    {tank.customName || tank.series || tank.id} ({tank.volume}L)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
              <input
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={saveAllMeasurements}
              disabled={!selectedTank || Object.keys(measurements).length === 0}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2 font-semibold"
            >
              <Save className="w-5 h-5" />
              Tümünü Kaydet
            </button>
          </div>
        </div>

        {/* Orta+Sağ: OD Değerleri */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="font-bold text-gray-800 mb-4">🌈 OD Değerleri</h3>
          <div className="grid grid-cols-2 gap-4">
            {wavelengths.map(wl => {
              const cal = calibrations[wl.id];
              const odValue = measurements[wl.id];
              const concentration = odValue ? convertToConcentration(wl.id, parseFloat(odValue)) : null;

              return (
                <div key={wl.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-800">{wl.label}</span>
                    <button
                      onClick={() => startCalibration(wl.id)}
                      className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
                      title="Kalibrasyon ayarla"
                    >
                      <Database className="w-3 h-3" />
                      {cal ? 'Düzenle' : 'Ayarla'}
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    value={measurements[wl.id] || ''}
                    onChange={(e) => updateMeasurement(wl.id, e.target.value)}
                    placeholder="0.000"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center text-lg font-semibold"
                  />
                  {cal && concentration !== null && (
                    <div className="mt-2 text-sm text-center">
                      <span className="text-gray-600">≈ </span>
                      <span className="font-bold text-emerald-600">
                        {concentration.toFixed(2)} {cal.unit}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        R² = {cal.rSquared?.toFixed(4)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Geçmiş Ölçümler */}
      {savedMeasurements.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Geçmiş OD Ölçümleri</h3>
          <div className="space-y-3">
            {savedMeasurements.slice(0, 10).map(meas => {
              const tank = activeTanks.find(t => t.id === meas.tankId);
              const tankName = tank ? (tank.customName || tank.series || meas.tankId) : meas.tankId;
              
              return (
                <div key={meas.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-gray-800">{meas.date}</span>
                      <span className="ml-3 text-sm text-gray-600">{tankName}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(meas.timestamp).toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(meas.readings).map(wlId => {
                      const wl = wavelengths.find(w => w.id === wlId);
                      return meas.readings[wlId] ? (
                        <span key={wlId} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                          {wl?.label}: {parseFloat(meas.readings[wlId]).toFixed(3)}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kalibrasyon Editor Modal */}
      {showCalibrationEditor && editingCalibration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
              <h3 className="text-xl font-bold">📐 Kalibrasyon Eğrisi - {editingCalibration.name}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konsantrasyon Birimi</label>
                <input
                  type="text"
                  value={editingCalibration.unit}
                  onChange={(e) => setEditingCalibration({...editingCalibration, unit: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="mg/L, cells/mL, vb."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">Standart Noktalar</h4>
                  <button
                    onClick={addStandard}
                    className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Ekle
                  </button>
                </div>
                <div className="space-y-2">
                  {editingCalibration.standards.map((std, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-8 text-center text-gray-600 font-semibold">#{idx + 1}</span>
                      <input
                        type="number"
                        step="0.001"
                        value={std.od}
                        onChange={(e) => updateStandard(idx, 'od', e.target.value)}
                        placeholder="OD"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                      <span className="text-gray-600">→</span>
                      <input
                        type="number"
                        step="0.01"
                        value={std.concentration}
                        onChange={(e) => updateStandard(idx, 'concentration', e.target.value)}
                        placeholder="Konsantrasyon"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                      {editingCalibration.standards.length > 2 && (
                        <button
                          onClick={() => removeStandard(idx)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCalibrationEditor(false);
                    setEditingCalibration(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  onClick={saveCalibration}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpectroOD;
