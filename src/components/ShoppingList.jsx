import React, { useState } from 'react';
import { ShoppingCart, Check, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useMaterials } from '../contexts/MaterialsContext';

const ShoppingList = () => {
  const { shoppingList, removeFromShoppingList, markAsPurchased } = useMaterials();
  const [purchaseQuantities, setPurchaseQuantities] = useState({});

  const handlePurchase = (item) => {
    const quantity = purchaseQuantities[item.id] || item.suggestedQuantity || 1;
    if (quantity <= 0) {
      alert('Lütfen geçerli bir miktar girin');
      return;
    }

    if (confirm(`${item.name} için ${quantity} ${item.unit} satın alındı olarak işaretlensin mi?`)) {
      markAsPurchased(item.id, quantity);
      // Quantity state'ini temizle
      const newQuantities = { ...purchaseQuantities };
      delete newQuantities[item.id];
      setPurchaseQuantities(newQuantities);
    }
  };

  const handleQuantityChange = (itemId, value) => {
    setPurchaseQuantities({
      ...purchaseQuantities,
      [itemId]: parseFloat(value) || 0
    });
  };

  const urgentItems = shoppingList.filter(item => item.priority === 'urgent');
  const normalItems = shoppingList.filter(item => item.priority === 'normal');

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" />
          🛒 Alışveriş Listesi
        </h2>
        <p className="text-orange-100">Stokta kalmayan veya azalan malzemeleri takip edin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm">Acil Alım</p>
              <p className="text-3xl font-bold mt-1">{urgentItems.length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-red-100 text-xs mt-2">Stok tükendi</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Normal Alım</p>
              <p className="text-3xl font-bold mt-1">{normalItems.length}</p>
            </div>
            <ShoppingCart className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-orange-100 text-xs mt-2">Stok azalıyor</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Toplam Ürün</p>
              <p className="text-3xl font-bold mt-1">{shoppingList.length}</p>
            </div>
            <Package className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-blue-100 text-xs mt-2">Listede bekliyor</p>
        </div>
      </div>

      {/* Boş Liste */}
      {shoppingList.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Alışveriş Listesi Boş</h3>
          <p className="text-gray-600">
            Stok tükenen veya azalan malzemeler otomatik olarak buraya eklenir.
          </p>
        </div>
      )}

      {/* Acil Alımlar */}
      {urgentItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-red-500 px-6 py-4 flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-bold">🚨 Acil Alım Gerekli (Stok Tükendi)</h3>
          </div>
          <div className="p-6 space-y-4">
            {urgentItems.map(item => (
              <div key={item.id} className="border-l-4 border-red-500 bg-red-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-xs text-red-600 font-semibold mt-1">{item.note}</p>
                  </div>
                  <button
                    onClick={() => removeFromShoppingList(item.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Listeden Çıkar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Önerilen Miktar</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={purchaseQuantities[item.id] !== undefined ? purchaseQuantities[item.id] : item.suggestedQuantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Birim</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">{item.unit}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tahmini Maliyet</label>
                    <div className="px-3 py-2 bg-blue-50 rounded-lg text-blue-700 font-semibold">
                      {((purchaseQuantities[item.id] || item.suggestedQuantity) * item.unitPrice).toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handlePurchase(item)}
                  className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Satın Alındı
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Normal Alımlar */}
      {normalItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 px-6 py-4 flex items-center gap-2 text-white">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="text-lg font-bold">📋 Planlı Alımlar</h3>
          </div>
          <div className="p-6 space-y-4">
            {normalItems.map(item => (
              <div key={item.id} className="border-l-4 border-orange-500 bg-orange-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    {item.note && <p className="text-xs text-orange-600 mt-1">{item.note}</p>}
                  </div>
                  <button
                    onClick={() => removeFromShoppingList(item.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Listeden Çıkar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Miktar</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={purchaseQuantities[item.id] !== undefined ? purchaseQuantities[item.id] : item.suggestedQuantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Birim</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">{item.unit}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tahmini Maliyet</label>
                    <div className="px-3 py-2 bg-blue-50 rounded-lg text-blue-700 font-semibold">
                      {((purchaseQuantities[item.id] || item.suggestedQuantity) * item.unitPrice).toLocaleString('tr-TR')} ₺
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handlePurchase(item)}
                  className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Satın Alındı
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bilgilendirme */}
      {shoppingList.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
          <p>
            <strong>💡 Nasıl Çalışır?</strong>
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>MaterialInventory'de stok 0'a düştüğünde buraya otomatik eklenir</li>
            <li>"Satın Alındı" butonuna basınca MaterialInventory stoku güncellenir</li>
            <li>İstemediğiniz ürünleri listeden çıkarabilirsiniz</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
