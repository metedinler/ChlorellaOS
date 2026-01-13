import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertTriangle, RefreshCw, RotateCcw, Trash2, Calendar, Settings } from 'lucide-react';
import ModelStatusWidget from './ModelStatusWidget';
import { showToast } from './ToastNotification';
import { useEnforcedChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

/**
 * CULTURE MODELING V2 - ENFORCED SISTEM
 * 
 * Özellikler:
 * - Otomatik ölçüm → model tetikleme
 * - Tank state otomatik okuma
 * - Model parametreleri enforced güncelleme
 */
const CultureModeling = () => {
  // 🔴 ENFORCED MERKEZI SISTEM - Model otomatik güncelleme
  const { getAllTankStates, getTankState, updateModelState, state } = useEnforcedChlorellaSystem();
  
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(null);
  const [tankForecasts, setTankForecasts] = useState({});

  // Tankları yükle
  useEffect(() => {
    loadTanks();
    loadForecasts();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(() => {
      loadForecasts();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadTanks = () => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setTanks(active);
    }
  };

  const loadForecasts = () => {
    const forecasts = {};
    tanks.forEach(tank => {
      const stateData = localStorage.getItem(`tank_${tank.id}_latest_state`);
      if (stateData) {
        try {
          forecasts[tank.id] = JSON.parse(stateData);
        } catch (e) {
          console.error(`Forecast parse hatası: ${tank.id}`, e);
        }
      }
    });
    setTankForecasts(forecasts);
  };

  // Model sıfırlama - Tek tank
  const resetTankModel = (tankId) => {
    if (!confirm(`${tankId} tankının modelini sıfırlamak istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`)) {
      return;
    }

    try {
      // Model state'ini sil
      localStorage.removeItem(`modelState_${tankId}`);
      localStorage.removeItem(`tank_${tankId}_latest_state`);
      localStorage.removeItem(`tank_${tankId}_history`);
      
      showToast(`✅ ${tankId} modeli sıfırlandı`, 'success');
      loadForecasts();
    } catch (error) {
      showToast(`❌ Sıfırlama hatası: ${error.message}`, 'error');
    }
  };

  // Model sıfırlama - Tüm tanklar
  const resetAllModels = () => {
    if (!confirm('TÜM TANKLARIN MODELİNİ SIFIRLAMAK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!')) {
      return;
    }

    try {
      tanks.forEach(tank => {
        localStorage.removeItem(`modelState_${tank.id}`);
        localStorage.removeItem(`tank_${tank.id}_latest_state`);
        localStorage.removeItem(`tank_${tank.id}_history`);
      });
      
      showToast('✅ Tüm modeller sıfırlandı', 'success');
      setTankForecasts({});
    } catch (error) {
      showToast(`❌ Sıfırlama hatası: ${error.message}`, 'error');
    }
  };

  // Tarihten itibaren çalıştır (kalıcı ayar)
  const setSimulationStartDate = (tankId) => {
    const dateStr = prompt('Simülasyonun başlayacağı tarihi girin (YYYY-MM-DD):', 
      new Date().toISOString().split('T')[0]);
    
    if (!dateStr) return;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Geçersiz tarih formatı');
      }
      
      // Kalıcı ayar olarak kaydet
      const settings = JSON.parse(localStorage.getItem('modelSettings') || '{}');
      settings[tankId] = {
        ...settings[tankId],
        simulationStartDate: date.toISOString(),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('modelSettings', JSON.stringify(settings));
      
      showToast(`✅ ${tankId} simülasyonu ${dateStr} tarihinden başlayacak`, 'success');
      
      // Model'i sıfırla ve yeniden başlat
      resetTankModel(tankId);
    } catch (error) {
      showToast(`❌ Hata: ${error.message}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* BAŞLIK + MODEL DURUM PANELİ */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-7 h-7 text-emerald-600" />
              Kültür Modelleme
            </h2>
            <p className="text-gray-600 mt-1">
              Otomatik simülasyon ve tahmin sistemi
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={resetAllModels}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Tüm Modelleri Sıfırla
            </button>
          </div>
        </div>

        {/* Model Durum Widget'ı */}
        <ModelStatusWidget />
      </div>

      {/* TANK SEÇİCİ */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tank Seçin (Boş bırakırsanız tüm tanklar görünür)
        </label>
        <select
          value={selectedTank || ''}
          onChange={(e) => setSelectedTank(e.target.value || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Tüm Tanklar (Grid Görünüm)</option>
          {tanks.map(tank => (
            <option key={tank.id} value={tank.id}>{tank.id}</option>
          ))}
        </select>
      </div>

      {/* GRID VIEW - Tüm Tanklar */}
      {!selectedTank && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tanks.map(tank => (
            <TankCard
              key={tank.id}
              tank={tank}
              forecast={tankForecasts[tank.id]}
              onSelect={() => setSelectedTank(tank.id)}
              onReset={() => resetTankModel(tank.id)}
              onSetStartDate={() => setSimulationStartDate(tank.id)}
            />
          ))}
        </div>
      )}

      {/* DETAY VIEW - Seçili Tank */}
      {selectedTank && (
        <TankDetailView
          tankId={selectedTank}
          forecast={tankForecasts[selectedTank]}
          onBack={() => setSelectedTank(null)}
          onReset={() => resetTankModel(selectedTank)}
          onSetStartDate={() => setSimulationStartDate(selectedTank)}
        />
      )}
    </div>
  );
};

/**
 * TANK KARTI - Grid View için
 */
const TankCard = ({ tank, forecast, onSelect, onReset, onSetStartDate }) => {
  if (!forecast) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800 mb-2">{tank.id}</h3>
          <p className="text-sm text-gray-500 mb-4">Henüz simülasyon verisi yok</p>
          <button
            onClick={onSelect}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Detaya Git
          </button>
        </div>
      </div>
    );
  }

  const { current, warnings } = forecast;
  const criticalWarnings = Object.values(warnings).filter(Boolean);
  const criPercentage = current.CRI || 0;
  const criColor = criPercentage < 30 ? 'text-green-600' : 
                   criPercentage < 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500 hover:shadow-xl transition-shadow cursor-pointer"
         onClick={onSelect}>
      {/* Başlık */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{tank.id}</h3>
          <p className="text-sm text-gray-500">
            Gün {current.day}, Saat {current.hour}
          </p>
        </div>
        {criticalWarnings.length > 0 && (
          <AlertTriangle className="w-6 h-6 text-yellow-500 animate-pulse" />
        )}
      </div>

      {/* Metrikler */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-emerald-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Biyokütle</div>
          <div className="text-lg font-bold text-emerald-700">
            {current.biomass?.toFixed(3)} g/L
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">CRI</div>
          <div className={`text-lg font-bold ${criColor}`}>
            {criPercentage.toFixed(0)}%
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">Azot (N)</div>
          <div className="text-sm font-semibold text-gray-800">
            {current.N?.toFixed(1)} mg/L
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-1">CO₂</div>
          <div className="text-sm font-semibold text-gray-800">
            {current.CO2?.toFixed(1)} mg/L
          </div>
        </div>
      </div>

      {/* Uyarılar */}
      {criticalWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-yellow-800 mb-2">
            ⚠️ UYARILAR
          </div>
          {criticalWarnings.map((warning, idx) => (
            <div key={idx} className="text-xs text-yellow-700 mb-1">
              • {warning}
            </div>
          ))}
        </div>
      )}

      {/* Aksiyonlar */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Sıfırla
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onSetStartDate(); }}
          className="flex-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
        >
          <Calendar className="w-3 h-3" />
          Tarih Ayarla
        </button>
      </div>
    </div>
  );
};

/**
 * TANK DETAY VIEW - Seçili tank için
 */
const TankDetailView = ({ tankId, forecast, onBack, onReset, onSetStartDate }) => {
  if (!forecast) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Geri
        </button>
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Simülasyon Verisi Yok</h3>
          <p className="text-gray-600">
            Bu tank için henüz model çalıştırılmamış. Otomatik simülasyon başlayınca veriler burada görünecek.
          </p>
        </div>
      </div>
    );
  }

  const { current, forecast: forecastData, warnings } = forecast;
  const criticalAlerts = forecastData?.filter(f => f.alerts && f.alerts.length > 0) || [];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Geri
            </button>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{tankId}</h3>
              <p className="text-sm text-gray-600">
                Gün {current.day}, Saat {current.hour}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSetStartDate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Tarih Ayarla
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Sıfırla
            </button>
          </div>
        </div>

        {/* Mevcut Durum Metrikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Biyokütle</div>
            <div className="text-2xl font-bold text-emerald-700">
              {current.biomass?.toFixed(3)}
            </div>
            <div className="text-xs text-gray-500">g/L</div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Azot (N)</div>
            <div className="text-2xl font-bold text-yellow-700">
              {current.N?.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">mg/L</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">CO₂</div>
            <div className="text-2xl font-bold text-purple-700">
              {current.CO2?.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">mg/L</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">CRI</div>
            <div className={`text-2xl font-bold ${
              current.CRI < 30 ? 'text-green-600' : 
              current.CRI < 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {current.CRI?.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">Risk İndeksi</div>
          </div>
        </div>
      </div>

      {/* Uyarılar */}
      {Object.values(warnings).some(Boolean) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
          <h4 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            24 Saat Öngörüsü - Kritik Uyarılar
          </h4>
          <div className="space-y-2">
            {Object.entries(warnings).map(([key, value]) => value && (
              <div key={key} className="flex items-start gap-2">
                <span className="text-yellow-700 font-medium">•</span>
                <span className="text-yellow-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24 Saat Öngörü Tablosu */}
      {forecastData && forecastData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">
            24 Saat Öngörü Detayları
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Saat</th>
                  <th className="px-4 py-2 text-left">Biyokütle</th>
                  <th className="px-4 py-2 text-left">N</th>
                  <th className="px-4 py-2 text-left">CO₂</th>
                  <th className="px-4 py-2 text-left">CRI</th>
                  <th className="px-4 py-2 text-left">Uyarılar</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.slice(0, 24).map((f, idx) => (
                  <tr key={idx} className={`border-b ${f.alerts.length > 0 ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-2 font-medium">+{f.hour}h</td>
                    <td className="px-4 py-2">{f.biomass?.toFixed(3)} g/L</td>
                    <td className="px-4 py-2">{f.N?.toFixed(1)} mg/L</td>
                    <td className="px-4 py-2">{f.CO2?.toFixed(1)} mg/L</td>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${
                        f.CRI < 30 ? 'text-green-600' : 
                        f.CRI < 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {f.CRI?.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {f.alerts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {f.alerts.map((alert, i) => (
                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                              {alert}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CultureModeling;
