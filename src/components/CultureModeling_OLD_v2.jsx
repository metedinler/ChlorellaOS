import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, RefreshCw, Save, Target, Calendar, Beaker, Droplet, Wind, Sun } from 'lucide-react';

const CultureModeling = () => {
  const [tanks, setTanks] = useState([]);
  const [formulations, setFormulations] = useState([]);
  const [selectedTank, setSelectedTank] = useState(null);
  const [modelData, setModelData] = useState({});
  const [measurements, setMeasurements] = useState({});
  const [useTheoretical, setUseTheoretical] = useState(true);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [newMeasurement, setNewMeasurement] = useState({
    day: 0,
    density: '',
    OD680: '',
    OD750: '',
    pH: '',
    temp: ''
  });

  // Chlorella vulgaris sabitleri
  const CONSTANTS = {
    μmax: 0.15, // Maksimum büyüme hızı (1/saat)
    Y_biomass: 0.5, // Yield coefficient (g biomass/g N)
    CO2_consumption: 1.8, // g CO2 / g biomass
    O2_production: 1.3, // g O2 / g biomass
    N_percentage: 0.09, // Biomass N içeriği
    P_percentage: 0.01, // Biomass P içeriği
    light_saturation: 5000, // Lux
    temp_optimum: 28, // °C
    pH_optimum: 7.5
  };

  // LocalStorage'dan yükle
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      setTanks(allTanks.filter(t => t.active));
    }

    const savedFormulations = localStorage.getItem('customFormulations');
    if (savedFormulations) {
      setFormulations(JSON.parse(savedFormulations));
    }

    const savedModels = localStorage.getItem('cultureModels');
    if (savedModels) {
      setModelData(JSON.parse(savedModels));
    }

    const savedMeasurements = localStorage.getItem('cultureMeasurements');
    if (savedMeasurements) {
      setMeasurements(JSON.parse(savedMeasurements));
    }
  }, []);

  // Model verisi kaydet
  const saveModelData = (tankId, data) => {
    const updated = { ...modelData, [tankId]: data };
    setModelData(updated);
    localStorage.setItem('cultureModels', JSON.stringify(updated));
  };

  // Ölçüm verisi kaydet
  const saveMeasurement = (tankId, day, data) => {
    const updated = { ...measurements };
    if (!updated[tankId]) updated[tankId] = {};
    updated[tankId][day] = { ...updated[tankId][day], ...data };
    setMeasurements(updated);
    localStorage.setItem('cultureMeasurements', JSON.stringify(updated));
  };

  // Teorik büyüme hesapla (günlük)
  const calculateTheoreticalGrowth = (tank, day) => {
    if (!tank || !modelData[tank.id]) return null;

    const model = modelData[tank.id];
    const startDensity = model.initialDensity || 1e6; // cells/ml
    const volume = tank.volume; // L
    const lightHours = model.lightHours || 16;
    const darkHours = 24 - lightHours;

    // Monod kinetics (basitleştirilmiş)
    const μ_light = CONSTANTS.μmax * 0.8; // Işıkta
    const μ_dark = CONSTANTS.μmax * 0.1; // Karanlıkta
    const μ_avg = (μ_light * lightHours + μ_dark * darkHours) / 24;

    // Günlük yoğunluk
    const density = startDensity * Math.exp(μ_avg * 24 * day);
    
    // Biomass (DW = kuru ağırlık, g)
    const biomass_gL = (density * 1e-6) * 0.5; // ~0.5 pg/cell ortalama
    const biomass_total = biomass_gL * volume;

    // Besin tüketimi
    const N_consumed = biomass_total * CONSTANTS.N_percentage;
    const P_consumed = biomass_total * CONSTANTS.P_percentage;
    const CO2_consumed = biomass_total * CONSTANTS.CO2_consumption;
    const O2_produced = biomass_total * CONSTANTS.O2_production;

    // pH değişimi (basitleştirilmiş)
    const pH_start = model.initialPH || 7.5;
    const pH_change = -0.05 * day; // CO2 tüketimi nedeniyle yükseliş
    const pH = Math.min(9.0, Math.max(6.5, pH_start - pH_change));

    return {
      day,
      density, // cells/ml
      biomass_gL,
      biomass_total,
      N_consumed,
      P_consumed,
      CO2_consumed,
      O2_produced,
      pH,
      OD680: biomass_gL * 2.5, // Yaklaşık korelasyon
      OD750: biomass_gL * 2.0
    };
  };

  // Teoriye uyarla (pratiği teoriye fit et)
  const fitToTheory = (tankId) => {
    if (!measurements[tankId]) {
      alert('Henüz ölçüm verisi yok!');
      return;
    }

    const tankMeasurements = measurements[tankId];
    const days = Object.keys(tankMeasurements).map(Number).sort((a, b) => a - b);
    
    if (days.length < 2) {
      alert('En az 2 günlük ölçüm gerekli!');
      return;
    }

    // En küçük kareler yöntemi ile μ_avg hesapla
    const densities = days.map(d => tankMeasurements[d].density || 0).filter(d => d > 0);
    if (densities.length < 2) {
      alert('Yeterli yoğunluk verisi yok!');
      return;
    }

    // ln(N) vs t lineer regresyon
    const lnDensities = densities.map(d => Math.log(d));
    const avgDay = days.reduce((sum, d) => sum + d, 0) / days.length;
    const avgLnD = lnDensities.reduce((sum, d) => sum + d, 0) / lnDensities.length;
    
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < days.length; i++) {
      numerator += (days[i] - avgDay) * (lnDensities[i] - avgLnD);
      denominator += (days[i] - avgDay) ** 2;
    }
    
    const fitted_μ = numerator / denominator / 24; // saat^-1

    // Model güncelle
    const updated = {
      ...modelData[tankId],
      fitted_μ,
      fittedAt: new Date().toISOString(),
      fittingR2: calculateR2(days, lnDensities, fitted_μ)
    };

    saveModelData(tankId, updated);
    alert(`✓ Model güncelendi!\nFitted μ: ${fitted_μ.toFixed(4)} h⁻¹\nR²: ${updated.fittingR2.toFixed(3)}`);
  };

  // R² hesapla
  const calculateR2 = (days, observed, μ) => {
    const predicted = days.map(d => Math.log(modelData[selectedTank.id].initialDensity) + μ * 24 * d);
    const mean = observed.reduce((sum, v) => sum + v, 0) / observed.length;
    
    const ssRes = observed.reduce((sum, obs, i) => sum + (obs - predicted[i]) ** 2, 0);
    const ssTot = observed.reduce((sum, obs) => sum + (obs - mean) ** 2, 0);
    
    return 1 - (ssRes / ssTot);
  };

  // Teoriye dön
  const resetToTheory = (tankId) => {
    if (confirm('Modeli teorik değerlere sıfırlamak istediğinize emin misiniz?')) {
      const updated = {
        ...modelData[tankId],
        fitted_μ: undefined,
        fittedAt: undefined,
        fittingR2: undefined
      };
      saveModelData(tankId, updated);
      alert('✓ Model teorik değerlere sıfırlandı');
    }
  };

  // 30 günlük timeline oluştur
  const generateTimeline = () => {
    if (!selectedTank) return [];
    
    const timeline = [];
    for (let day = 0; day <= 30; day++) {
      const theoretical = calculateTheoreticalGrowth(selectedTank, day);
      const measured = measurements[selectedTank.id]?.[day];
      
      timeline.push({
        day,
        theoretical,
        measured,
        deviation: measured && theoretical ? {
          density: ((measured.density - theoretical.density) / theoretical.density * 100).toFixed(1),
          pH: (measured.pH - theoretical.pH).toFixed(2),
          OD680: measured.OD680 && theoretical.OD680 ? 
            ((measured.OD680 - theoretical.OD680) / theoretical.OD680 * 100).toFixed(1) : null
        } : null
      });
    }
    return timeline;
  };

  // Model başlat
  const initializeModel = (tank) => {
    const formulation = formulations.find(f => f.id === tank.formulationId);
    
    // Tank'tan başlangıç parametrelerini al
    const params = tank.initialParams || {};
    
    const model = {
      tankId: tank.id,
      startDate: tank.startDate,
      initialDensity: params.density || 1e6,
      initialPH: params.pH || 7.5,
      initialTemp: params.temp || 25,
      initialOD680: params.OD680 || 0.2,
      initialOD750: params.OD750 || 0.15,
      initialTDS: params.TDS || 500,
      volume: tank.volume,
      lightHours: params.lightHours || 16,
      darkHours: 24 - (params.lightHours || 16),
      lightIntensity: params.lightIntensity || 5000,
      CO2_flow: params.CO2_flow || 0.1,
      formulation: formulation?.name || 'Yok',
      nutrients: formulation ? calculateNutrients(formulation, tank.volume) : {}
    };

    saveModelData(tank.id, model);
    
    // Hücre sayım verilerini yükle
    loadCellCountData(tank.id);
    
    // Tank detay verilerini yükle
    loadTankDetailData(tank.id);
  };

  // Besin miktarlarını hesapla
  const calculateNutrients = (formulation, volume) => {
    let total_N = 0;
    let total_P = 0;

    formulation.stocks.forEach(stock => {
      const stockVolume = (stock.usageRatio / 1000) * volume; // L
      stock.chemicals.forEach(chem => {
        // Basit hesaplama - gerçekte chemicalLibrary'den gelecek
        if (chem.chemicalId.includes('Nitrat') || chem.chemicalId.includes('Üre')) {
          total_N += chem.amount * stockVolume / stock.finalVolume * 0.165; // ~16.5% N
        }
        if (chem.chemicalId.includes('Fosfat') || chem.chemicalId.includes('MKP')) {
          total_P += chem.amount * stockVolume / stock.finalVolume * 0.22; // ~22% P
        }
      });
    });

    return { N: total_N, P: total_P };
  };

  // Hücre sayım verilerini yükle
  const loadCellCountData = (tankId) => {
    const cellCountData = localStorage.getItem('cellCountingData');
    if (cellCountData) {
      const allCounts = JSON.parse(cellCountData);
      const tankCounts = allCounts.filter(c => c.tankId === tankId);
      
      // Son ölçümleri measurements'a aktar
      tankCounts.forEach(count => {
        const daysSinceStart = Math.floor(
          (new Date(count.timestamp) - new Date(tanks.find(t => t.id === tankId)?.startDate)) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceStart >= 0) {
          saveMeasurement(tankId, daysSinceStart, {
            density: count.cellsPerMl,
            viability: count.viability
          });
        }
      });
    }
  };

  // Tank detay verilerini yükle
  const loadTankDetailData = (tankId) => {
    const tankDetails = localStorage.getItem('tankDetails');
    if (tankDetails) {
      const allDetails = JSON.parse(tankDetails);
      const details = allDetails[tankId];
      
      if (details?.measurements) {
        details.measurements.forEach(m => {
          const daysSinceStart = Math.floor(
            (new Date(m.date) - new Date(tanks.find(t => t.id === tankId)?.startDate)) / (1000 * 60 * 60 * 24)
          );
          
          if (daysSinceStart >= 0) {
            saveMeasurement(tankId, daysSinceStart, {
              pH: m.pH,
              temp: m.temperature,
              OD680: m.OD680,
              OD750: m.OD750,
              TDS: m.conductivity
            });
          }
        });
      }
    }
  };

  const timeline = selectedTank ? generateTimeline() : [];
  const currentModel = selectedTank ? modelData[selectedTank.id] : null;

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <Activity className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Kültür Modelleme</h2>
            <p className="text-indigo-100">Teorik model vs Pratik ölçümler • Giren-Çıkan analizi</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Panel: Aktif Tanklar */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Aktif Tanklar ({tanks.length})</h3>
          
          {tanks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aktif tank yok</p>
          ) : (
            <div className="space-y-2">
              {tanks.map(tank => (
                <div
                  key={tank.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                    selectedTank?.id === tank.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => {
                    setSelectedTank(tank);
                    if (!modelData[tank.id]) {
                      initializeModel(tank);
                    }
                  }}
                >
                  <h4 className="font-bold">{tank.systemId}</h4>
                  <p className="text-xs text-gray-600">{tank.category} • {tank.volume}L</p>
                  <p className="text-xs text-gray-500">
                    Başlangıç: {tank.startDate}
                  </p>
                  {modelData[tank.id] && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Model aktif
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Panel: Model Detayları */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedTank ? (
            <div className="bg-white rounded-xl shadow-lg p-20 text-center">
              <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Bir tank seçin</p>
            </div>
          ) : (
            <>
              {/* Üst Kısım: Giriş/Çıkış Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Giriş Kartı */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-green-800">Giriş</h4>
                  </div>
                  {currentModel ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Besin:</span>
                        <span className="font-semibold">{currentModel.formulation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">N toplam:</span>
                        <span className="font-semibold">{currentModel.nutrients?.N?.toFixed(2) || 0}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">P toplam:</span>
                        <span className="font-semibold">{currentModel.nutrients?.P?.toFixed(2) || 0}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CO₂ akış:</span>
                        <span className="font-semibold">{currentModel.CO2_flow} L/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Işık:</span>
                        <span className="font-semibold">{currentModel.lightHours}s aydınlık</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Model başlatılıyor...</p>
                  )}
                </div>

                {/* Üretim/Tüketim Kartı */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-blue-800">C. vulgaris</h4>
                  </div>
                  {currentModel && timeline[0]?.theoretical ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Yoğunluk (T0):</span>
                        <span className="font-semibold">{(currentModel.initialDensity / 1e6).toFixed(2)}M/ml</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Büyüme hızı (μ):</span>
                        <span className="font-semibold">
                          {currentModel.fitted_μ 
                            ? `${(currentModel.fitted_μ * 100).toFixed(2)}% (fit)` 
                            : `${(CONSTANTS.μmax * 100).toFixed(2)}% (teori)`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CO₂ tüketim:</span>
                        <span className="font-semibold">{CONSTANTS.CO2_consumption}g/g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">O₂ üretim:</span>
                        <span className="font-semibold">{CONSTANTS.O2_production}g/g</span>
                      </div>
                      {currentModel.fitted_μ && (
                        <div className="mt-2 pt-2 border-t border-blue-300">
                          <p className="text-xs text-blue-600">
                            R² = {currentModel.fittingR2?.toFixed(3)}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Çıkış Kartı */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-amber-800">Çıkış</h4>
                  </div>
                  {timeline[30]?.theoretical ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Biomass (30g):</span>
                        <span className="font-semibold">{timeline[30].theoretical.biomass_total.toFixed(2)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">O₂ üretim:</span>
                        <span className="font-semibold">{timeline[30].theoretical.O2_produced.toFixed(2)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">N tüketim:</span>
                        <span className="font-semibold">{timeline[30].theoretical.N_consumed.toFixed(2)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">P tüketim:</span>
                        <span className="font-semibold">{timeline[30].theoretical.P_consumed.toFixed(2)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CO₂ tüketim:</span>
                        <span className="font-semibold">{timeline[30].theoretical.CO2_consumed.toFixed(2)}g</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Kontrol Butonları */}
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setUseTheoretical(!useTheoretical)}
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                      useTheoretical ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    {useTheoretical ? 'Teorik Model' : 'Pratik Veri'}
                  </button>
                  
                  <button
                    onClick={() => setShowMeasurementModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Ölçüm Ekle
                  </button>
                  
                  <button
                    onClick={() => fitToTheory(selectedTank.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Teoriye Uyarla
                  </button>

                  {currentModel?.fitted_μ && (
                    <button
                      onClick={() => resetToTheory(selectedTank.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 flex items-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      Teoriye Dön
                    </button>
                  )}
                </div>
              </div>

              {/* Alt Kısım: Timeline Tablosu */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">30 Günlük Timeline (Gün-Gün İlerleme)</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Gün</th>
                        <th className="p-2 text-right">Yoğunluk (M/ml)</th>
                        <th className="p-2 text-right">Biomass (g/L)</th>
                        <th className="p-2 text-right">OD680</th>
                        <th className="p-2 text-right">pH</th>
                        <th className="p-2 text-right">N tüketim (g)</th>
                        <th className="p-2 text-right">Sapma (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeline.filter(t => t.day % 2 === 0).map(item => (
                        <tr key={item.day} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-semibold">{item.day}</td>
                          <td className="p-2 text-right">
                            <div>
                              <span className="text-blue-600">
                                {(item.theoretical?.density / 1e6).toFixed(2)}
                              </span>
                              {item.measured?.density && (
                                <span className="text-green-600 ml-2">
                                  / {(item.measured.density / 1e6).toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-2 text-right text-blue-600">
                            {item.theoretical?.biomass_gL.toFixed(3)}
                          </td>
                          <td className="p-2 text-right">
                            <span className="text-blue-600">{item.theoretical?.OD680.toFixed(3)}</span>
                            {item.measured?.OD680 && (
                              <span className="text-green-600 ml-2">/ {item.measured.OD680.toFixed(3)}</span>
                            )}
                          </td>
                          <td className="p-2 text-right">
                            <span className="text-blue-600">{item.theoretical?.pH.toFixed(2)}</span>
                            {item.measured?.pH && (
                              <span className="text-green-600 ml-2">/ {item.measured.pH.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="p-2 text-right text-blue-600">
                            {item.theoretical?.N_consumed.toFixed(3)}
                          </td>
                          <td className="p-2 text-right">
                            {item.deviation?.density && (
                              <span className={`font-semibold ${
                                Math.abs(parseFloat(item.deviation.density)) > 10 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {item.deviation.density > 0 ? '+' : ''}{item.deviation.density}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded"></span>
                    <span>Teorik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-600 rounded"></span>
                    <span>Ölçüm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-600 rounded"></span>
                    <span>&gt;10% sapma</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ölçüm Ekleme Modalı */}
      {showMeasurementModal && selectedTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Ölçüm Ekle - {selectedTank.systemId}</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const day = parseInt(formData.get('day'));
              
              const measurement = {
                density: parseFloat(formData.get('density')) * 1e6, // M hücre/ml
                OD680: parseFloat(formData.get('OD680')) || null,
                OD750: parseFloat(formData.get('OD750')) || null,
                pH: parseFloat(formData.get('pH')) || null,
                temp: parseFloat(formData.get('temp')) || null
              };
              
              // Ölçümü kaydet
              saveMeasurement(selectedTank.id, day, measurement);
              
              setShowMeasurementModal(false);
              setNewMeasurement({
                day: 0,
                density: '',
                OD680: '',
                OD750: '',
                pH: '',
                temp: ''
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gün</label>
                  <input
                    type="number"
                    name="day"
                    min="0"
                    max="30"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0-30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yoğunluk (M hücre/ml)</label>
                  <input
                    type="number"
                    name="density"
                    step="0.1"
                    min="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="1.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">OD680 (opsiyonel)</label>
                  <input
                    type="number"
                    name="OD680"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0.25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">OD750 (opsiyonel)</label>
                  <input
                    type="number"
                    name="OD750"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="0.18"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">pH (opsiyonel)</label>
                  <input
                    type="number"
                    name="pH"
                    step="0.1"
                    min="4"
                    max="10"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="7.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Sıcaklık °C (opsiyonel)</label>
                  <input
                    type="number"
                    name="temp"
                    step="0.1"
                    min="0"
                    max="50"
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowMeasurementModal(false);
                    setNewMeasurement({
                      day: 0,
                      density: '',
                      OD680: '',
                      OD750: '',
                      pH: '',
                      temp: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CultureModeling;
