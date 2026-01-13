import React, { useState, useEffect } from 'react';
import { useChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

/**
 * RiskDashboard - 16 Risk Senaryosu + CRI Gösterge Paneli
 * 
 * Sistemplani.md uyumlu:
 * - Read-only UI (dispatch yok, sadece görselleştirme)
 * - Model snapshot'tan risk verileri
 * - 16 Boyd-Losordo risk senaryosu
 * - Composite Risk Index (CRI) gauge
 * 
 * Kullanım:
 *   <RiskDashboard tankId="TANK-001" />
 */

const RiskDashboard = ({ tankId }) => {
  const { api } = useChlorellaSystem();
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Risk verilerini yükle
  useEffect(() => {
    if (!tankId) return;

    const loadRiskData = async () => {
      try {
        setLoading(true);
        
        // Model snapshot'tan risk assessment al
        const riskAssessment = api.getRiskAssessment(tankId);
        
        if (riskAssessment && riskAssessment.risks) {
          setRiskData(riskAssessment);
          
          // History'ye ekle (son 24 saat)
          setHistory(prev => {
            const newHistory = [...prev, {
              timestamp: Date.now(),
              CRI: riskAssessment.CRI,
              level: riskAssessment.level
            }];
            
            // Son 24 saat (144 veri noktası, 10dk aralık)
            return newHistory.slice(-144);
          });
        }
      } catch (error) {
        console.error('Risk verileri yüklenemedi:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRiskData();
    
    // Her 5 dakikada bir güncelle
    const interval = setInterval(loadRiskData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [tankId, api]);

  // CRI seviyesi rengi
  const getCRIColor = (cri) => {
    if (cri >= 0.8) return '#dc2626'; // Kırmızı - Kritik
    if (cri >= 0.5) return '#f59e0b'; // Turuncu - Yüksek
    if (cri >= 0.3) return '#eab308'; // Sarı - Orta
    return '#10b981'; // Yeşil - Düşük
  };

  // Risk kategorileri
  const riskCategories = {
    nutrients: {
      name: 'Besin Limitasyonu',
      icon: '🌱',
      risks: ['N_limitation', 'P_limitation', 'N_P_imbalance']
    },
    gas_pH: {
      name: 'Gaz ve pH',
      icon: '💨',
      risks: ['pH_instability', 'CO2_limitation', 'O2_depletion', 'night_hypoxia']
    },
    toxicity: {
      name: 'Toksik Riskler',
      icon: '☠️',
      risks: ['NH3_toxicity', 'heavy_metals', 'contaminant_risk']
    },
    biology: {
      name: 'Biyolojik Riskler',
      icon: '🦠',
      risks: ['light_limitation', 'temperature_stress', 'dead_biomass']
    },
    system: {
      name: 'Sistem Riskleri',
      icon: '⚙️',
      risks: ['crash_risk', 'low_productivity', 'process_failure']
    }
  };

  // Risk adını formatla
  const formatRiskName = (riskKey) => {
    return riskKey
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Risk seviyesi çubuğu
  const RiskBar = ({ name, value, threshold = 0.7 }) => {
    const percentage = value * 100;
    const isHigh = value >= threshold;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatRiskName(name)}
          </span>
          <span className={`text-sm font-bold ${isHigh ? 'text-red-600' : 'text-gray-600'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              value >= 0.8 ? 'bg-red-600' :
              value >= 0.5 ? 'bg-orange-500' :
              value >= 0.3 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  // CRI Gauge (Dairesel)
  const CRIGauge = ({ cri, level }) => {
    const percentage = cri * 100;
    const color = getCRIColor(cri);
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Composite Risk Index (CRI)
        </h3>
        
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke={color}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>
              {percentage.toFixed(0)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {level?.level || 'Unknown'}
            </span>
          </div>
        </div>

        {/* Level indicator */}
        <div className="mt-4 px-4 py-2 rounded-full text-sm font-medium" style={{ 
          backgroundColor: color + '20', 
          color 
        }}>
          {level?.message || 'Risk değerlendiriliyor...'}
        </div>
      </div>
    );
  };

  // CRI Trend (Son 24 saat)
  const CRITrend = ({ history }) => {
    if (history.length < 2) return null;

    const maxCRI = Math.max(...history.map(h => h.CRI));
    const points = history.map((h, i) => {
      const x = (i / (history.length - 1)) * 100;
      const y = 100 - (h.CRI / maxCRI) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h4 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
          CRI Trend (24 Saat)
        </h4>
        <svg viewBox="0 0 100 50" className="w-full h-24">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y / 2}
              x2="100"
              y2={y / 2}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* CRI line */}
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>24h önce</span>
          <span>Şimdi</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!riskData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          ⚠️ Tank {tankId} için risk verileri bulunamadı. Model başlatılmamış olabilir.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Risk Dashboard - Tank {tankId}
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Son güncelleme: {new Date(riskData.timestamp).toLocaleTimeString('tr-TR')}
        </div>
      </div>

      {/* CRI Gauge ve Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CRIGauge cri={riskData.CRI} level={riskData.level} />
        <CRITrend history={history} />
      </div>

      {/* Risk Kategorileri */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.entries(riskCategories).map(([key, category]) => (
          <div key={key} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800 dark:text-white">
              <span className="text-2xl mr-2">{category.icon}</span>
              {category.name}
            </h3>
            
            <div className="space-y-3">
              {category.risks.map(riskKey => {
                const value = riskData.risks[riskKey] || 0;
                return <RiskBar key={riskKey} name={riskKey} value={value} />;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Top 3 Kritik Riskler */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-red-800 dark:text-red-400">
          🚨 En Yüksek 3 Risk
        </h3>
        <div className="space-y-3">
          {Object.entries(riskData.risks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, value], index) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-red-600">#{index + 1}</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatRiskName(name)}
                  </span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {(value * 100).toFixed(0)}%
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Risk Açıklamaları */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">
          📘 Risk Seviyeleri
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="font-medium">Düşük (0-30%)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Normal işletme</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="font-medium">Orta (30-50%)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">İzleme gerekli</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="font-medium">Yüksek (50-80%)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Müdahale öneriliyor</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
              <span className="font-medium">Kritik (80-100%)</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Acil müdahale!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDashboard;
