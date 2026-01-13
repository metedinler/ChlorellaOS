/**
 * RiskAssessment - 16 Risk Senaryosu + CRI Görselleştirme
 * 
 * ModelManager'dan tank risk verilerini çekip görselleştirir.
 * - 16 risk kartı (NH3 toksisitesi, oksijen, pH, vb.)
 * - CRI (Composite Risk Index) gauge
 * - Risk trend grafiği
 * - Öneri sistemi
 */

import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Activity, Droplet, Wind, Thermometer, Sun, Zap, Package, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import modelManager from '../managers/ModelManager';
import recommendationEngine from '../managers/RecommendationEngine';

const RiskAssessment = ({ tankId }) => {
  const [tankState, setTankState] = useState(null);
  const [risks, setRisks] = useState(null);
  const [CRI, setCRI] = useState(0);
  const [riskHistory, setRiskHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Risk icon mapping
  const riskIcons = {
    NH3_toxicity: Droplet,
    night_hypoxia: Wind,
    photooxidation: Sun,
    N_limitation: Activity,
    pH_fluctuation: Droplet,
    carbon_limitation: Wind,
    osmotic_stress: Droplet,
    heat_stress: Thermometer,
    temperature_shock: Thermometer,
    contamination: AlertTriangle,
    light_heterogeneity: Sun,
    sedimentation: TrendingDown,
    heavy_metal: Zap,
    vitamin_deficiency: Activity,
    mechanical_damage: AlertTriangle,
    biofilm: Activity
  };

  // Risk Türkçe isimleri
  const riskNames = {
    NH3_toxicity: 'NH₃ Toksisitesi',
    night_hypoxia: 'Gece Hipoksisi',
    photooxidation: 'Foto-oksidasyon',
    N_limitation: 'Azot Sınırlaması',
    pH_fluctuation: 'pH Dalgalanması',
    carbon_limitation: 'Karbon Sınırlaması',
    osmotic_stress: 'Osmotik Stres',
    heat_stress: 'Isı Stresi',
    temperature_shock: 'Sıcaklık Şoku',
    contamination: 'Kontaminasyon',
    light_heterogeneity: 'Işık Heterojenliği',
    sedimentation: 'Sedimentasyon',
    heavy_metal: 'Ağır Metal',
    vitamin_deficiency: 'Vitamin Eksikliği',
    mechanical_damage: 'Mekanik Hasar',
    biofilm: 'Biyofilm'
  };

  // Veri güncelleme
  useEffect(() => {
    if (!tankId) {
      setLoading(false);
      return;
    }

    const updateData = () => {
      const state = modelManager.getTankState(tankId);
      
      if (!state) {
        setLoading(false);
        return;
      }

      setTankState(state);
      
      // En son risk değerleri
      if (state.riskHistory && state.riskHistory.length > 0) {
        const latestRisk = state.riskHistory[state.riskHistory.length - 1];
        setRisks(latestRisk.risks);
        setCRI(latestRisk.CRI);
        
        // Son 24 saatlik history
        setRiskHistory(state.riskHistory.slice(-24));
        
        // Akıllı öneriler oluştur (Task 26)
        const recs = recommendationEngine.generateRecommendations(
          latestRisk,
          tankId,
          state.volume || 1000 // Tank hacmi
        );
        setRecommendations(recs);
      }

      setLoading(false);
    };

    updateData();

    // Her 5 dakikada bir güncelle
    const interval = setInterval(updateData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [tankId]);

  // Risk seviyesi renk
  const getRiskColor = (riskValue) => {
    if (riskValue < 0.2) return 'bg-green-500';
    if (riskValue < 0.4) return 'bg-yellow-500';
    if (riskValue < 0.6) return 'bg-orange-500';
    if (riskValue < 0.8) return 'bg-red-500';
    return 'bg-purple-500';
  };

  const getRiskTextColor = (riskValue) => {
    if (riskValue < 0.2) return 'text-green-700';
    if (riskValue < 0.4) return 'text-yellow-700';
    if (riskValue < 0.6) return 'text-orange-700';
    if (riskValue < 0.8) return 'text-red-700';
    return 'text-purple-700';
  };

  const getRiskLevel = (riskValue) => {
    if (riskValue < 0.2) return 'GÜVENLİ';
    if (riskValue < 0.4) return 'İZLE';
    if (riskValue < 0.6) return 'UYARI';
    if (riskValue < 0.8) return 'KRİTİK';
    return 'ÇÖKÜŞ';
  };

  // CRI Gauge Component
  const CRIGauge = ({ value }) => {
    const percentage = value * 100;
    const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

    return (
      <div className="relative w-48 h-24 mx-auto">
        {/* Arc background */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="20"
            strokeLinecap="round"
          />
          
          {/* Colored arc (gradient) */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="33%" stopColor="#fbbf24" />
              <stop offset="66%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51} 251`}
          />
          
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="20"
            stroke="#1f2937"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
          />
          
          {/* Center circle */}
          <circle cx="100" cy="80" r="6" fill="#1f2937" />
        </svg>

        {/* Value display */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <div className={`text-3xl font-bold ${getRiskTextColor(value)}`}>
            {percentage.toFixed(0)}%
          </div>
          <div className={`text-sm font-semibold ${getRiskTextColor(value)}`}>
            {getRiskLevel(value)}
          </div>
        </div>
      </div>
    );
  };

  // Risk trend icon
  const getTrendIcon = (riskType) => {
    if (riskHistory.length < 2) return <Minus className="w-4 h-4" />;

    const recent = riskHistory.slice(-5).map(h => h.risks[riskType]);
    const avg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const current = recent[recent.length - 1];

    if (current > avg * 1.1) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < avg * 0.9) return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Risk verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!tankState) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Tank Seçilmedi</h3>
        <p className="text-yellow-700">Risk değerlendirmesi için lütfen bir tank seçin.</p>
      </div>
    );
  }

  if (!risks) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <Activity className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Simülasyon Bekleniyor</h3>
        <p className="text-blue-700">Tank henüz simüle edilmedi. İlk risk değerlendirmesi 1 saat içinde hazır olacak.</p>
      </div>
    );
  }

  // Riskleri sırala (en yüksekten en düşüğe)
  const sortedRisks = Object.entries(risks).sort((a, b) => b[1] - a[1]);
  const topRisks = sortedRisks.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Risk Değerlendirmesi - Tank {tankId}</h2>
        <p className="text-emerald-100">
          Gün {tankState.currentDay} • Saat {tankState.currentHour} • 16 Senaryo Analizi
        </p>
      </div>

      {/* CRI Gauge */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
          CRI (Composite Risk Index)
        </h3>
        <CRIGauge value={CRI} />
        
        <div className="mt-6 grid grid-cols-5 gap-2 text-xs text-center">
          <div className="p-2 bg-green-100 rounded">
            <div className="font-semibold text-green-700">GÜVENLİ</div>
            <div className="text-green-600">0-20%</div>
          </div>
          <div className="p-2 bg-yellow-100 rounded">
            <div className="font-semibold text-yellow-700">İZLE</div>
            <div className="text-yellow-600">20-40%</div>
          </div>
          <div className="p-2 bg-orange-100 rounded">
            <div className="font-semibold text-orange-700">UYARI</div>
            <div className="text-orange-600">40-60%</div>
          </div>
          <div className="p-2 bg-red-100 rounded">
            <div className="font-semibold text-red-700">KRİTİK</div>
            <div className="text-red-600">60-80%</div>
          </div>
          <div className="p-2 bg-purple-100 rounded">
            <div className="font-semibold text-purple-700">ÇÖKÜŞ</div>
            <div className="text-purple-600">80-100%</div>
          </div>
        </div>
      </div>

      {/* Top 3 Risks Alert */}
      {topRisks.some(([_, value]) => value > 0.4) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h4 className="font-bold text-red-800">En Yüksek Risk Faktörleri</h4>
          </div>
          <ul className="space-y-1 text-sm">
            {topRisks.map(([riskType, value]) => (
              value > 0.4 && (
                <li key={riskType} className="text-red-700">
                  • <strong>{riskNames[riskType]}</strong>: {(value * 100).toFixed(0)}%
                </li>
              )
            ))}
          </ul>
        </div>
      )}

      {/* 16 Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedRisks.map(([riskType, value]) => {
          const Icon = riskIcons[riskType] || Activity;
          
          return (
            <div
              key={riskType}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${getRiskTextColor(value)}`} />
                {getTrendIcon(riskType)}
              </div>

              {/* Risk Name */}
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                {riskNames[riskType]}
              </h4>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${getRiskColor(value)}`}
                  style={{ width: `${value * 100}%` }}
                ></div>
              </div>

              {/* Value & Level */}
              <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${getRiskTextColor(value)}`}>
                  {(value * 100).toFixed(0)}%
                </span>
                <span className={`px-2 py-1 rounded font-semibold ${
                  value < 0.2 ? 'bg-green-100 text-green-700' :
                  value < 0.4 ? 'bg-yellow-100 text-yellow-700' :
                  value < 0.6 ? 'bg-orange-100 text-orange-700' :
                  value < 0.8 ? 'bg-red-100 text-red-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {getRiskLevel(value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Akıllı Kimyasal Öneriler - RecommendationEngine (Task 26) */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            💡 Akıllı Kimyasal Öneriler
          </h3>

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`border-2 rounded-lg p-4 ${
                  rec.priority === 'HIGH'
                    ? 'border-red-400 bg-red-50'
                    : rec.priority === 'MEDIUM'
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-blue-400 bg-blue-50'
                }`}
              >
                {/* Başlık */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          rec.priority === 'HIGH'
                            ? 'bg-red-600 text-white'
                            : rec.priority === 'MEDIUM'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {rec.priority}
                      </span>
                      <h4 className="font-bold text-gray-800">{rec.action}</h4>
                    </div>
                    <p className="text-sm text-gray-700">{rec.chemicalName}</p>
                  </div>
                  
                  {/* Stok durumu */}
                  <div className="flex items-center gap-2">
                    {rec.inStock ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-xs font-semibold ${rec.inStock ? 'text-green-700' : 'text-red-700'}`}>
                      {rec.inStock ? 'Stokta' : 'Stok Yok'}
                    </span>
                  </div>
                </div>

                {/* Açıklama */}
                <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                {/* Dozaj ve maliyet */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">Dozaj</div>
                    <div className="font-bold text-gray-800">
                      {rec.dosage ? rec.dosage.toFixed(1) : '0'} {rec.unit}
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">Maliyet</div>
                    <div className="font-bold text-gray-800 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {rec.cost} TL
                    </div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-xs text-gray-600">Stok</div>
                    <div className="font-bold text-gray-800">
                      {rec.stockAvailable} {rec.unit === 'mL' ? 'L' : 'kg'}
                    </div>
                  </div>
                </div>

                {/* Uyarı */}
                {rec.warning && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-yellow-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-semibold">Uyarı:</span>
                      <span>{rec.warning}</span>
                    </div>
                  </div>
                )}

                {/* Not */}
                {rec.note && (
                  <p className="text-xs text-gray-600 italic">💡 {rec.note}</p>
                )}

                {/* Alternatifler */}
                {rec.alternatives && rec.alternatives.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-gray-600">Alternatifler: </span>
                    <span className="text-xs text-blue-600 font-semibold">
                      {rec.alternatives.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Toplam maliyet */}
            <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800">Toplam Tahmini Maliyet:</span>
                <span className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  <DollarSign className="w-6 h-6" />
                  {recommendationEngine.calculateTotalCost(recommendations).totalCost} TL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Recommendations */}
      {CRI > 0.4 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Öneriler</h3>
          
          <div className="space-y-3">
            {CRI > 0.6 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-semibold text-red-800 mb-2">🚨 ACİL MÜDAHALE GEREKLİ</div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Kültürü %30-50 oranında seyreltin</li>
                  <li>• Işık yoğunluğunu %40 azaltın</li>
                  <li>• pH'ı kontrol edin ve optimize edin</li>
                  <li>• Besin ortamını yenileyin (fed-batch)</li>
                </ul>
              </div>
            )}

            {topRisks[0][1] > 0.5 && topRisks[0][0] === 'NH3_toxicity' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-800 mb-2">⚠️ NH₃ Toksisitesi Yüksek</div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• pH'ı 7.0-7.2 aralığına düşürün (asit ekleyin)</li>
                  <li>• Havalandırmayı artırın</li>
                  <li>• Amonyum bazlı gübre kullanımını azaltın</li>
                </ul>
              </div>
            )}

            {topRisks[0][1] > 0.5 && topRisks[0][0] === 'night_hypoxia' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-800 mb-2">⚠️ Gece Oksijen Düşük</div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Gece havalandırmasını artırın</li>
                  <li>• Biyokütle yoğunluğunu azaltın (seyreltme)</li>
                  <li>• Karıştırmayı optimize edin</li>
                </ul>
              </div>
            )}

            {topRisks[0][1] > 0.5 && topRisks[0][0] === 'N_limitation' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="font-semibold text-orange-800 mb-2">⚠️ Azot Sınırlaması</div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• NaNO₃ veya KNO₃ ekleyin (50-100 mg/L)</li>
                  <li>• Fed-batch besleme başlatın</li>
                  <li>• TAN ve NO₃ seviyelerini ölçün</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk History Trend */}
      {riskHistory.length > 5 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📊 CRI Trendi (Son 24 Saat)</h3>
          
          <div className="h-32 flex items-end justify-between gap-1">
            {riskHistory.map((record, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t hover:opacity-80 transition-opacity cursor-pointer"
                style={{ height: `${record.CRI * 100}%` }}
                title={`Saat ${record.hour}: ${(record.CRI * 100).toFixed(0)}%`}
              ></div>
            ))}
          </div>
          
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>24 saat önce</span>
            <span>Şimdi</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
