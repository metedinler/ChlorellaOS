import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, DollarSign, TrendingUp, Filter, AlertCircle, Upload, Download, Zap, Link } from 'lucide-react';
import { useMaterials } from '../contexts/MaterialsContext';
import { getAllUnifiedChemicals } from '../utils/unifiedChemicalDatabase';

const MaterialInventory = () => {
  const { materials, addMaterial: addMaterialContext, updateMaterial, deleteMaterial: deleteMaterialContext, calculateTotals, stockTransactions } = useMaterials();
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showFormulaMatch, setShowFormulaMatch] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [matchStatus, setMatchStatus] = useState(null); // 'matched' | 'not-found' | 'multiple' | null
  const [showAddToDatabase, setShowAddToDatabase] = useState(false);
  const [showChemicalDropdown, setShowChemicalDropdown] = useState(false);
  const [chemicalSearchTerm, setChemicalSearchTerm] = useState('');
  const [newChemicalData, setNewChemicalData] = useState({
    name: '',
    formula: '',
    molarMass: 0,
    ions: '',
    nutrients: '',
    pKa: '',
    solubility: 0,
    category: 'custom'
  });
  const [newMaterial, setNewMaterial] = useState({
    category: 'Kimyasal',
    name: '',
    formula: '',
    quantity: 1,
    unit: 'kg',
    unitPrice: 0,
    date: new Date().toISOString().split('T')[0],
    usedInProduction: true,
    currentStock: 0,
    minStock: 0,
    note: ''
  });

  // Filtreleme
  useEffect(() => {
    let filtered = materials;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredMaterials(filtered);
  }, [materials, selectedCategory, searchTerm]);

  // Yeni malzeme ekle
  const handleAddMaterial = () => {
    // ✅ BAŞLANGIÇ STOĞU: quantity değerini currentStock'a otomatik kopyala
    const materialToAdd = {
      ...newMaterial,
      currentStock: newMaterial.currentStock || newMaterial.quantity  // Eğer manuel girilmemişse quantity'yi kullan
    };
    addMaterialContext(materialToAdd);
    setIsAddingNew(false);
    setNewMaterial({
      category: 'Kimyasal',
      name: '',
      formula: '',
      quantity: 1,
      unit: 'kg',
      unitPrice: 0,
      date: new Date().toISOString().split('T')[0],
      usedInProduction: true,
      currentStock: 0,
      minStock: 0,
      note: ''
    });
  };

  // Malzeme sil
  const handleDeleteMaterial = (id) => {
    if (confirm('Bu malzemeyi silmek istediğinize emin misiniz?')) {
      deleteMaterialContext(id);
    }
  };

  // Malzeme düzenle
  const startEdit = (material) => {
    setNewMaterial(material);
    setEditingId(material.id);
    setIsEditing(true);
  };

  // Düzenlemeyi kaydet
  const saveEdit = () => {
    const { id, ...updates } = newMaterial;
    updateMaterial(editingId, updates);
    setIsEditing(false);
    setEditingId(null);
    setNewMaterial({
      category: 'Kimyasal',
      name: '',
      quantity: 1,
      unit: 'kg',
      unitPrice: 0,
      date: new Date().toISOString().split('T')[0],
      usedInProduction: true,
      currentStock: 0,
      note: ''
    });
  };

  // Hızlı kimyasal ekleme (sık kullanılanlar)
  const quickAddChemicals = () => {
    const commonChemicals = [
      { name: 'Sitrik Asit (C6H8O7)', formula: 'C6H8O7', stock: 5, unit: 'kg', price: 120 },
      { name: 'Borik Asit (H3BO3)', formula: 'H3BO3', stock: 2, unit: 'kg', price: 80 },
      { name: 'Hidrojen Peroksit (H2O2)', formula: 'H2O2', stock: 10, unit: 'L', price: 50 },
      { name: 'Sülfürik Asit (H2SO4)', formula: 'H2SO4', stock: 5, unit: 'L', price: 90 },
      { name: 'EDTA Disodyum (Na2EDTA)', formula: 'Na2EDTA', stock: 1, unit: 'kg', price: 250 },
      { name: 'Sodyum Hidroksit (NaOH)', formula: 'NaOH', stock: 10, unit: 'kg', price: 60 },
      { name: 'Potasyum Hidroksit (KOH)', formula: 'KOH', stock: 5, unit: 'kg', price: 85 },
      { name: 'Kalsiyum Klorür (CaCl2)', formula: 'CaCl2', stock: 3, unit: 'kg', price: 45 },
      { name: 'Magnezyum Sülfat (MgSO4·7H2O)', formula: 'MgSO4·7H2O', stock: 5, unit: 'kg', price: 55 },
      { name: 'Potasyum Nitrat (KNO3)', formula: 'KNO3', stock: 10, unit: 'kg', price: 75 }
    ];

    let addedCount = 0;
    commonChemicals.forEach(chem => {
      // Sadece mevcut değilse ekle
      const exists = materials.find(m => m.name === chem.name || m.formula === chem.formula);
      if (!exists) {
        addMaterialContext({
          category: 'Kimyasal',
          name: chem.name,
          formula: chem.formula,
          quantity: 1,
          unit: chem.unit,
          unitPrice: chem.price,
          currentStock: chem.stock,
          date: new Date().toISOString().split('T')[0],
          usedInProduction: true,
          note: 'Hızlı ekleme ile eklendi'
        });
        addedCount++;
      }
    });

    alert(`✅ ${addedCount} yeni kimyasal eklendi!`);
    setShowQuickAdd(false);
  };

  // Opera'dan localStorage import et
  const importFromOpera = () => {
    const operaData = prompt(
      '🔄 Opera\'daki localStorage verilerini import edin:\n\n' +
      '1. Opera\'da F12 > Console\n' +
      '2. localStorage.getItem("chlorellaMaterials") yazın\n' +
      '3. Çıkan JSON\'u buraya yapıştırın:'
    );

    if (operaData && operaData.trim()) {
      try {
        const parsed = JSON.parse(operaData);
        if (Array.isArray(parsed)) {
          localStorage.setItem('chlorellaMaterials', operaData);
          window.location.reload();
        } else {
          alert('❌ Geçersiz format! Lütfen localStorage\'dan aldığınız tam JSON\'u yapıştırın.');
        }
      } catch (e) {
        alert('❌ JSON parse hatası: ' + e.message);
      }
    }
  };

  // Export (yedekleme)
  const exportData = () => {
    const dataStr = JSON.stringify(materials, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chlorella_materials_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ✨ KİMYASAL EŞLEŞTİRME - Veritabanından formül bul
  const matchChemicalFormula = () => {
    console.log('🔍 Eşleştirme başlatıldı:', {
      name: newMaterial.name,
      formula: newMaterial.formula,
      isEditing,
      editingId
    });

    if (!newMaterial.name || newMaterial.name.length < 3) {
      alert('⚠️ Lütfen önce malzeme adını girin!');
      return;
    }

    // 1. Önce otomatik arama yap
    const searchTerm = newMaterial.name.toLowerCase();
    const allChemicals = getAllChemicals();
    
    const matches = allChemicals.filter(chem => 
      chem.name.toLowerCase().includes(searchTerm) ||
      chem.formula.toLowerCase().includes(searchTerm)
    );

    console.log('✅ Bulunan eşleşme sayısı:', matches.length);
    console.log('📋 Bulunan kimyasallar:', matches.map(m => m.name));

    // HER ZAMAN DROPDOWN GÖSTER - Kullanıcı görerek seçsin
    if (matches.length > 0) {
      // Eşleşme var - Filtrelenmiş liste göster
      console.log('🔍 Eşleşme bulundu - Dropdown açılıyor');
      setChemicalSearchTerm(searchTerm);
      setMatchStatus(matches.length === 1 ? 'matched' : 'multiple');
      setShowChemicalDropdown(true);
      return;
    }

    // ❌ EŞLEŞME YOK - Tüm listeyi göster (kullanıcı kontrol etsin)
    console.log('❌ Eşleşme yok - Tüm liste gösteriliyor');
    setChemicalSearchTerm('');
    setMatchStatus('not-found');
    setShowChemicalDropdown(true);
  };

  // Kimyasal listesini hazırla (hem veritabanı hem custom) - ALFABETİK SIRALI
  const getAllChemicals = () => {
    // ✅ UNIFIED SYSTEM: 3 database birleşik + alias desteği
    const dbChemicals = getAllUnifiedChemicals();
    
    const customChemicals = JSON.parse(localStorage.getItem('customChemicals') || '[]').map(chem => ({
      ...chem,
      source: 'custom'
    }));
    
    const allChems = [...dbChemicals, ...customChemicals];
    // Alfabetik sırala (Türkçe karakterleri doğru sırala)
    return allChems.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  };

  // Dropdown'dan kimyasal seç
  const selectChemicalFromDropdown = (chemical) => {
    setNewMaterial({
      ...newMaterial,
      formula: chemical.formula,
      name: chemical.name
    });
    setMatchStatus('matched');
    setShowChemicalDropdown(false);
    
    // Görsel bildirim
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="position: fixed; top: 20px; right: 20px; z-index: 9999; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out;">
        <div style="font-weight: 600; margin-bottom: 4px;">✅ Kimyasal Eşleştirildi!</div>
        <div style="font-size: 14px; opacity: 0.9;">📋 Ad: ${chemical.name}</div>
        <div style="font-size: 14px; opacity: 0.9;">🧪 Formül: ${chemical.formula}</div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // Veritabanında bulunamadı - ekleme formunu aç
  const openAddChemicalForm = () => {
    setShowChemicalDropdown(false);
    setMatchStatus('not-found');
    setShowAddToDatabase(true);
    setNewChemicalData({
      name: newMaterial.name,
      formula: newMaterial.formula || '',
      molarMass: 0,
      ions: '',
      nutrients: '',
      pKa: '',
      solubility: 0,
      category: 'custom'
    });
  };

  // 🆕 Kimyasal veritabanına ekle (tüm özelliklerle)
  const addToChemicalDatabase = () => {
    if (!newChemicalData.name || !newChemicalData.formula) {
      alert('⚠️ Lütfen kimyasal adı ve formülü girin!');
      return;
    }

    // Custom kimyasalları localStorage'a kaydet
    const customChemicals = JSON.parse(localStorage.getItem('customChemicals') || '[]');
    
    const newChemical = {
      name: newChemicalData.name,
      formula: newChemicalData.formula,
      molarMass: parseFloat(newChemicalData.molarMass) || 0,
      ions: newChemicalData.ions || '',
      nutrients: newChemicalData.nutrients || '',
      pKa: newChemicalData.pKa || null,
      solubility: parseFloat(newChemicalData.solubility) || 0,
      category: newChemicalData.category || 'custom',
      addedDate: new Date().toISOString()
    };

    customChemicals.push(newChemical);
    localStorage.setItem('customChemicals', JSON.stringify(customChemicals));

    // Stok envanterine de ekle
    addMaterialContext({
      ...newMaterial,
      name: newChemicalData.name,
      formula: newChemicalData.formula,
      currentStock: newMaterial.currentStock || newMaterial.quantity
    });

    setMatchStatus('matched');
    setShowAddToDatabase(false);
    setIsAddingNew(false);
    
    alert(`✅ Başarılı!\n\n` +
          `📦 Kimyasal hem stoğunuza hem de veritabanınıza eklendi:\n` +
          `• Ad: ${newChemical.name}\n` +
          `• Formül: ${newChemical.formula}\n` +
          `• Mol Kütle: ${newChemical.molarMass} g/mol\n` +
          `• Stok: ${newMaterial.quantity} ${newMaterial.unit}`);

    // Formu sıfırla
    setNewMaterial({
      category: 'Kimyasal',
      name: '',
      formula: '',
      quantity: 1,
      unit: 'kg',
      unitPrice: 0,
      date: new Date().toISOString().split('T')[0],
      usedInProduction: true,
      currentStock: 0,
      minStock: 0,
      note: ''
    });
  };

  // ✨ TOPLU FORMÜL EŞLEŞTİRME - Tüm kimyasallar için
  const bulkMatchFormulas = () => {
    if (!confirm('⚠️ Tüm Kimyasal kategorisindeki malzemeler için formül eşleştirmesi yapılacak.\n\nDevam etmek istiyor musunuz?')) {
      return;
    }

    // ✅ UNIFIED SYSTEM kullan
    const chemicalsArray = getAllUnifiedChemicals();

    let matchedCount = 0;
    let notFoundCount = 0;
    const updatedMaterials = [];

    materials.forEach(material => {
      if (material.category !== 'Kimyasal') return;
      if (material.formula) return; // Zaten formülü var

      const searchTerm = material.name.toLowerCase();
      const matches = chemicalsArray.filter(chem => 
        chem.name.toLowerCase().includes(searchTerm) || 
        chem.formula.toLowerCase().includes(searchTerm) ||
        (chem.commonName && chem.commonName.toLowerCase().includes(searchTerm))
      );

      if (matches.length === 1) {
        // Tek eşleşme - otomatik uygula
        updateMaterial(material.id, { 
          formula: matches[0].formula,
          name: matches[0].name 
        });
        matchedCount++;
        updatedMaterials.push(`✓ ${material.name} → ${matches[0].formula}`);
      } else if (matches.length === 0) {
        notFoundCount++;
        updatedMaterials.push(`✗ ${material.name} → Eşleşme bulunamadı`);
      } else {
        // Çoklu eşleşme - atla
        notFoundCount++;
        updatedMaterials.push(`? ${material.name} → ${matches.length} olası eşleşme (manuel seçim gerekli)`);
      }
    });

    const report = `📊 TOPLU EŞLEŞTİRME RAPORU\n\n` +
                   `✅ Başarılı: ${matchedCount}\n` +
                   `❌ Başarısız: ${notFoundCount}\n\n` +
                   `DETAYLAR:\n${updatedMaterials.join('\n')}`;
    
    alert(report);
  };

  // Kategoriler
  const categories = [...new Set(materials.map(m => m.category))];
  
  // Maliyet hesaplamaları
  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Kimyasal Dropdown Modal */}
      {showChemicalDropdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">🧪 Kimyasal Seçin</h3>
                <button
                  onClick={() => setShowChemicalDropdown(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={chemicalSearchTerm}
                onChange={(e) => setChemicalSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Kimyasal ara..."
                autoFocus
              />
            </div>
            
            <div className="overflow-y-auto max-h-96 p-4">
              {getAllChemicals()
                .filter(chem => 
                  chem.name.toLowerCase().includes(chemicalSearchTerm.toLowerCase()) ||
                  chem.formula.toLowerCase().includes(chemicalSearchTerm.toLowerCase())
                )
                .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                .map((chem, idx) => (
                  <div
                    key={idx}
                    onClick={() => selectChemicalFromDropdown(chem)}
                    className="p-3 border rounded-lg mb-2 hover:bg-blue-50 cursor-pointer transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{chem.name}</p>
                        <p className="text-sm text-gray-600">Formül: {chem.formula}</p>
                        <p className="text-xs text-gray-500">
                          Mol Kütle: {chem.molarMass} g/mol | Kategori: {chem.category}
                        </p>
                      </div>
                      {chem.source === 'custom' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Özel
                        </span>
                      )}
                    </div>
                  </div>
                ))
              }
              
              {getAllChemicals().filter(chem => 
                chem.name.toLowerCase().includes(chemicalSearchTerm.toLowerCase()) ||
                chem.formula.toLowerCase().includes(chemicalSearchTerm.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">❌ Kimyasal bulunamadı</p>
                  <button
                    onClick={openAddChemicalForm}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Yeni Kimyasal Ekle
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={openAddChemicalForm}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Bulamadım, Veritabanına Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kimyasal Veritabanına Ekleme Formu */}
      {showAddToDatabase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b bg-gradient-to-r from-green-500 to-green-600 text-white">
              <h3 className="text-xl font-bold">🆕 Yeni Kimyasal Ekle</h3>
              <p className="text-sm opacity-90 mt-1">Hem stoğunuza hem de kimyasal veritabanınıza eklenecek</p>
            </div>
            
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kimyasal Adı *</label>
                <input
                  type="text"
                  value={newChemicalData.name}
                  onChange={(e) => setNewChemicalData({...newChemicalData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Örn: Potasyum Nitrat"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kimyasal Formül *</label>
                <input
                  type="text"
                  value={newChemicalData.formula}
                  onChange={(e) => setNewChemicalData({...newChemicalData, formula: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Örn: KNO3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Molar Kütle (g/mol)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newChemicalData.molarMass}
                  onChange={(e) => setNewChemicalData({...newChemicalData, molarMass: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="101.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Çözünürlük (g/100ml)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newChemicalData.solubility}
                  onChange={(e) => setNewChemicalData({...newChemicalData, solubility: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="31.6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İyonlar (opsiyonel)</label>
                <input
                  type="text"
                  value={newChemicalData.ions}
                  onChange={(e) => setNewChemicalData({...newChemicalData, ions: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="K+: 1, NO3-: 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Besinler (opsiyonel)</label>
                <input
                  type="text"
                  value={newChemicalData.nutrients}
                  onChange={(e) => setNewChemicalData({...newChemicalData, nutrients: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="N: 13.9, K: 38.7"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">pKa (opsiyonel)</label>
                <input
                  type="text"
                  value={newChemicalData.pKa}
                  onChange={(e) => setNewChemicalData({...newChemicalData, pKa: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="9.2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={newChemicalData.category}
                  onChange={(e) => setNewChemicalData({...newChemicalData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="custom">Özel</option>
                  <option value="Azot Kaynağı">Azot Kaynağı</option>
                  <option value="Fosfor Kaynağı">Fosfor Kaynağı</option>
                  <option value="Potasyum Kaynağı">Potasyum Kaynağı</option>
                  <option value="Mikro Element">Mikro Element</option>
                  <option value="Tampon">Tampon</option>
                  <option value="Karbon Kaynağı">Karbon Kaynağı</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={addToChemicalDatabase}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
              >
                ✅ Kaydet ve Ekle
              </button>
              <button
                onClick={() => {
                  setShowAddToDatabase(false);
                  setMatchStatus(null);
                }}
                className="bg-gray-400 text-white px-6 py-3 rounded-lg hover:bg-gray-500"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Başlık */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">📦 Malzeme & Maliyet Yönetimi</h2>
        <p className="text-purple-100">Tüm alımları kaydedin, stok takibi yapın, maliyetleri analiz edin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Toplam Maliyet</p>
              <p className="text-3xl font-bold mt-1">{totals.total.toLocaleString('tr-TR')} ₺</p>
            </div>
            <DollarSign className="w-10 h-10 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Üretim Maliyeti</p>
              <p className="text-3xl font-bold mt-1">{totals.production.toLocaleString('tr-TR')} ₺</p>
            </div>
            <Package className="w-10 h-10 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Diğer Giderler</p>
              <p className="text-3xl font-bold mt-1">{totals.nonProduction.toLocaleString('tr-TR')} ₺</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filtre ve Arama */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Malzeme ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Malzeme
          </button>

          <button
            onClick={quickAddChemicals}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Hızlı Ekle
          </button>

          <button
            onClick={bulkMatchFormulas}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            title="Tüm kimyasallar için otomatik formül eşleştir"
          >
            <Link className="w-5 h-5" />
            Toplu Eşleştir
          </button>

          <button
            onClick={importFromOpera}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Opera İmport
          </button>

          <button
            onClick={exportData}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Yeni Malzeme Formu */}
      {(isAddingNew || isEditing) && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-500">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Malzeme Adı *</label>
              <input
                type="text"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Örn: Potasyum Nitrat (KNO3)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formül (opsiyonel)
                {matchStatus === 'matched' && (
                  <span className="text-xs text-green-600 ml-2">✅ Eşleşti</span>
                )}
                {matchStatus === 'not-found' && (
                  <span className="text-xs text-red-600 ml-2">❌ Bulunamadı</span>
                )}
                {matchStatus === 'multiple' && (
                  <span className="text-xs text-yellow-600 ml-2">🔍 Çoklu sonuç</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMaterial.formula || ''}
                  onChange={(e) => {
                    setNewMaterial({...newMaterial, formula: e.target.value});
                    setMatchStatus(null); // Durum sıfırla
                  }}
                  className={`flex-1 px-3 py-2 border rounded-lg ${
                    matchStatus === 'matched' ? 'border-green-500 bg-green-50' :
                    matchStatus === 'not-found' ? 'border-red-500 bg-red-50' :
                    matchStatus === 'multiple' ? 'border-yellow-500 bg-yellow-50' :
                    ''
                  }`}
                  placeholder="Örn: KNO3, H2SO4"
                />
                <button
                  onClick={matchChemicalFormula}
                  className={`px-4 py-2 rounded-lg hover:opacity-90 flex items-center gap-1 text-sm font-medium transition-all ${
                    matchStatus === 'matched' ? 'bg-green-600 text-white' :
                    matchStatus === 'not-found' ? 'bg-red-600 text-white' :
                    matchStatus === 'multiple' ? 'bg-yellow-600 text-white' :
                    'bg-indigo-600 text-white'
                  }`}
                  title="Veritabanından formül eşleştir"
                >
                  {matchStatus === 'matched' ? '✅' : matchStatus === 'not-found' ? '❌' : matchStatus === 'multiple' ? '🔍' : <Link className="w-4 h-4" />}
                  {matchStatus === 'matched' ? 'Eşleşti!' : matchStatus === 'not-found' ? 'Bulunamadı' : matchStatus === 'multiple' ? 'Seçiniz' : 'Eşleştir'}
                </button>
              </div>
              
              {/* Veritabanına Ekleme Butonu (eşleşme bulunamazsa) */}
              {showAddToDatabase && matchStatus === 'not-found' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    ⚠️ Kimyasal veritabanında bulunamadı!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={addToChemicalDatabase}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                      title="Hem stoğa hem de kimyasal veritabanına ekle"
                    >
                      <Plus className="w-4 h-4" />
                      Veritabanına Ekle
                    </button>
                    <button
                      onClick={() => {
                        setShowAddToDatabase(false);
                        setMatchStatus(null);
                      }}
                      className="bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 text-sm"
                    >
                      İptal
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Bu kimyasal hem stoğunuza hem de kimyasal veritabanınıza eklenecek
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Satın Alınan Miktar * 
                <span className="text-xs text-gray-500">(Başlangıç stoğu)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={newMaterial.quantity}
                onChange={(e) => {
                  const qty = parseFloat(e.target.value) || 0;
                  setNewMaterial({
                    ...newMaterial, 
                    quantity: qty,
                    // Otomatik başlangıç stoğu güncelleme
                    currentStock: newMaterial.currentStock === 0 ? qty : newMaterial.currentStock
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Örn: 5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birim</label>
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="adet">adet</option>
                <option value="set">set</option>
                <option value="kutu">kutu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birim Fiyat (₺)</label>
              <input
                type="number"
                step="0.01"
                value={newMaterial.unitPrice}
                onChange={(e) => setNewMaterial({...newMaterial, unitPrice: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
              <input
                type="date"
                value={newMaterial.date}
                onChange={(e) => setNewMaterial({...newMaterial, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Stok
                <span className="text-xs text-blue-600 ml-2">⚙️ Manuel giriş mevcut</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={newMaterial.currentStock || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setNewMaterial({
                    ...newMaterial, 
                    currentStock: isNaN(value) ? 0 : value
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mevcut stok miktarı"
                title="Mevcut stok miktarını manuel olarak girebilirsiniz"
              />
              <p className="text-xs text-gray-500 mt-1">💡 Manuel giriş yapılabilir (satın alınan miktardan farklı olabilir)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stok Seviyesi</label>
              <input
                type="number"
                step="0.1"
                value={newMaterial.minStock || 0}
                onChange={(e) => setNewMaterial({...newMaterial, minStock: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Uyarı için minimum miktar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Üretimde Kullanılıyor mu?</label>
              <select
                value={newMaterial.usedInProduction ? 'yes' : 'no'}
                onChange={(e) => setNewMaterial({...newMaterial, usedInProduction: e.target.value === 'yes'})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="yes">Evet</option>
                <option value="no">Hayır</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Not</label>
              <input
                type="text"
                value={newMaterial.note}
                onChange={(e) => setNewMaterial({...newMaterial, note: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Opsiyonel not..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={isEditing ? saveEdit : handleAddMaterial}
              className="flex-1 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {isEditing ? 'Güncelle' : 'Kaydet'}
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setIsEditing(false);
                setEditingId(null);
                setNewMaterial({
                  category: 'Kimyasal',
                  name: '',
                  quantity: 1,
                  unit: 'kg',
                  unitPrice: 0,
                  date: new Date().toISOString().split('T')[0],
                  usedInProduction: true,
                  currentStock: 0,
                  note: ''
                });
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Sekmeler */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'inventory'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Malzeme Listesi
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'transactions'
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50'
                : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Stok Geçmişi ({stockTransactions.length})
          </button>
        </div>
      </div>

      {/* Malzeme Listesi */}
      {activeTab === 'inventory' && (<>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malzeme</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mevcut Stok</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className={!material.usedInProduction ? 'bg-orange-50' : ''}>
                  <td className="px-4 py-3 text-sm text-gray-700">{material.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {material.name}
                    {material.note && <p className="text-xs text-gray-500 italic">{material.note}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {material.quantity} {material.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {material.unitPrice?.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {material.totalCost?.toLocaleString('tr-TR')} ₺
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      {material.currentStock !== undefined && material.currentStock !== null ? (
                        <>
                          <span className={material.currentStock === 0 ? 'text-red-600 font-semibold' : ''}>
                            {material.currentStock} {material.unit}
                          </span>
                          {material.currentStock === 0 && (
                            <span className="flex items-center text-red-600 text-xs" title="Stok tükendi!">
                              <AlertCircle className="w-4 h-4" />
                            </span>
                          )}
                          {material.currentStock > 0 && material.minStock && material.currentStock <= material.minStock && (
                            <span className="flex items-center text-orange-600 text-xs" title="Düşük stok!">
                              <AlertCircle className="w-4 h-4" />
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Stok bilgisi girilmemiş</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{material.date}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(material)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p>💡 <strong>İpucu:</strong> Turuncu arka planlı satırlar, üretimde kullanılmayan malzemeleri gösterir (örn: Maya projesi için alınan melas)</p>
      </div>
      </>
      )}

      {/* Stok Geçmişi */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stok Hareketleri</h3>
            
            {stockTransactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Henüz stok hareketi kaydı yok</p>
                <p className="text-sm mt-2">Besin yeri hazırlama veya üretim başlatma işlemleri otomatik olarak kaydedilir</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih/Saat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malzeme</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem Tipi</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Önceki Stok</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Yeni Stok</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kaynak</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...stockTransactions].reverse().map((tx) => (
                      <tr key={tx.id} className={tx.type === 'usage' ? 'bg-red-50' : tx.type === 'purchase' ? 'bg-green-50' : 'bg-blue-50'}>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(tx.timestamp).toLocaleString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.materialName}</td>
                        <td className="px-4 py-3 text-sm">
                          {tx.type === 'usage' && <span className="text-red-600 font-semibold">➖ Kullanım</span>}
                          {tx.type === 'purchase' && <span className="text-green-600 font-semibold">➕ Alım</span>}
                          {tx.type === 'adjustment' && <span className="text-blue-600 font-semibold">⚙️ Düzeltme</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          <span className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} {tx.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{tx.previousStock.toFixed(2)} {tx.unit}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.newStock.toFixed(2)} {tx.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {tx.context?.type === 'formulation' && '🧪 Besin Yeri'}
                          {tx.context?.type === 'production' && '🏭 Üretim'}
                          {tx.context?.type === 'manual' && '✋ Manuel'}
                          {!tx.context?.type && '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{tx.user || 'Sistem'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialInventory;
