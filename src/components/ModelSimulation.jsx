import React, { useState, useEffect } from 'react';
import { useChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

/**
 * ModelSimulation - Simülasyon Kontrol Paneli
 * 
 * Sistemplani.md uyumlu:
 * - ChlorellaModelV4 simülasyon kontrolü
 * - Progress tracking (real-time)
 * - Sonuç görselleştirme (biomass, NO3, PO4, CRI)
 * - Forecast comparison
 * 
 * Kullanım:
 *   <ModelSimulation tankId="TANK-001" />
 */

const ModelSimulation = ({ tankId }) => {
  const { api } = useChlorellaSystem();
  const [duration, setDuration] = useState(24); // saat
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Simülasyonu çalıştır
  const runSimulation = async () => {
    try {
      setIsRunning(true);
      setProgress(0);
      setError(null);
      setResults(null);

      // API'den simülasyon çalıştır
      const result = await api.runSimulation(tankId, duration, (update) => {
        // Progress callback
        setProgress(update.progress);
      });

      if (result.success) {
        setResults(result.snapshot);
      } else {
        setError(result.error || 'Simülasyon başarısız');
      }
    } catch (err) {
      setError(err.message);
      console.error('Simülasyon hatası:', err);
    } finally {
      setIsRunning(false);
      setProgress(0);
    }
  };

  // Mevcut snapshot'ı al (karşılaştırma için)
  const [currentSnapshot, setCurrentSnapshot] = useState(null);

  useEffect(() => {
    if (!tankId) return;

    try {
      const snapshot = api.getModelSnapshot(tankId);
      if (snapshot.success) {
        setCurrentSnapshot(snapshot.snapshot);
      }
    } catch (err) {
      console.error('Snapshot alınamadı:', err);
    }
  }, [tankId, api]);

  // Grafik çizimi (basit SVG)
  const SimpleChart = ({ data, label, unit, color }) => {
    if (!data || data.length < 2) return null;

    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h4 className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
          {label} ({unit})
        </h4>
        <svg viewBox="0 0 100 60" className="w-full h-32">
          {/* Grid */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y * 0.6}
              x2="100"
              y2={y * 0.6}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          
          {/* Start/End markers */}
          <circle cx={0} cy={(100 - ((data[0].value - min) / range) * 100) * 0.6} r="2" fill={color} />
          <circle 
            cx={100} 
            cy={(100 - ((data[data.length - 1].value - min) / range) * 100) * 0.6} 
            r="2" 
            fill={color} 
          />
        </svg>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{data[0].value.toFixed(2)}</span>
          <span>{data[data.length - 1].value.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  // Karşılaştırma kartı
  const ComparisonCard = ({ title, current, simulated, unit, icon }) => {
    const diff = simulated - current;
    const diffPercent = current !== 0 ? (diff / current) * 100 : 0;
    const isIncrease = diff > 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h4>
          <span className="text-2xl">{icon}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-500">Mevcut:</span>
            <span className="text-lg font-bold text-gray-800 dark:text-white">
              {current.toFixed(2)} {unit}
            </span>
          </div>
          
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-500">Simülasyon ({duration}h):</span>
            <span className="text-lg font-bold text-blue-600">
              {simulated.toFixed(2)} {unit}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 text-sm font-medium ${
            isIncrease ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{isIncrease ? '↑' : '↓'}</span>
            <span>{Math.abs(diff).toFixed(2)} {unit}</span>
            <span className="text-xs">({Math.abs(diffPercent).toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Model Simülasyonu - Tank {tankId}
        </h2>
      </div>

      {/* Kontrol Paneli */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Simülasyon Ayarları
        </h3>
        
        <div className="space-y-4">
          {/* Duration slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Simülasyon Süresi: {duration} saat
            </label>
            <input
              type="range"
              min="1"
              max="72"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1h</span>
              <span>24h</span>
              <span>48h</span>
              <span>72h</span>
            </div>
          </div>

          {/* Başlat butonu */}
          <button
            onClick={runSimulation}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? '⏳ Simülasyon Çalışıyor...' : '▶️ Simülasyonu Başlat'}
          </button>

          {/* Progress bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>İlerleme</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Hata mesajı */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">❌ {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sonuçlar */}
      {results && currentSnapshot && (
        <>
          {/* Karşılaştırma kartları */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Öngörülen Değişimler
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ComparisonCard
                title="Biyokütle"
                current={currentSnapshot.biology.biomass}
                simulated={results.biology.biomass}
                unit="g/L"
                icon="🦠"
              />
              <ComparisonCard
                title="NO₃ (Azot)"
                current={currentSnapshot.nutrients.NO3}
                simulated={results.nutrients.NO3}
                unit="mg/L"
                icon="🌱"
              />
              <ComparisonCard
                title="PO₄ (Fosfor)"
                current={currentSnapshot.nutrients.PO4}
                simulated={results.nutrients.PO4}
                unit="mg/L"
                icon="💧"
              />
              <ComparisonCard
                title="CRI (Risk)"
                current={currentSnapshot.risks.CRI}
                simulated={results.risks.CRI}
                unit=""
                icon="⚠️"
              />
            </div>
          </div>

          {/* Detay grafikleri */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Zaman Serisi Grafikleri
            </h3>
            
            {/* Zaman serisini oluştur (basit örnek) */}
            {(() => {
              const timePoints = 24; // 1 saatlik aralıklarla
              const biomassData = [];
              const no3Data = [];
              const po4Data = [];
              const criData = [];

              const biomassDiff = results.biology.biomass - currentSnapshot.biology.biomass;
              const no3Diff = results.nutrients.NO3 - currentSnapshot.nutrients.NO3;
              const po4Diff = results.nutrients.PO4 - currentSnapshot.nutrients.PO4;
              const criDiff = results.risks.CRI - currentSnapshot.risks.CRI;

              for (let i = 0; i <= timePoints; i++) {
                const t = i / timePoints;
                biomassData.push({ hour: i, value: currentSnapshot.biology.biomass + biomassDiff * t });
                no3Data.push({ hour: i, value: currentSnapshot.nutrients.NO3 + no3Diff * t });
                po4Data.push({ hour: i, value: currentSnapshot.nutrients.PO4 + po4Diff * t });
                criData.push({ hour: i, value: currentSnapshot.risks.CRI + criDiff * t });
              }

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <SimpleChart data={biomassData} label="Biyokütle" unit="g/L" color="#10b981" />
                  <SimpleChart data={no3Data} label="NO₃" unit="mg/L" color="#3b82f6" />
                  <SimpleChart data={po4Data} label="PO₄" unit="mg/L" color="#8b5cf6" />
                  <SimpleChart data={criData} label="CRI" unit="" color="#f59e0b" />
                </div>
              );
            })()}
          </div>

          {/* Risk analizi */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-3">
              ⚠️ Risk Değerlendirmesi ({duration} saat sonra)
            </h4>
            <div className="space-y-2">
              {Object.entries(results.risks.risks)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, value]) => (
                  <div key={name} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className={`text-sm font-bold ${
                      value >= 0.7 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Bilgilendirme */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">
          📘 Simülasyon Hakkında
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Monod kinetik + stokiyometri ile gerçek matematiksel model</li>
          <li>• dt = 0.1 saat (6 dakika) zaman adımı</li>
          <li>• 16 Boyd-Losordo risk senaryosu değerlendirmesi</li>
          <li>• Deterministic (random sayı yok)</li>
          <li>• Performans: ~100-200ms per simülasyon saati</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelSimulation;
