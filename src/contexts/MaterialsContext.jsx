import React, { createContext, useContext, useState, useEffect } from 'react';
import { materialInventory as initialInventory } from '../data/systemDataExtended';
import expandedChemicalDatabase from '../data/expandedChemicalDatabase';

const MaterialsContext = createContext();

export const useMaterials = () => {
  const context = useContext(MaterialsContext);
  if (!context) {
    throw new Error('useMaterials must be used within MaterialsProvider');
  }
  return context;
};

export const MaterialsProvider = ({ children }) => {
  const [materials, setMaterials] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [stockTransactions, setStockTransactions] = useState([]);

  // LocalStorage'dan yükle - SADECE VARSA YÜKLE, YOKSA BOŞ BIRAK!
  useEffect(() => {
    const savedMaterials = localStorage.getItem('chlorellaMaterials');
    const savedShopping = localStorage.getItem('chlorellaShoppingList');
    const savedTransactions = localStorage.getItem('chlorellaStockTransactions');
    
    if (savedMaterials) {
      // ✅ Kayıtlı veri varsa, ONU kullan (eski verileri ASLA yükleme!)
      setMaterials(JSON.parse(savedMaterials));
    } else {
      // ⚠️ İLK KULLANIMDA: Boş başlat (kullanıcı kendi ekleyecek)
      // NOT: initialInventory sadece ilk kurulumda kullanılabilir
      // Eğer kullanıcının verisi varsa ASLA üzerine yazma!
      const shouldUseInitial = window.confirm(
        '⚠️ Malzeme veritabanı bulunamadı!\n\n' +
        '• EVET: Örnek verilerle başla (demo)\n' +
        '• HAYIR: Boş başla (kendi verilerinizi ekleyin)\n\n' +
        'Daha önce veri eklediyseniz HAYIR deyin!'
      );
      
      if (shouldUseInitial) {
        setMaterials(initialInventory);
        localStorage.setItem('chlorellaMaterials', JSON.stringify(initialInventory));
      } else {
        setMaterials([]);
        localStorage.setItem('chlorellaMaterials', JSON.stringify([]));
      }
    }
    
    if (savedShopping) {
      setShoppingList(JSON.parse(savedShopping));
    } else {
      setShoppingList([]);
      localStorage.setItem('chlorellaShoppingList', JSON.stringify([]));
    }
    
    if (savedTransactions) {
      setStockTransactions(JSON.parse(savedTransactions));
    } else {
      setStockTransactions([]);
      localStorage.setItem('chlorellaStockTransactions', JSON.stringify([]));
    }
  }, []);

  // Materials kaydet
  const saveMaterials = (newMaterials) => {
    setMaterials(newMaterials);
    localStorage.setItem('chlorellaMaterials', JSON.stringify(newMaterials));
  };

  // Shopping list kaydet
  const saveShoppingList = (newShoppingList) => {
    setShoppingList(newShoppingList);
    localStorage.setItem('chlorellaShoppingList', JSON.stringify(newShoppingList));
  };

  // Malzeme ekle
  const addMaterial = (material) => {
    const totalCost = material.quantity * material.unitPrice;
    const newMaterial = {
      ...material,
      id: Date.now(),
      totalCost
    };
    const updated = [...materials, newMaterial];
    saveMaterials(updated);
    return newMaterial;
  };

  // Malzeme güncelle
  const updateMaterial = (id, updates) => {
    const updated = materials.map(m => {
      if (m.id === id) {
        const newMaterial = { ...m, ...updates };
        newMaterial.totalCost = newMaterial.quantity * newMaterial.unitPrice;
        return newMaterial;
      }
      return m;
    });
    saveMaterials(updated);
    
    // Stok 0'a düştüyse alışveriş listesine ekle
    const updatedMaterial = updated.find(m => m.id === id);
    if (updatedMaterial && updatedMaterial.currentStock <= 0) {
      addToShoppingList(updatedMaterial);
    }
  };

  // Malzeme sil
  const deleteMaterial = (id) => {
    const updated = materials.filter(m => m.id !== id);
    saveMaterials(updated);
  };

  // Stok güncelle (Feasibility'den kimyasal kullanımı için)
  const useChemical = (materialName, amount) => {
    const material = materials.find(m => 
      m.name.toLowerCase() === materialName.toLowerCase()
    );
    
    if (!material) {
      console.warn(`Material not found: ${materialName}`);
      return false;
    }

    const newStock = Math.max(0, material.currentStock - amount);
    updateMaterial(material.id, { currentStock: newStock });
    
    if (newStock === 0) {
      return { success: true, warning: `⚠️ ${materialName} stokta kalmadı!` };
    }
    
    return { success: true };
  };

  // ✨ YENİ: STOK AZALTMA SİSTEMİ (Transaction Log ile)
  const reduceStock = (materialIdentifier, amount, unit, context) => {
    // materialIdentifier: name veya formula
    const material = materials.find(m => 
      m.name === materialIdentifier || 
      m.formula === materialIdentifier ||
      m.name.toLowerCase().includes(materialIdentifier.toLowerCase())
    );
    
    if (!material) {
      console.error(`❌ Malzeme bulunamadı: ${materialIdentifier}`);
      return { success: false, error: `Malzeme bulunamadı: ${materialIdentifier}` };
    }

    // Birim dönüşümü (gerekirse)
    let amountInMaterialUnit = amount;
    if (unit !== material.unit) {
      // Basit dönüşüm: kg ↔ g, L ↔ ml
      if (unit === 'g' && material.unit === 'kg') {
        amountInMaterialUnit = amount / 1000;
      } else if (unit === 'kg' && material.unit === 'g') {
        amountInMaterialUnit = amount * 1000;
      } else if (unit === 'ml' && material.unit === 'L') {
        amountInMaterialUnit = amount / 1000;
      } else if (unit === 'L' && material.unit === 'ml') {
        amountInMaterialUnit = amount * 1000;
      }
    }

    // Stok kontrolü
    const currentStock = material.currentStock || 0;
    if (currentStock < amountInMaterialUnit) {
      return { 
        success: false, 
        error: `Yetersiz stok! Mevcut: ${currentStock} ${material.unit}, İstenen: ${amountInMaterialUnit} ${material.unit}`,
        currentStock,
        requested: amountInMaterialUnit
      };
    }

    // Stok azalt
    const newStock = currentStock - amountInMaterialUnit;
    updateMaterial(material.id, { currentStock: newStock });

    // Transaction log ekle
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      materialId: material.id,
      materialName: material.name,
      type: 'usage',  // 'usage' | 'purchase' | 'adjustment'
      amount: -amountInMaterialUnit,  // Negatif = azalma
      unit: material.unit,
      previousStock: currentStock,
      newStock: newStock,
      context: context || {},  // { type: 'formulation', formulationId: '...', tankId: '...', etc. }
      timestamp: new Date().toISOString(),
      user: 'current-user'  // İleride user sistemi eklenebilir
    };

    const updatedTransactions = [...stockTransactions, transaction];
    setStockTransactions(updatedTransactions);
    localStorage.setItem('chlorellaStockTransactions', JSON.stringify(updatedTransactions));

    // Stok azaldıysa uyarı
    let warning = null;
    if (newStock === 0) {
      warning = `⚠️ ${material.name} stokta kalmadı!`;
      addToShoppingList(material);
    } else if (newStock < (material.minStock || 0)) {
      warning = `⚠️ ${material.name} minimum stok seviyesinin altında!`;
      addToShoppingList(material);
    }

    return { 
      success: true, 
      newStock, 
      warning,
      transaction
    };
  };

  // ✨ YENİ: STOK ARTIRMA (Satın alma)
  const addStock = (materialIdentifier, amount, unit, context) => {
    const material = materials.find(m => 
      m.name === materialIdentifier || 
      m.formula === materialIdentifier
    );
    
    if (!material) {
      return { success: false, error: `Malzeme bulunamadı: ${materialIdentifier}` };
    }

    // Birim dönüşümü
    let amountInMaterialUnit = amount;
    if (unit !== material.unit) {
      if (unit === 'g' && material.unit === 'kg') {
        amountInMaterialUnit = amount / 1000;
      } else if (unit === 'kg' && material.unit === 'g') {
        amountInMaterialUnit = amount * 1000;
      } else if (unit === 'ml' && material.unit === 'L') {
        amountInMaterialUnit = amount / 1000;
      } else if (unit === 'L' && material.unit === 'ml') {
        amountInMaterialUnit = amount * 1000;
      }
    }

    const currentStock = material.currentStock || 0;
    const newStock = currentStock + amountInMaterialUnit;
    updateMaterial(material.id, { currentStock: newStock });

    // Transaction log
    const transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      materialId: material.id,
      materialName: material.name,
      type: 'purchase',
      amount: amountInMaterialUnit,  // Pozitif = artma
      unit: material.unit,
      previousStock: currentStock,
      newStock: newStock,
      context: context || {},
      timestamp: new Date().toISOString(),
      user: 'current-user'
    };

    const updatedTransactions = [...stockTransactions, transaction];
    setStockTransactions(updatedTransactions);
    localStorage.setItem('chlorellaStockTransactions', JSON.stringify(updatedTransactions));

    return { success: true, newStock, transaction };
  };

  // ✨ YENİ: Malzeme için transaction geçmişi getir
  const getMaterialTransactions = (materialId) => {
    return stockTransactions
      .filter(tx => tx.materialId === materialId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Alışveriş listesine ekle
  const addToShoppingList = (material) => {
    // Zaten listede mi kontrol et
    const exists = shoppingList.find(item => item.materialId === material.id);
    if (exists) return;

    const newItem = {
      id: Date.now(),
      materialId: material.id,
      name: material.name,
      category: material.category,
      suggestedQuantity: material.quantity || 1,
      unit: material.unit,
      unitPrice: material.unitPrice,
      priority: material.currentStock <= 0 ? 'urgent' : 'normal',
      addedDate: new Date().toISOString(),
      note: material.currentStock <= 0 ? 'Stok tükendi' : 'Stok azaldı',
      purchased: false
    };

    const updated = [...shoppingList, newItem];
    saveShoppingList(updated);
  };

  // Alışveriş listesinden sil
  const removeFromShoppingList = (id) => {
    const updated = shoppingList.filter(item => item.id !== id);
    saveShoppingList(updated);
  };

  // Satın alındı işaretle
  const markAsPurchased = (shoppingItemId, quantity) => {
    const item = shoppingList.find(i => i.id === shoppingItemId);
    if (!item) return;

    // Material stokunu artır
    const material = materials.find(m => m.id === item.materialId);
    if (material) {
      const newStock = material.currentStock + quantity;
      updateMaterial(material.id, { currentStock: newStock });
    }

    // Shopping list'ten çıkar
    removeFromShoppingList(shoppingItemId);
  };

  // Maliyet hesaplamaları
  const calculateTotals = () => {
    const total = materials.reduce((sum, m) => sum + m.totalCost, 0);
    const production = materials.filter(m => m.usedInProduction).reduce((sum, m) => sum + m.totalCost, 0);
    const nonProduction = materials.filter(m => !m.usedInProduction).reduce((sum, m) => sum + m.totalCost, 0);
    return { total, production, nonProduction };
  };

  // Formula mapping helper
  const extractFormulaFromName = (name) => {
    // "Potasyum Nitrat (KNO3)" → "KNO3"
    const match = name.match(/\(([A-Z][a-z0-9]*)+\)/);
    return match ? match[1] : null;
  };

  // Enrich materials with formula field
  const enrichedMaterials = materials.map(material => {
    if (material.formula) return material;  // Zaten varsa dön
    
    // 1. İsimden formülü çıkar
    const formulaFromName = extractFormulaFromName(material.name);
    
    // 2. expandedChemicalDatabase'den ara
    const chem = Object.values(expandedChemicalDatabase).find(c => 
      c.name === material.name || 
      material.name.includes(c.formula) ||
      (formulaFromName && c.formula === formulaFromName)
    );
    
    return {
      ...material,
      formula: chem?.formula || formulaFromName
    };
  });

  const value = {
    materials: enrichedMaterials,  // ← Enriched materials with formula
    shoppingList,
    stockTransactions,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    useChemical,
    reduceStock,  // ✨ YENİ
    addStock,     // ✨ YENİ
    getMaterialTransactions,  // ✨ YENİ
    addToShoppingList,
    removeFromShoppingList,
    markAsPurchased,
    calculateTotals
  };

  return (
    <MaterialsContext.Provider value={value}>
      {children}
    </MaterialsContext.Provider>
  );
};
