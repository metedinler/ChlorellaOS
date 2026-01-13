import React, { useState } from 'react';
import { Calculator, FlaskConical, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateMediaStoichiometry, formatStoichiometryResults } from '../utils/stoichiometryCalculator';

/**
 * Stokiyometrik Hesaplama Butonu ve Sonuç Gösterimi
 * Özel besin yerlerinin tam su kimyası analizini yapar
 */
const StoichiometryButton = ({ formulation }) => {
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const calculateStoichiometry = () => {
    console.log('🔍 Formulation alındı:', formulation);
    
    if (!formulation || !formulation.stocks || formulation.stocks.length === 0) {
      alert('❌ Formülasyonda stok bilgisi bulunamadı!');
      return;
    }

    // Stok çözeltilerini hesaplama formatına dönüştür
    const stocksForCalculation = [];
    
    formulation.stocks.forEach(stock => {
      console.log('📦 Stok işleniyor:', stock.name, stock);
      
      if (!stock.chemicals || stock.chemicals.length === 0) {
        console.warn('⚠️ Stokta kimyasal yok:', stock.name);
        return;
      }
      
      stock.chemicals.forEach(chem => {
        console.log('🧪 Kimyasal:', chem);
        
        // Her kimyasal için final konsantrasyonu hesapla
        // Formül: (stok içindeki miktar g / stok hacmi L) * (kullanım ml / 1000)
        const stockConc_g_per_L = chem.amount / (stock.stockVolume / 1000); // g/L stok konsantrasyonu
        const finalConc_g_per_L = stockConc_g_per_L * (stock.usageAmount / 1000); // Final konsantrasyon
        
        stocksForCalculation.push({
          chemical: chem.formula || chem.name, // formula yoksa name kullan
          concentration_g_per_L: finalConc_g_per_L,
          stockName: stock.name
        });
      });
    });

    console.log('📊 Dönüştürülen stoklar:', stocksForCalculation);

    // Hesaplama yap
    try {
      const rawResults = calculateMediaStoichiometry(
        stocksForCalculation,
        formulation.cultureVolume || 1
      );
      
      console.log('✅ Ham sonuçlar:', rawResults);
      
      const formatted = formatStoichiometryResults(rawResults);
      
      console.log('✅ Formatlanmış sonuçlar:', formatted);
      
      setResults({ raw: rawResults, formatted });
      setShowResults(true);
    } catch (error) {
      console.error('❌ Hesaplama hatası:', error);
      alert('❌ Hesaplama sırasında hata oluştu:\n' + error.message);
    }
  };

  return (
    <>
      <button
        onClick={calculateStoichiometry}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
      >
        <Calculator className="w-4 h-4" />
        Stokiyometri Hesapla
      </button>

      {showResults && results && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-8 h-8" />
                  <div>
                    <h3 className="text-2xl font-bold">Stokiyometrik Analiz</h3>
                    <p className="text-purple-100 text-sm">
                      {formulation.name} - {formulation.cultureVolume}L
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResults(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Uyarılar */}
              {results.raw.warnings.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-bold text-yellow-800">Uyarılar</h4>
                  </div>
                  <ul className="space-y-1 text-sm text-yellow-700">
                    {results.raw.warnings.map((warn, idx) => (
                      <li key={idx}>• {warn}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ana Parametreler */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Ana Su Kimyası Parametreleri
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(results.formatted.summary).map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-xs text-gray-600 font-medium">{key}</div>
                      <div className="text-xl font-bold text-blue-600">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Azot Fraksiyonları */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">🔬 Azot Fraksiyonları</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(results.formatted.nitrogen).map(([key, value]) => {
                    const isWarning = key === 'NH₃-N' && parseFloat(value) > 0.5;
                    return (
                      <div
                        key={key}
                        className={`rounded-lg p-4 border-2 ${
                          isWarning
                            ? 'bg-red-50 border-red-400'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-600">{key}</div>
                        <div className={`text-xl font-bold ${isWarning ? 'text-red-600' : 'text-green-600'}`}>
                          {value}
                        </div>
                        {isWarning && (
                          <div className="text-xs text-red-600 mt-1">⚠️ TOKSİK!</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fosfor */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">💠 Fosfor</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(results.formatted.phosphorus).map(([key, value]) => (
                    <div key={key} className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                      <div className="text-xs font-medium text-gray-600">{key}</div>
                      <div className="text-xl font-bold text-purple-600">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Makro Elementler */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">⚛️ Makro Elementler</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(results.formatted.macros).map(([key, value]) => (
                    <div key={key} className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                      <div className="text-xs font-medium text-gray-600">{key}</div>
                      <div className="text-xl font-bold text-orange-600">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stok Detayları */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Stok Çözeltileri Detayları</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left">Kimyasal</th>
                        <th className="p-3 text-right">Konsantrasyon (g/L)</th>
                        <th className="p-3 text-right">Final (mg/L)</th>
                        <th className="p-3 text-right">N katkısı</th>
                        <th className="p-3 text-right">P katkısı</th>
                        <th className="p-3 text-right">K katkısı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.raw.stockDetails.map((stock, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-semibold">{stock.chemical}</td>
                          <td className="p-3 text-right">{stock.concentration_g_per_L.toFixed(3)}</td>
                          <td className="p-3 text-right">{stock.finalConc_mg_L.toFixed(1)}</td>
                          <td className="p-3 text-right text-green-600 font-medium">
                            {stock.contributions.N > 0 ? `${stock.contributions.N} mg/L` : '-'}
                          </td>
                          <td className="p-3 text-right text-purple-600 font-medium">
                            {stock.contributions.P > 0 ? `${stock.contributions.P} mg/L` : '-'}
                          </td>
                          <td className="p-3 text-right text-orange-600 font-medium">
                            {stock.contributions.K > 0 ? `${stock.contributions.K} mg/L` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* pH Etkileri */}
              {(results.raw.acidicComponents.length > 0 ||
                results.raw.basicComponents.length > 0 ||
                results.raw.bufferComponents.length > 0) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">⚗️ pH Etkileri</h4>
                  
                  {results.raw.acidicComponents.length > 0 && (
                    <div className="mb-4">
                      <div className="font-semibold text-red-600 mb-2">Asidik Bileşenler:</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {results.raw.acidicComponents.map((comp, idx) => (
                          <li key={idx}>
                            • {comp.name} ({comp.formula}): {comp.concentration.toFixed(3)} g/L
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {results.raw.basicComponents.length > 0 && (
                    <div className="mb-4">
                      <div className="font-semibold text-blue-600 mb-2">Bazik Bileşenler:</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {results.raw.basicComponents.map((comp, idx) => (
                          <li key={idx}>
                            • {comp.name} ({comp.formula}): {comp.concentration.toFixed(3)} g/L
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {results.raw.bufferComponents.length > 0 && (
                    <div>
                      <div className="font-semibold text-green-600 mb-2">Buffer Bileşenler:</div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {results.raw.bufferComponents.map((comp, idx) => (
                          <li key={idx}>
                            • {comp.name} ({comp.formula}): {comp.concentration.toFixed(3)} g/L - pKa: {comp.pKa}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Kapat Butonu */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoichiometryButton;
