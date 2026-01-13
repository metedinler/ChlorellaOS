import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, Package, AlertCircle, Plus, X, Database, Beaker, CheckCircle } from 'lucide-react';
import { useMaterials } from '../contexts/MaterialsContext';

const ProductionPlanning = () => {
  const { materials, reduceStock } = useMaterials();
  const [productions, setProductions] = useState(() => {
    const saved = localStorage.getItem('productionPlans');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    product: '',
    target: '',
    unit: 'kg',
    deadline: '',
    requiredChemicals: [] // {name, amount, unit}
  });

  // Tank kapasitesi ve mevcut üretim
  const tankCapacity = useMemo(() => {
    const tankStates = JSON.parse(localStorage.getItem('tankStates') || '[]');
    const activeTanks = tankStates.filter(t => t.active);
    const totalVolume = activeTanks.reduce((sum, t) => sum + parseFloat(t.volume || 0), 0);
    const totalBiomass = activeTanks.reduce((sum, t) => {
      const details = JSON.parse(localStorage.getItem('tankDetails') || '{}');
      const tankData = details[t.id];
      // Ortalama biyokütle yoğunluğu: 2.5 g/L
      const biomass = tankData?.qualityParams?.[0]?.cellDensity ? 
        parseFloat(t.volume) * parseFloat(tankData.qualityParams[0].cellDensity) / 1000 : 0;
      return sum + biomass;
    }, 0);
    
    return {
      totalVolume,
      activeTanks: activeTanks.length,
      currentBiomass: totalBiomass.toFixed(1)
    };
  }, []);

  // İlerleme otomatik hesaplama
  useEffect(() => {
    const updatedPlans = productions.map(prod => {
      if (prod.status !== 'active') return prod;
      
      // Gerçek üretim verilerine göre ilerleme hesapla
      const progress = Math.min(100, Math.round((tankCapacity.currentBiomass / prod.target) * 100));
      return { ...prod, progress };
    });
    
    if (JSON.stringify(updatedPlans) !== JSON.stringify(productions)) {
      setProductions(updatedPlans);
      localStorage.setItem('productionPlans', JSON.stringify(updatedPlans));
    }
  }, [tankCapacity.currentBiomass]);

  // Kimyasal yeterlilik kontrolü
  const checkChemicalAvailability = (plan) => {
    if (!plan.requiredChemicals || plan.requiredChemicals.length === 0) return { sufficient: true, missing: [] };
    
    const missing = [];
    plan.requiredChemicals.forEach(req => {
      const material = materials.find(m => 
        m.name.toLowerCase().includes(req.name.toLowerCase()) && m.category === 'Kimyasal'
      );
      
      if (!material || !material.currentStock || material.currentStock < req.amount) {
        missing.push({
          name: req.name,
          required: req.amount,
          available: material?.currentStock || 0,
          unit: req.unit
        });
      }
    });
    
    return { sufficient: missing.length === 0, missing };
  };

  // Yeni plan ekle
  const addPlan = () => {
    if (!newPlan.product || !newPlan.target || !newPlan.deadline) {
      alert('Ürün, hedef ve tarih zorunludur!');
      return;
    }

    // ✅ STOK TÜKETİMİ - Gerekli kimyasalları stoktan düş
    if (newPlan.requiredChemicals && newPlan.requiredChemicals.length > 0) {
      const stockErrors = [];
      newPlan.requiredChemicals.forEach(req => {
        const result = reduceStock(
          req.name,
          req.amount,
          req.unit,
          {
            type: 'production',
            productionId: Date.now().toString(),
            product: newPlan.product
          }
        );
        
        if (!result.success) {
          stockErrors.push(`${req.name}: ${result.error}`);
        }
      });

      if (stockErrors.length > 0) {
        const confirmMsg = `⚠️ STOK UYARISI:\n\n${stockErrors.join('\n')}\n\nYine de üretim planı oluşturulsun mu?`;
        if (!confirm(confirmMsg)) {
          return;
        }
      }
    }

    const plan = {
      id: Date.now(),
      product: newPlan.product,
      target: parseFloat(newPlan.target),
      unit: newPlan.unit,
      deadline: newPlan.deadline,
      status: 'planned',
      progress: 0,
      requiredChemicals: newPlan.requiredChemicals,
      createdAt: new Date().toISOString()
    };

    const updated = [...productions, plan];
    setProductions(updated);
    localStorage.setItem('productionPlans', JSON.stringify(updated));
    
    setNewPlan({ product: '', target: '', unit: 'kg', deadline: '', requiredChemicals: [] });
    setShowForm(false);
  };

  // Plan sil
  const deletePlan = (id) => {
    if (!confirm('Bu planı silmek istediğinizden emin misiniz?')) return;
    const updated = productions.filter(p => p.id !== id);
    setProductions(updated);
    localStorage.setItem('productionPlans', JSON.stringify(updated));
  };

  // Plan aktifleştir/durdur
  const toggleStatus = (id) => {
    const updated = productions.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'planned' : 'active' } : p
    );
    setProductions(updated);
    localStorage.setItem('productionPlans', JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Üretim Planlaması</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'İptal' : 'Yeni Plan'}
        </button>
      </div>

      {/* Tank Kapasitesi Özet */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Database className="w-4 h-4" />
            Toplam Kapasite
          </div>
          <p className="text-2xl font-bold text-gray-800">{tankCapacity.totalVolume} L</p>
          <p className="text-xs text-gray-500">{tankCapacity.activeTanks} aktif tank</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Package className="w-4 h-4" />
            Mevcut Biyokütle
          </div>
          <p className="text-2xl font-bold text-emerald-600">{tankCapacity.currentBiomass} kg</p>
          <p className="text-xs text-gray-500">Tahmini (2.5 g/L)</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Beaker className="w-4 h-4" />
            Kimyasal Stok
          </div>
          <p className="text-2xl font-bold text-blue-600">{materials.filter(m => m.category === 'Kimyasal' && m.currentStock > 0).length}</p>
          <p className="text-xs text-gray-500">Hazır malzeme</p>
        </div>
      </div>

      {/* Yeni Plan Formu */}
      {showForm && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-emerald-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Yeni Üretim Planı</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Adı</label>
              <input
                type="text"
                value={newPlan.product}
                onChange={(e) => setNewPlan({...newPlan, product: e.target.value})}
                placeholder="örn: Chlorella Tozu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Son Tarih</label>
              <input
                type="date"
                value={newPlan.deadline}
                onChange={(e) => setNewPlan({...newPlan, deadline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Miktar</label>
              <input
                type="number"
                value={newPlan.target}
                onChange={(e) => setNewPlan({...newPlan, target: e.target.value})}
                placeholder="500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Birim</label>
              <select
                value={newPlan.unit}
                onChange={(e) => setNewPlan({...newPlan, unit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="adet">adet</option>
                <option value="g">g</option>
              </select>
            </div>
          </div>
          <button
            onClick={addPlan}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
          >
            Plan Oluştur
          </button>
        </div>
      )}

      {/* Planlar Listesi */}
      {productions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">Henüz üretim planı yok</p>
          <p className="text-sm mt-1">Yeni plan eklemek için yukarıdaki butonu kullanın</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {productions.map(prod => {
            const chemCheck = checkChemicalAvailability(prod);
            const daysLeft = Math.ceil((new Date(prod.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const isUrgent = daysLeft <= 7 && daysLeft > 0;
            const isOverdue = daysLeft < 0;
            
            return (
              <div key={prod.id} className={`border-2 rounded-lg p-4 hover:shadow-md transition ${
                isOverdue ? 'border-red-300 bg-red-50' : 
                isUrgent ? 'border-yellow-300 bg-yellow-50' : 
                'border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{prod.product}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Hedef: {prod.target} {prod.unit}
                      </span>
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : isUrgent ? 'text-yellow-600 font-semibold' : ''}`}>
                        <Calendar className="w-4 h-4" />
                        {prod.deadline} {isOverdue ? '(GEÇMİŞ!)' : isUrgent ? `(${daysLeft} gün kaldı)` : ''}
                      </span>
                    </div>
                    {!chemCheck.sufficient && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        ⚠️ Eksik kimyasal: {chemCheck.missing.map(m => `${m.name} (${m.available}/${m.required} ${m.unit})`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleStatus(prod.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        prod.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {prod.status === 'active' ? '✓ Aktif' : 'Planlandı'}
                    </button>
                    <button
                      onClick={() => deletePlan(prod.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* İlerleme Çubuğu */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>İlerleme (Otomatik)</span>
                    <span className="font-semibold">{prod.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        prod.progress >= 100 ? 'bg-green-600' : 
                        prod.progress >= 75 ? 'bg-emerald-600' : 
                        prod.progress >= 50 ? 'bg-blue-600' : 
                        'bg-yellow-600'
                      }`}
                      style={{ width: `${Math.min(100, prod.progress)}%` }}
                    ></div>
                  </div>
                  {prod.status === 'active' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Tank biyokütlesi: {tankCapacity.currentBiomass} kg / {prod.target} {prod.unit}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800">Otomatik İzleme</h4>
            <p className="text-sm text-blue-700 mt-1">
              ✓ İlerleme tank verilerinden otomatik hesaplanır (Biyokütle = Toplam Hacim × Hücre Yoğunluğu)<br/>
              ✓ Kimyasal stok kontrolü gerçek zamanlı yapılır<br/>
              ✓ Deadline uyarıları otomatik gösterilir
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionPlanning;
