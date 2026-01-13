import React, { useState, useEffect } from 'react';
import { Package, Plus, Minus, RotateCcw, Save, AlertTriangle } from 'lucide-react';

/**
 * Stok Yönetim Paneli
 * Kimyasal stok miktarlarını görüntüleme ve güncelleme
 */
const StockManagement = () => {
  const [stocks, setStocks] = useState({});
  const [editMode, setEditMode] = useState({});
  const [tempValues, setTempValues] = useState({});

  // RecommendationEngine'den stokları yükle
  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = () => {
    const saved = localStorage.getItem('chemicalStocks');
    if (saved) {
      const stockData = JSON.parse(saved);
      setStocks(stockData);
      setTempValues({ ...stockData });
    }
  };

  // Stok güncelle
  const updateStock = (chemical) => {
    const newAmount = parseFloat(tempValues[chemical]) || 0;
    
    const updatedStocks = {
      ...stocks,
      [chemical]: newAmount,
      lastUpdated: new Date().toISOString()
    };
    
    setStocks(updatedStocks);
    localStorage.setItem('chemicalStocks', JSON.stringify(updatedStocks));
    setEditMode({ ...editMode, [chemical]: false });
    
    console.log(`✅ Stok güncellendi: ${chemical} = ${newAmount} kg`);
  };

  // Hızlı ekleme/çıkarma
  const quickAdjust = (chemical, delta) => {
    const current = stocks[chemical] || 0;
    const newAmount = Math.max(0, current + delta);
    
    const updatedStocks = {
      ...stocks,
      [chemical]: newAmount,
      lastUpdated: new Date().toISOString()
    };
    
    setStocks(updatedStocks);
    setTempValues({ ...tempValues, [chemical]: newAmount });
    localStorage.setItem('chemicalStocks', JSON.stringify(updatedStocks));
  };

  // Tüm stokları sıfırla
  const resetAllStocks = () => {
    if (!window.confirm('⚠️ Tüm stoklar varsayılan değerlere sıfırlanacak. Emin misiniz?')) {
      return;
    }
    
    const defaultStocks = {
      'NaNO3': 10,
      'KNO3': 8,
      'NH4NO3': 5,
      'Urea': 12,
      'K2HPO4': 6,
      'KH2PO4': 8,
      'NaH2PO4': 7,
      'NaHCO3': 20,
      'Na2CO3': 15,
      'HCl': 5,
      'H3PO4': 3,
      'MgSO4·7H2O': 10,
      'CaCl2·2H2O': 8,
      'FeSO4': 5,
      'FeCl3·6H2O': 4,
      'EDTA': 2,
      'CaCO3': 10,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('chemicalStocks', JSON.stringify(defaultStocks));
    setStocks(defaultStocks);
    setTempValues(defaultStocks);
    alert('✅ Stoklar varsayılan değerlere sıfırlandı!');
  };

  // Stok durumu renk kodu
  const getStockStatus = (amount) => {
    if (amount > 5) return 'text-green-600 bg-green-50';
    if (amount > 1) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Kimyasalları kategorilere ayır
  const categories = {
    'Azot Kaynakları': ['NaNO3', 'KNO3', 'NH4NO3', 'Urea'],
    'Fosfor Kaynakları': ['K2HPO4', 'KH2PO4', 'NaH2PO4'],
    'pH Düzenleyiciler': ['NaHCO3', 'Na2CO3', 'HCl', 'H3PO4', 'CaCO3'],
    'Makro Elementler': ['MgSO4·7H2O', 'CaCl2·2H2O'],
    'Mikro Elementler': ['FeSO4', 'FeCl3·6H2O', 'EDTA']
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Package className="w-8 h-8" />
          📦 Kimyasal Stok Yönetimi
        </h2>
        <p className="text-purple-100">
          Laboratuvar malzemelerinin stok takibi ve yönetimi
        </p>
        {stocks.lastUpdated && (
          <p className="text-sm text-purple-200 mt-2">
            Son güncelleme: {new Date(stocks.lastUpdated).toLocaleString('tr-TR')}
          </p>
        )}
      </div>

      {/* Uyarı Banner */}
      {Object.entries(stocks).some(([k, v]) => typeof v === 'number' && v < 1) && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
          <div>
            <div className="font-bold text-red-800">DÜŞÜK STOK UYARISI!</div>
            <div className="text-sm text-red-600">
              Bazı kimyasalların stok miktarı 1 kg'ın altında. Lütfen temin edin.
            </div>
          </div>
        </div>
      )}

      {/* Kontrol Butonları */}
      <div className="flex gap-3">
        <button
          onClick={loadStocks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Yenile
        </button>
        <button
          onClick={resetAllStocks}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Varsayılan Değerlere Sıfırla
        </button>
      </div>

      {/* Stok Tabloları (Kategorilere Göre) */}
      {Object.entries(categories).map(([category, chemicals]) => (
        <div key={category} className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
            {category}
          </h3>
          
          <div className="space-y-2">
            {chemicals.map(chemical => {
              const amount = stocks[chemical] || 0;
              const isEditing = editMode[chemical];
              
              return (
                <div
                  key={chemical}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition ${getStockStatus(amount)}`}
                >
                  {/* Kimyasal Adı */}
                  <div className="flex-1">
                    <div className="font-semibold">{chemical}</div>
                    {amount < 1 && (
                      <div className="text-xs font-bold">⚠️ CRİTİK STOK!</div>
                    )}
                  </div>

                  {/* Stok Miktarı */}
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      // Edit Mode
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={tempValues[chemical] || 0}
                          onChange={(e) => setTempValues({
                            ...tempValues,
                            [chemical]: e.target.value
                          })}
                          className="w-24 px-2 py-1 border-2 border-gray-400 rounded text-center font-bold"
                        />
                        <button
                          onClick={() => updateStock(chemical)}
                          className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                          title="Kaydet"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditMode({ ...editMode, [chemical]: false });
                            setTempValues({ ...tempValues, [chemical]: amount });
                          }}
                          className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      // View Mode
                      <>
                        <div className="font-bold text-2xl w-24 text-center">
                          {amount.toFixed(1)}
                        </div>
                        <div className="text-sm font-medium w-12">kg</div>
                        
                        {/* Hızlı Düğmeler */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => quickAdjust(chemical, -0.5)}
                            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            title="-0.5 kg"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => quickAdjust(chemical, 0.5)}
                            className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            title="+0.5 kg"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => setEditMode({ ...editMode, [chemical]: true })}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                        >
                          Düzenle
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Kullanım İstatistikleri */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Kullanım Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-700">Toplam Kimyasal Türü:</div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(stocks).filter(k => k !== 'lastUpdated').length}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Düşük Stok Uyarısı:</div>
            <div className="text-2xl font-bold text-yellow-600">
              {Object.entries(stocks).filter(([k, v]) => typeof v === 'number' && v < 5 && v >= 1).length}
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Kritik Stok:</div>
            <div className="text-2xl font-bold text-red-600">
              {Object.entries(stocks).filter(([k, v]) => typeof v === 'number' && v < 1).length}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded border border-gray-300">
          <div className="text-xs text-gray-600">
            <strong>Not:</strong> Tank aktivasyonlarında kullanılan kimyasallar otomatik olarak stoklardan düşürülür.
            Manuel müdahaleler sonrası stok miktarlarını bu ekrandan güncelleyebilirsiniz.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
