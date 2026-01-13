import React, { useState } from 'react';
import { calculatePhosphate, calculateNitrogen } from '../utils/stoichiometryEngine.js';

const SpectroCalculator = () => {
  const [activeTest, setActiveTest] = useState('phosphate');
  const [phosphateData, setPhosphateData] = useState({
    absorbance: '',
    volume: 1
  });
  const [nitrogenData, setNitrogenData] = useState({
    absorbance: '',
    method: 'Nessler',
    volume: 1
  });
  const [phosphateResult, setPhosphateResult] = useState(null);
  const [nitrogenResult, setNitrogenResult] = useState(null);

  const handlePhosphateCalculate = () => {
    try {
      const result = calculatePhosphate(
        parseFloat(phosphateData.absorbance),
        parseFloat(phosphateData.volume)
      );
      setPhosphateResult(result);
    } catch (error) {
      alert('Hesaplama hatası: ' + error.message);
    }
  };

  const handleNitrogenCalculate = () => {
    try {
      const result = calculateNitrogen(
        parseFloat(nitrogenData.absorbance),
        nitrogenData.method,
        parseFloat(nitrogenData.volume)
      );
      setNitrogenResult(result);
    } catch (error) {
      alert('Hesaplama hatası: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">🔬 Spektrofotometre Hesaplayıcı</h2>
        <p className="text-purple-100">Absorbans → Konsantrasyon Dönüşümü</p>
      </div>

      {/* Test Seçimi */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setActiveTest('phosphate')}
            className={`p-6 rounded-lg border-2 transition-all ${
              activeTest === 'phosphate'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="text-2xl mb-2">💧</div>
            <div className="font-bold text-xl">Fosfor (PO4-P)</div>
            <div className="text-sm text-gray-600 mt-2">Molibden Mavisi</div>
            <div className="text-sm text-gray-600">880 nm</div>
          </button>

          <button
            onClick={() => setActiveTest('nitrogen')}
            className={`p-6 rounded-lg border-2 transition-all ${
              activeTest === 'nitrogen'
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="text-2xl mb-2">🌿</div>
            <div className="font-bold text-xl">Azot (NH4-N)</div>
            <div className="text-sm text-gray-600 mt-2">Nessler / Salicylate</div>
            <div className="text-sm text-gray-600">425 / 655 nm</div>
          </button>
        </div>
      </div>

      {/* Fosfor Testi */}
      {activeTest === 'phosphate' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <h3 className="text-2xl font-bold mb-4 text-blue-800">
              🧪 Fosfor Analizi (Molybdenum Blue)
            </h3>

            {/* Uyarı */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                <div>
                  <div className="font-bold text-yellow-800 mb-1">Ölçüm Öncesi Kontrol</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>✓ Numuneyi <strong>0.45 µm filtreden</strong> geçirin</li>
                    <li>✓ Reaksiyon süresini bekleyin: <strong>20 dakika</strong></li>
                    <li>✓ Blank (boş) ile kalibre edin</li>
                    <li>✓ Oda sıcaklığında ölçüm yapın (20-25°C)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Giriş Formu */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Absorbans Değeri (880 nm)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={phosphateData.absorbance}
                  onChange={(e) => setPhosphateData({...phosphateData, absorbance: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 0.245"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Geçerli aralık: 0.000 - 1.000 (linearity limit)
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numune Hacmi (Litre)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={phosphateData.volume}
                  onChange={(e) => setPhosphateData({...phosphateData, volume: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 1.0"
                />
              </div>

              <button
                onClick={handlePhosphateCalculate}
                disabled={!phosphateData.absorbance}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                📊 Fosfor Konsantrasyonunu Hesapla
              </button>
            </div>
          </div>

          {/* Fosfor Sonuçları */}
          {phosphateResult && (
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-blue-300">
              <h4 className="text-xl font-bold mb-4 text-blue-800">📈 Analiz Sonuçları</h4>

              {/* Konsantrasyon */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg mb-4">
                <div className="text-sm opacity-90 mb-1">PO4-P Konsantrasyonu</div>
                <div className="text-4xl font-bold">
                  {phosphateResult.concentration.toFixed(3)} mg/L
                </div>
                <div className="text-sm opacity-90 mt-1">
                  = {phosphateResult.ppm.toFixed(3)} ppm
                </div>
              </div>

              {/* Değerlendirme */}
              <div className={`p-4 rounded-lg mb-4 ${
                phosphateResult.status === 'critical' ? 'bg-red-100 border-2 border-red-400' :
                phosphateResult.status === 'warning' ? 'bg-yellow-100 border-2 border-yellow-400' :
                phosphateResult.status === 'low' ? 'bg-orange-100 border-2 border-orange-400' :
                'bg-green-100 border-2 border-green-400'
              }`}>
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">
                    {phosphateResult.status === 'critical' ? '🚨' :
                     phosphateResult.status === 'warning' ? '⚠️' :
                     phosphateResult.status === 'low' ? '📉' : '✅'}
                  </div>
                  <div className="font-bold text-lg">
                    {phosphateResult.interpretation}
                  </div>
                </div>
                <div className="text-sm">
                  <strong>Öneri:</strong> {phosphateResult.recommendation}
                </div>
              </div>

              {/* Ek Bilgiler */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Metod:</span>
                  <span className="font-medium">Molybdenum Blue (Antimony-free)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dalga boyu:</span>
                  <span className="font-medium">880 nm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Detection Limit:</span>
                  <span className="font-medium">0.01 mg/L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Numune Hacmi:</span>
                  <span className="font-medium">{phosphateData.volume} L</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Azot Testi */}
      {activeTest === 'nitrogen' && (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-bold mb-4 text-green-800">
              🌱 Azot Analizi (Amonyum)
            </h3>

            {/* Uyarı */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-600 text-xl mr-3">⚠️</div>
                <div>
                  <div className="font-bold text-yellow-800 mb-1">Ölçüm Öncesi Kontrol</div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>✓ Numuneyi <strong>0.45 µm filtreden</strong> geçirin</li>
                    <li>✓ <strong>Nessler:</strong> 10 dakika bekleme, 425 nm</li>
                    <li>✓ <strong>Salicylate:</strong> 20 dakika bekleme, 655 nm</li>
                    <li>✓ Blank (boş) ile kalibre edin</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Metod Seçimi */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analiz Metodu
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setNitrogenData({...nitrogenData, method: 'Nessler'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    nitrogenData.method === 'Nessler'
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="font-bold">Nessler Reaktifi</div>
                  <div className="text-sm text-gray-600">425 nm</div>
                  <div className="text-xs text-gray-500 mt-1">Hızlı (10 dk)</div>
                </button>
                <button
                  onClick={() => setNitrogenData({...nitrogenData, method: 'Salicylate'})}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    nitrogenData.method === 'Salicylate'
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="font-bold">Salicylate</div>
                  <div className="text-sm text-gray-600">655 nm</div>
                  <div className="text-xs text-gray-500 mt-1">Daha hassas (20 dk)</div>
                </button>
              </div>
            </div>

            {/* Giriş Formu */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Absorbans Değeri ({nitrogenData.method === 'Nessler' ? '425' : '655'} nm)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={nitrogenData.absorbance}
                  onChange={(e) => setNitrogenData({...nitrogenData, absorbance: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: 0.185"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Geçerli aralık: 0.000 - 1.000
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numune Hacmi (Litre)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={nitrogenData.volume}
                  onChange={(e) => setNitrogenData({...nitrogenData, volume: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: 1.0"
                />
              </div>

              <button
                onClick={handleNitrogenCalculate}
                disabled={!nitrogenData.absorbance}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                📊 Azot Konsantrasyonunu Hesapla
              </button>
            </div>
          </div>

          {/* Azot Sonuçları */}
          {nitrogenResult && (
            <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-green-300">
              <h4 className="text-xl font-bold mb-4 text-green-800">📈 Analiz Sonuçları</h4>

              {/* Konsantrasyon */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg mb-4">
                <div className="text-sm opacity-90 mb-1">NH4-N Konsantrasyonu</div>
                <div className="text-4xl font-bold">
                  {nitrogenResult.concentration.toFixed(3)} mg/L
                </div>
                <div className="text-sm opacity-90 mt-1">
                  = {nitrogenResult.ppm.toFixed(3)} ppm
                </div>
              </div>

              {/* Değerlendirme */}
              <div className={`p-4 rounded-lg mb-4 ${
                nitrogenResult.status === 'critical' ? 'bg-red-100 border-2 border-red-400' :
                nitrogenResult.status === 'warning' ? 'bg-yellow-100 border-2 border-yellow-400' :
                nitrogenResult.status === 'low' ? 'bg-orange-100 border-2 border-orange-400' :
                'bg-green-100 border-2 border-green-400'
              }`}>
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-3">
                    {nitrogenResult.status === 'critical' ? '🚨' :
                     nitrogenResult.status === 'warning' ? '⚠️' :
                     nitrogenResult.status === 'low' ? '📉' : '✅'}
                  </div>
                  <div className="font-bold text-lg">
                    {nitrogenResult.interpretation}
                  </div>
                </div>
                <div className="text-sm">
                  <strong>Öneri:</strong> {nitrogenResult.recommendation}
                </div>
              </div>

              {/* Ek Bilgiler */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Metod:</span>
                  <span className="font-medium">{nitrogenResult.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dalga boyu:</span>
                  <span className="font-medium">{nitrogenData.method === 'Nessler' ? '425' : '655'} nm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Detection Limit:</span>
                  <span className="font-medium">0.01 mg/L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Numune Hacmi:</span>
                  <span className="font-medium">{nitrogenData.volume} L</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Kalibasyon Notu */}
      <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
        <h4 className="font-bold text-lg mb-3 text-purple-800">🎯 Kalibrasyon Notları</h4>
        <div className="space-y-3 text-sm">
          <div className="bg-white p-3 rounded">
            <div className="font-medium text-purple-700 mb-1">📐 Fosfor (PO4-P)</div>
            <div className="text-gray-700">
              • Standart: KH2PO4 (Potasyum Dihidrojen Fosfat)<br />
              • Konsantrasyon aralığı: 0.1 - 10 mg/L<br />
              • Epsilon (ε): ~15,000 L/(mol·cm) @ 880 nm<br />
              • R² ≥ 0.995 gerekli
            </div>
          </div>

          <div className="bg-white p-3 rounded">
            <div className="font-medium text-purple-700 mb-1">📐 Azot (NH4-N)</div>
            <div className="text-gray-700">
              • Standart: (NH4)2SO4 (Amonyum Sülfat)<br />
              • Konsantrasyon aralığı: 0.1 - 5 mg/L<br />
              • Nessler ε: ~20,000 @ 425 nm<br />
              • Salicylate ε: ~25,000 @ 655 nm<br />
              • R² ≥ 0.995 gerekli
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2">💡</div>
              <div className="text-gray-700">
                <strong>Kalibrasyon frekansı:</strong> Her kullanımdan önce blank kontrolü,
                tam kalibrasyon ayda 1 kez veya reaktif değişiminde.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectroCalculator;</tml:parameter>
</invoke>