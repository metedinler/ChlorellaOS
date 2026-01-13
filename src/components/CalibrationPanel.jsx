import React, { useState, useEffect } from 'react';
import { useChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

/**
 * CalibrationPanel - OD-Biomass Kalibrasyon Yönetimi
 * 
 * Sistemplani.md uyumlu:
 * - CalibrationService API kullanımı
 * - R² kalite göstergesi
 * - Yeni kalibrasyon noktası ekleme
 * - Kalibrasyon eğrisi görselleştirme
 * - Dalga boyu seçimi (680nm, 750nm)
 * 
 * Kullanım:
 *   <CalibrationPanel />
 */

const CalibrationPanel = () => {
  const { api } = useChlorellaSystem();
  const [calibrationData, setCalibrationData] = useState(null);
  const [wavelength, setWavelength] = useState(680);
  const [newPoint, setNewPoint] = useState({ OD: '', biomass: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Kalibrasyon verilerini yükle
  useEffect(() => {
    loadCalibrationData();
  }, []);

  const loadCalibrationData = () => {
    try {
      const quality = api.getCalibrationQuality();
      setCalibrationData(quality);
      setError(null);
    } catch (err) {
      setError('Kalibrasyon verileri yüklenemedi: ' + err.message);
      console.error(err);
    }
  };

  // Yeni kalibrasyon noktası ekle
  const addCalibrationPoint = () => {
    try {
      const OD = parseFloat(newPoint.OD);
      const biomass = parseFloat(newPoint.biomass);

      if (isNaN(OD) || isNaN(biomass)) {
        setError('Geçerli sayısal değerler girin');
        return;
      }

      if (OD <= 0 || biomass <= 0) {
        setError('OD ve Biomass pozitif olmalı');
        return;
      }

      // API'ye ekle
      api.addCalibrationPoint(wavelength, OD, biomass);

      // Başarı mesajı
      setSuccess(`✅ Kalibrasyon noktası eklendi: OD${wavelength}=${OD}, Biomass=${biomass}g/L`);
      setError(null);

      // Formu temizle
      setNewPoint({ OD: '', biomass: '' });

      // Verileri yeniden yükle
      setTimeout(() => {
        loadCalibrationData();
        setSuccess(null);
      }, 2000);

    } catch (err) {
      setError('Kalibrasyon noktası eklenemedi: ' + err.message);
      console.error(err);
    }
  };

  // R² renk kodlaması
  const getR2Color = (r2) => {
    if (r2 >= 0.95) return { color: '#10b981', label: 'Mükemmel' };
    if (r2 >= 0.90) return { color: '#eab308', label: 'İyi' };
    return { color: '#dc2626', label: 'Zayıf - Yeniden Kalibrasyon Gerekli' };
  };

  // Kalibrasyon eğrisi görselleştirmesi
  const CalibrationCurve = ({ points, equation, r2 }) => {
    if (!points || points.length === 0) return null;

    const maxOD = Math.max(...points.map(p => p[`OD_${wavelength}`] || 0));
    const maxBiomass = Math.max(...points.map(p => p.biomass));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Kalibrasyon Eğrisi (OD{wavelength} nm)
        </h3>

        <svg viewBox="0 0 100 100" className="w-full h-64 mb-4">
          {/* Eksenler */}
          <line x1="10" y1="90" x2="95" y2="90" stroke="#6b7280" strokeWidth="0.5" />
          <line x1="10" y1="5" x2="10" y2="90" stroke="#6b7280" strokeWidth="0.5" />

          {/* Grid çizgileri */}
          {[0, 25, 50, 75, 100].map(i => (
            <React.Fragment key={i}>
              <line
                x1="10"
                y1={5 + i * 0.85}
                x2="95"
                y2={5 + i * 0.85}
                stroke="#e5e7eb"
                strokeWidth="0.3"
              />
              <line
                x1={10 + i * 0.85}
                y1="5"
                x2={10 + i * 0.85}
                y2="90"
                stroke="#e5e7eb"
                strokeWidth="0.3"
              />
            </React.Fragment>
          ))}

          {/* Kalibrasyon noktaları */}
          {points.map((p, i) => {
            const od = p[`OD_${wavelength}`] || 0;
            const x = 10 + (od / maxOD) * 85;
            const y = 90 - (p.biomass / maxBiomass) * 85;
            
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="2" fill="#3b82f6" />
                <text
                  x={x}
                  y={y - 3}
                  fontSize="3"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Regresyon çizgisi */}
          {equation && (() => {
            const { slope, intercept } = equation;
            const x1 = 10;
            const y1 = 90 - ((intercept) / maxBiomass) * 85;
            const x2 = 95;
            const biomassAtMaxOD = slope * maxOD + intercept;
            const y2 = 90 - (biomassAtMaxOD / maxBiomass) * 85;

            return (
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#f59e0b"
                strokeWidth="0.8"
                strokeDasharray="2,1"
              />
            );
          })()}

          {/* Eksen etiketleri */}
          <text x="50" y="98" fontSize="4" fill="#6b7280" textAnchor="middle">
            OD{wavelength} (AU)
          </text>
          <text
            x="5"
            y="50"
            fontSize="4"
            fill="#6b7280"
            textAnchor="middle"
            transform="rotate(-90 5 50)"
          >
            Biomass (g/L)
          </text>
        </svg>

        {/* Denklem ve R² */}
        {equation && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <div className="text-sm font-mono text-blue-800 dark:text-blue-400">
              Biomass = {equation.slope.toFixed(3)} × OD{wavelength} + {equation.intercept.toFixed(3)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              R² = {r2.toFixed(4)} ({getR2Color(r2).label})
            </div>
          </div>
        )}
      </div>
    );
  };

  // Kalibrasyon noktaları tablosu
  const CalibrationTable = ({ points }) => {
    if (!points || points.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Henüz kalibrasyon noktası yok. Lütfen ekleyin.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                OD{wavelength} (AU)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Biomass (g/L)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ratio
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {points.map((point, index) => {
              const od = point[`OD_${wavelength}`] || 0;
              const ratio = od > 0 ? point.biomass / od : 0;
              
              return (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {od.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {point.biomass.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ratio.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (!calibrationData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const r2Info = getR2Color(calibrationData.R2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Kalibrasyon Yönetimi
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          OD-Biomass kalibrasyon eğrisi ve veri noktaları
        </p>
      </div>

      {/* Kalite göstergesi */}
      <div className={`rounded-lg p-4 border-2`} style={{ 
        borderColor: r2Info.color,
        backgroundColor: r2Info.color + '10'
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg" style={{ color: r2Info.color }}>
              Kalibrasyon Kalitesi: {r2Info.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              R² = {calibrationData.R2.toFixed(4)} | 
              {calibrationData.calibrationPoints?.length || 0} veri noktası
            </p>
          </div>
          <div className="text-4xl">
            {calibrationData.R2 >= 0.95 ? '✅' : calibrationData.R2 >= 0.90 ? '⚠️' : '❌'}
          </div>
        </div>
      </div>

      {/* Dalga boyu seçimi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Dalga Boyu Seçimi
        </h3>
        <div className="flex gap-4">
          {[680, 750].map(wl => (
            <button
              key={wl}
              onClick={() => setWavelength(wl)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                wavelength === wl
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {wl} nm {wl === 680 && '(Chlorophyll a)'}
            </button>
          ))}
        </div>
      </div>

      {/* Yeni nokta ekleme */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Yeni Kalibrasyon Noktası Ekle
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              OD{wavelength} (AU)
            </label>
            <input
              type="number"
              step="0.001"
              value={newPoint.OD}
              onChange={(e) => setNewPoint({ ...newPoint, OD: e.target.value })}
              placeholder="0.500"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biomass (g/L)
            </label>
            <input
              type="number"
              step="0.001"
              value={newPoint.biomass}
              onChange={(e) => setNewPoint({ ...newPoint, biomass: e.target.value })}
              placeholder="2.500"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addCalibrationPoint}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              ➕ Ekle
            </button>
          </div>
        </div>

        {/* Mesajlar */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}
      </div>

      {/* Kalibrasyon eğrisi */}
      <CalibrationCurve
        points={calibrationData.calibrationPoints}
        equation={calibrationData.equation}
        r2={calibrationData.R2}
      />

      {/* Kalibrasyon tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
          Kalibrasyon Noktaları
        </h3>
        <CalibrationTable points={calibrationData.calibrationPoints} />
      </div>

      {/* Bilgilendirme */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2">
          📘 Kalibrasyon Hakkında
        </h4>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• <strong>R² &gt; 0.95:</strong> Mükemmel kalibrasyon, güvenle kullanılabilir</li>
          <li>• <strong>R² = 0.90-0.95:</strong> İyi kalibrasyon, kabul edilebilir</li>
          <li>• <strong>R² &lt; 0.90:</strong> Zayıf kalibrasyon, yeniden kalibrasyon önerilir</li>
          <li>• En az 5 veri noktası kullanılması önerilir (geniş OD aralığı)</li>
          <li>• Spectrophotometer: OD 0.1-2.0 AU aralığında en hassas</li>
          <li>• 680 nm: Chlorophyll a absorbsiyon maksimumu</li>
          <li>• 750 nm: Işık saçılması (turbidite) ölçümü</li>
        </ul>
      </div>
    </div>
  );
};

export default CalibrationPanel;
