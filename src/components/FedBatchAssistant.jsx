import React, { useState, useEffect } from 'react';
import { Syringe, AlertCircle, CheckCircle, TrendingUp, Beaker, Calendar } from 'lucide-react';
import { addIntervention } from '../utils/interventionManager';
import { useMaterials } from '../contexts/MaterialsContext';
import { getChemicalDisplayName } from '../utils/chemicalNames';

/**
 * FED-BATCH ASİSTAN
 * Model V3'ün müdahale önerilerini kullanıcıya sunar
 * Dozaj hesaplayıcı ile entegre
 * Tek tıkla onay veya manuel düzenleme
 */
const FedBatchAssistant = ({ tankId, modelSuggestions, onInterventionAdded }) => {
  const { reduceStock } = useMaterials();
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [customData, setCustomData] = useState({
    amount: '',
    concentration: '',
    notes: ''
  });

  // İlk öneriyi seç
  useEffect(() => {
    if (modelSuggestions && modelSuggestions.length > 0) {
      setSelectedSuggestion(modelSuggestions[0]);
      setCustomData({
        amount: modelSuggestions[0].suggestedAmount,
        concentration: '',
        notes: modelSuggestions[0].reason
      });
    }
  }, [modelSuggestions]);

  const handleApprove = async (suggestion) => {
    if (!tankId) {
      alert('Tank seçiniz');
      return;
    }

    // Model entegrasyonu (dynamic import)
    const modelManager = (await import('../managers/ModelManager.js')).default;

    // ✨ STOK AZALTMA: Besin maddesini stoklardan düş
    const amountToUse = manualMode ? parseFloat(customData.amount) : suggestion.suggestedAmount;
    
    // mg/L'yi gram'a çevir (tankVolume bilgisi yoksa kullanıcıdan iste)
    // Örnek: 1000L tank için 100 mg/L = 100 gram
    // Basitleştirme: Direkt mg biriminde kullan veya g'ye çevir
    const amountInGrams = amountToUse / 1000; // mg → g dönüşümü
    
    const stockResult = reduceStock(
      suggestion.nutrient,
      amountInGrams,
      'g',
      {
        type: 'fedbatch',
        tankId: tankId,
        modelDay: suggestion.day,
        reason: suggestion.reason,
        timestamp: new Date().toISOString()
      }
    );

    if (!stockResult.success) {
      alert('❌ STOK YETERSİZ!\n\n' + stockResult.error + '\n\nMüdahale uygulanamadı.');
      return;
    }

    // 🧠 MODEL'E BİLDİR - FED-BATCH ANALİZİ
    const fedbatchData = {
      nutrient: suggestion.nutrient,
      amount_ml: amountToUse / 100, // mg/L → ml (concentration 100 mg/ml varsayımı)
      concentration: parseFloat(customData.concentration) || 100
    };

    const analysisResult = await modelManager.assimilateRealData(tankId, {
      fedbatch: fedbatchData
    });

    // Müdahaleyi kaydet
    const intervention = {
      tankId,
      date: new Date().toISOString(),
      type: 'fedbatch',
      parameters: {
        nutrient: suggestion.nutrient,
        amount: amountToUse,
        unit: 'mg/L',
        concentration: customData.concentration
      },
      reason: suggestion.reason,
      notes: customData.notes,
      source: 'model_suggestion',
      modelDay: suggestion.day,
      stockTransactionId: stockResult.transaction.id
    };

    try {
      addIntervention(intervention);
      
      // Analiz sonucu ile birlikte feedback
      let message = `✅ Müdahale kaydedildi ve stoktan düşüldü:\n${suggestion.nutrient} +${intervention.parameters.amount} mg/L`;
      
      if (analysisResult && analysisResult.fedbatchAnalysis) {
        const analysis = analysisResult.fedbatchAnalysis;
        message += `\n\n💉 Fed-Batch Analizi:\n` +
                  `• Yeni Seviye: ${analysis.newLevel} mg/L\n` +
                  `• Tükenme Süresi: ${analysis.hoursUntilDepletion} saat\n` +
                  `• ${analysis.recommendation}`;
      }
      
      if (stockResult.warning) {
        message += '\n\n⚠️ ' + stockResult.warning;
      }
      
      alert(message);
      
      if (onInterventionAdded) {
        onInterventionAdded(intervention);
      }

      // Formu sıfırla
      setSelectedSuggestion(null);
      setManualMode(false);
      setCustomData({ amount: '', concentration: '', notes: '' });
    } catch (error) {
      alert('❌ Müdahale kaydedilemedi: ' + error.message);
    }
  };

  const handleReject = (suggestion) => {
    // Öneriyi atla, sonrakine geç
    const nextIdx = modelSuggestions.findIndex(s => s === suggestion) + 1;
    if (nextIdx < modelSuggestions.length) {
      setSelectedSuggestion(modelSuggestions[nextIdx]);
    } else {
      setSelectedSuggestion(null);
    }
  };

  if (!modelSuggestions || modelSuggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">✅ Tüm Parametreler Normal</h3>
          <p className="text-gray-600">Şu anda müdahale önerisi yok</p>
          <p className="text-sm text-gray-500 mt-2">
            Model, besin seviyelerini izlemeye devam ediyor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Syringe className="w-8 h-8 text-emerald-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">🧪 Fed-Batch Asistanı</h3>
          <p className="text-sm text-gray-600">Model önerileri - Onaylayın veya düzenleyin</p>
        </div>
      </div>

      {/* Öneri Listesi */}
      <div className="space-y-4 mb-6">
        {modelSuggestions.map((suggestion, idx) => {
          const isSelected = selectedSuggestion === suggestion;
          const isActive = idx === 0;  // İlk öneri aktif

          return (
            <div
              key={idx}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : isActive
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => setSelectedSuggestion(suggestion)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-gray-800">
                    Gün {suggestion.day}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    suggestion.urgency === 'high'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {suggestion.urgency === 'high' ? '⚠️ ACİL' : '⚡ ORTA'}
                  </span>
                </div>

                {isSelected && (
                  <span className="text-sm text-emerald-600 font-semibold">
                    ✓ Seçili
                  </span>
                )}
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <strong>Sebep:</strong> {suggestion.reason}
                </p>
                <p className="text-emerald-600 font-semibold">
                  💊 Öneri: {suggestion.suggestedAmount} mg/L{' '}
                  <span className="text-blue-600">{suggestion.nutrient}</span> ekleyin
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seçili Öneri Detay */}
      {selectedSuggestion && (
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-lg p-6 border-2 border-emerald-300">
          <h4 className="font-bold text-lg mb-4 text-emerald-800">
            Seçili Öneri - Gün {selectedSuggestion.day}
          </h4>

          {/* Manuel Mod Toggle */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={(e) => setManualMode(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                Manuel düzenleme modu (miktarı değiştir)
              </span>
            </label>
          </div>

          {/* Miktar Girişi */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Besin Elementi
              </label>
              <div className="px-4 py-3 bg-blue-100 rounded-lg text-center">
                <div className="font-bold text-blue-800">
                  {selectedSuggestion.nutrient === 'N' && '💧 Azot (N)'}
                  {selectedSuggestion.nutrient === 'P' && '🟠 Fosfor (P)'}
                  {selectedSuggestion.nutrient === 'micronutrients' && '⚗️ Mikro Besinler'}
                  {selectedSuggestion.nutrient === 'carbon' && '🌱 Karbon'}
                </div>
                {/* Kimyasal Formu */}
                {selectedSuggestion.chemical && (
                  <div className="text-xs text-blue-600 mt-1">
                    {getChemicalDisplayName(selectedSuggestion.chemical, 'full')}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Miktar (mg/L)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualMode ? customData.amount : selectedSuggestion.suggestedAmount}
                onChange={(e) => setCustomData({ ...customData, amount: e.target.value })}
                disabled={!manualMode}
                className={`w-full px-4 py-3 border-2 rounded-lg font-bold text-center ${
                  manualMode
                    ? 'border-emerald-500 bg-white'
                    : 'border-gray-300 bg-gray-100 text-gray-700'
                }`}
              />
            </div>
          </div>

          {/* Stok Konsantrasyonu (opsiyonel) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Stok Konsantrasyonu (opsiyonel)
            </label>
            <input
              type="text"
              value={customData.concentration}
              onChange={(e) => setCustomData({ ...customData, concentration: e.target.value })}
              placeholder="Örn: 10x NaNO₃ stoku"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Notlar */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Notlar
            </label>
            <textarea
              value={customData.notes}
              onChange={(e) => setCustomData({ ...customData, notes: e.target.value })}
              placeholder="Model önerisi veya ek bilgi..."
              className="w-full px-4 py-2 border rounded-lg"
              rows="2"
            />
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex gap-3">
            <button
              onClick={() => handleApprove(selectedSuggestion)}
              className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              ✅ Onayla ve Kaydet
            </button>

            <button
              onClick={() => handleReject(selectedSuggestion)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              ⏭️ Atla
            </button>
          </div>

          {/* Uyarı */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                <strong>Not:</strong> Bu öneri Model V3 tarafından oluşturuldu.
                Laboratuvar koşullarınıza göre miktarı manuel ayarlayabilirsiniz.
                Onayladıktan sonra müdahale TankDetails'e otomatik kaydedilir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bilgilendirme */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Asistan Nasıl Çalışır?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Model, gelecek {modelSuggestions.length} günü tahmin eder</li>
          <li>• Besin seviyesi kritik eşiğe yaklaşırsa öneri oluşturur</li>
          <li>• "Onayla" butonuna basarak müdahaleyi kaydedin</li>
          <li>• Model, kaydedilen müdahaleleri simülasyona dahil eder</li>
          <li>• Gerçek ölçümlerle otomatik kalibrasyon yapar</li>
        </ul>
      </div>
    </div>
  );
};

export default FedBatchAssistant;
