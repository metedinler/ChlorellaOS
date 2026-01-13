/**
 * RecommendationEngine - Akıllı Öneri Motoru (Task 26)
 * 
 * Risk durumlarına göre kimyasal müdahale önerileri üretir.
 * Envanter kontrolü, dozaj hesaplama ve maliyet tahmini yapar.
 */

class RecommendationEngine {
  constructor() {
    // Kimyasal veritabanı (malzeme adı, stok durumu, fiyat)
    this.initializeStocks();
    
    this.chemicalDatabase = {
      // Azot kaynakları
      NaNO3: {
        name: 'Sodyum Nitrat (NaNO₃)',
        type: 'nitrogen',
        purity: 0.99,
        MW: 85.0, // g/mol
        N_content: 0.1647, // 16.47% N
        cost_per_kg: 25, // TL/kg
        stock: 10, // kg
        alternatives: ['KNO3', 'NH34NO3', 'Urea']
      },
      KNO3: {
        name: 'Potasyum Nitrat (KNO₃)',
        type: 'nitrogen',
        purity: 0.99,
        MW: 101.1,
        N_content: 0.1386, // 13.86% N
        K_content: 0.3867, // 38.67% K (bonus)
        cost_per_kg: 35,
        stock: 8,
        alternatives: ['NaNO3', 'NH34NO3']
      },
      NH4NO3: {
        name: 'Amonyum Nitrat (NH₄NO₃)',
        type: 'nitrogen',
        purity: 0.99,
        MW: 80.04,
        N_content: 0.35, // 35% N (yüksek)
        cost_per_kg: 20,
        stock: 5,
        alternatives: ['NaNO3', 'KNO3'],
        warning: 'pH düşürücü etki, dikkatli kullan'
      },
      Urea: {
        name: 'Üre (CO(NH₂)₂)',
        type: 'nitrogen',
        purity: 0.99,
        MW: 60.06,
        N_content: 0.4667, // 46.67% N (en yüksek)
        cost_per_kg: 15,
        stock: 12,
        alternatives: ['NaNO3', 'KNO3'],
        warning: 'Yavaş salınımlı, hidrolizsüreç gerektirir'
      },

      // Fosfor kaynakları
      K2HPO4: {
        name: 'Dipotasyum Fosfat (K₂HPO₄)',
        type: 'phosphorus',
        purity: 0.98,
        MW: 174.18,
        P_content: 0.1778, // 17.78% P
        K_content: 0.4489, // 44.89% K (bonus)
        cost_per_kg: 45,
        stock: 6,
        alternatives: ['KH2PO4', 'NaH2PO4']
      },
      KH2PO4: {
        name: 'Monopotasyum Fosfat (KH₂PO₄)',
        type: 'phosphorus',
        purity: 0.99,
        MW: 136.09,
        P_content: 0.2276, // 22.76% P
        K_content: 0.2873, // 28.73% K
        cost_per_kg: 40,
        stock: 8,
        alternatives: ['K2HPO4', 'NaH2PO4'],
        note: 'pH buffer etkisi var'
      },
      NaH2PO4: {
        name: 'Sodyum Dihidrojen Fosfat (NaH₂PO₄)',
        type: 'phosphorus',
        purity: 0.99,
        MW: 119.98,
        P_content: 0.2582, // 25.82% P
        cost_per_kg: 35,
        stock: 7,
        alternatives: ['K2HPO4', 'KH2PO4']
      },

      // pH düzenleyiciler
      NaHCO3: {
        name: 'Sodyum Bikarbonat (NaHCO₃)',
        type: 'pH_buffer',
        purity: 0.99,
        MW: 84.01,
        alkalinity_meq_per_g: 11.9, // meq/g
        cost_per_kg: 8,
        stock: 20,
        alternatives: ['Na2CO3', 'KHCO3'],
        use: 'pH yükseltme + buffer'
      },
      Na2CO3: {
        name: 'Sodyum Karbonat (Na₂CO₃)',
        type: 'pH_buffer',
        purity: 0.99,
        MW: 105.99,
        alkalinity_meq_per_g: 18.9,
        cost_per_kg: 6,
        stock: 15,
        alternatives: ['NaHCO3', 'KHCO3'],
        warning: 'Güçlü baz, dikkatli doz'
      },
      HCl: {
        name: 'Hidroklorik Asit (HCl 0.1M)',
        type: 'pH_down',
        purity: 0.1, // Molar konsantrasyon
        MW: 36.46,
        cost_per_L: 12,
        stock: 5, // L
        alternatives: ['H2SO4', 'H3PO4'],
        warning: 'Korozif, güvenlik ekipmanı gerekli',
        unit: 'L'
      },
      H3PO4: {
        name: 'Fosforik Asit (H₃PO₄ 85%)',
        type: 'pH_down',
        purity: 0.85,
        MW: 97.99,
        P_content: 0.2686, // 26.86% P (bonus)
        cost_per_L: 18,
        stock: 3,
        alternatives: ['HCl', 'H2SO4'],
        note: 'pH düşürme + P takviyesi',
        unit: 'L'
      },

      // Mikro besinler
      FeSO4: {
        name: 'Demir Sülfat (FeSO₄·7H₂O)',
        type: 'micronutrient',
        purity: 0.99,
        MW: 278.01,
        Fe_content: 0.2009, // 20.09% Fe
        cost_per_kg: 15,
        stock: 4,
        alternatives: ['FeEDTA', 'FeCl3']
      },
      MgSO4: {
        name: 'Magnezyum Sülfat (MgSO₄·7H₂O)',
        type: 'micronutrient',
        purity: 0.99,
        MW: 246.47,
        Mg_content: 0.0986, // 9.86% Mg
        cost_per_kg: 10,
        stock: 10,
        alternatives: ['MgCl2']
      },
      CaCl2: {
        name: 'Kalsiyum Klorür (CaCl₂·2H₂O)',
        type: 'micronutrient',
        purity: 0.99,
        MW: 147.01,
        Ca_content: 0.2725, // 27.25% Ca
        cost_per_kg: 12,
        stock: 8,
        alternatives: ['CaCO3']
      }
    };
  }

  /**
   * Stokları LocalStorage'dan yükle veya başlat
   */
  initializeStocks() {
    const saved = localStorage.getItem('chemicalStocks');
    if (!saved) {
      // İlk kurulum - varsayılan stoklar
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
    }
  }

  /**
   * Güncel stok miktarlarını al
   */
  getStocks() {
    const saved = localStorage.getItem('chemicalStocks');
    return saved ? JSON.parse(saved) : {};
  }

  /**
   * Bir kimyasalın stok miktarını al
   */
  getStock(chemical) {
    const stocks = this.getStocks();
    return stocks[chemical] || 0;
  }

  /**
   * Stok güncelle (manuel veya otomatik)
   */
  updateStock(chemical, newAmount) {
    const stocks = this.getStocks();
    stocks[chemical] = newAmount;
    stocks.lastUpdated = new Date().toISOString();
    localStorage.setItem('chemicalStocks', JSON.stringify(stocks));
    console.log(`✅ Stok güncellendi: ${chemical} = ${newAmount} kg`);
  }

  /**
   * Stoktan düş (kullanım sonrası)
   */
  deductStock(chemical, usedAmountKg) {
    const currentStock = this.getStock(chemical);
    const newStock = Math.max(0, currentStock - usedAmountKg);
    this.updateStock(chemical, newStock);
    
    if (newStock < 0.5) {
      console.warn(`⚠️ DÜŞÜK STOK UYARISI: ${chemical} = ${newStock.toFixed(2)} kg kaldı!`);
    }
    
    return newStock;
  }

  /**
   * Tank aktivasyonunda besin yerinden kimyasal tüketimini hesapla ve stoktan düş
   */
  deductMediaPreparation(mediaFormulation, volumeL) {
    console.log(`🧪 Besin yeri hazırlanıyor: ${mediaFormulation.name || 'Custom'} - ${volumeL}L`);
    
    const stocks = mediaFormulation.stocks || [];
    const deductions = [];
    
    stocks.forEach(stock => {
      const { chemical, concentration_g_per_L } = stock;
      
      // Gereken miktar (gram)
      const requiredG = concentration_g_per_L * volumeL;
      const requiredKg = requiredG / 1000;
      
      // Stoktan düş
      const remainingStock = this.deductStock(chemical, requiredKg);
      
      deductions.push({
        chemical,
        used_g: requiredG,
        used_kg: requiredKg,
        remaining_kg: remainingStock
      });
      
      console.log(`  - ${chemical}: ${requiredG.toFixed(2)}g kullanıldı (Kalan: ${remainingStock.toFixed(2)} kg)`);
    });
    
    return deductions;
  }

  /**
   * Tüm stokları sıfırla (dikkatli kullan!)
   */
  resetAllStocks() {
    localStorage.removeItem('chemicalStocks');
    this.initializeStocks();
    console.log('🔄 Tüm stoklar varsayılan değerlere sıfırlandı.');
  }

  /**
   * Risk durumuna göre öneri oluştur
   * @param {Object} riskData - ModelManager'dan gelen risk verisi
   * @param {string} tankId - Tank ID
   * @param {number} tankVolume - Tank hacmi (L)
   * @returns {Array} - Öneri listesi
   */
  generateRecommendations(riskData, tankId, tankVolume) {
    if (!riskData || !riskData.risks) {
      return [];
    }

    const recommendations = [];

    // Risk prioritesi sıralaması
    const sortedRisks = Object.entries(riskData.risks).sort((a, b) => b[1] - a[1]);

    // Her risk için öneri oluştur
    sortedRisks.forEach(([riskType, riskValue]) => {
      if (riskValue < 0.3) return; // Düşük riskler için öneri yok

      let recs = [];

      switch (riskType) {
        case 'nutrient_depletion_N':
          recs = this.generateNitrogenRecommendations(riskValue, tankVolume);
          break;
        
        case 'nutrient_depletion_P':
          recs = this.generatePhosphorusRecommendations(riskValue, tankVolume);
          break;
        
        case 'high_pH_risk':
          recs = this.generatePHDownRecommendations(riskValue, tankVolume);
          break;
        
        case 'low_pH_risk':
          recs = this.generatePHUpRecommendations(riskValue, tankVolume);
          break;
        
        case 'CO2_limitation':
          recs = this.generateCO2Recommendations(riskValue, tankVolume);
          break;
        
        case 'NH33_toxicity':
          recs = this.generateNH3MitigationRecommendations(riskValue, tankVolume);
          break;
        
        case 'light_inhibition':
          recs = this.generateLightRecommendations(riskValue);
          break;
        
        case 'night_hypoxia':
          recs = this.generateAerationRecommendations(riskValue, tankVolume);
          break;
        
        case 'culture_crash_imminent':
          recs = this.generateEmergencyRecommendations(riskValue, tankVolume);
          break;

        default:
          // Genel tavsiyeler
          if (riskValue > 0.6) {
            recs.push({
              riskType,
              priority: 'HIGH',
              action: 'Acil müdahale gerekli',
              description: `${riskType} riski kritik seviyede. Uzman desteği alın.`,
              cost: 0
            });
          }
      }

      recommendations.push(...recs);
    });

    // Priorite sıralaması (HIGH > MEDIUM > LOW)
    recommendations.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    return recommendations.slice(0, 10); // En yüksek 10 öneri
  }

  /**
   * Azot takviyesi önerileri
   */
  generateNitrogenRecommendations(riskValue, tankVolume) {
    const targetNO3 = 80; // mg/L
    const currentNO3 = targetNO3 * (1 - riskValue); // Risk arttıkça NO3 azalıyor varsayımı
    const deficit = targetNO3 - currentNO3; // mg/L
    const totalNNeeded = (deficit * tankVolume) / 1000; // g N

    const recommendations = [];

    // 3-5 alternatif kimyasal öner
    const nitrogenSources = ['NaNO3', 'KNO3', 'NH34NO3', 'Urea'];

    nitrogenSources.forEach(chemical => {
      const data = this.chemicalDatabase[chemical];
      if (!data) return;

      const amountNeeded = totalNNeeded / data.N_content; // g chemical
      const amountKg = amountNeeded / 1000;
      const cost = amountKg * data.cost_per_kg;
      
      // Gerçek stok kontrolü (localStorage'dan)
      const currentStock = this.getStock(chemical);
      const inStock = currentStock >= amountKg;

      recommendations.push({
        riskType: 'nutrient_depletion_N',
        priority: riskValue > 0.6 ? 'HIGH' : riskValue > 0.4 ? 'MEDIUM' : 'LOW',
        chemical: chemical,
        chemicalName: data.name,
        action: `${data.name} takviyesi`,
        description: `Hedef NO₃: ${targetNO3} mg/L için ${amountNeeded.toFixed(1)} g (${amountKg.toFixed(2)} kg) ekleyin.`,
        dosage: amountNeeded,
        unit: 'g',
        cost: cost.toFixed(2),
        inStock: inStock,
        stockAvailable: currentStock,
        alternatives: data.alternatives,
        warning: data.warning || null,
        note: data.note || null
      });
    });

    return recommendations;
  }

  /**
   * Fosfor takviyesi önerileri
   */
  generatePhosphorusRecommendations(riskValue, tankVolume) {
    const targetPO4 = 15; // mg/L
    const currentPO4 = targetPO4 * (1 - riskValue);
    const deficit = targetPO4 - currentPO4;
    const totalPNeeded = (deficit * tankVolume * 0.326) / 1000; // g P (PO4 → P conversion: 0.326)

    const recommendations = [];
    const phosphorusSources = ['K2HPO4', 'KH2PO4', 'NaH2PO4', 'H3PO4'];

    phosphorusSources.forEach(chemical => {
      const data = this.chemicalDatabase[chemical];
      if (!data) return;

      let amountNeeded, unit, cost, amountKg;

      if (data.unit === 'L') {
        // Sıvı kimyasal (H3PO4)
        const density = 1.685; // g/mL for 85% H3PO4
        const grams = totalPNeeded / data.P_content;
        amountNeeded = grams / (density * 1000 * data.purity); // L
        unit = 'mL';
        amountNeeded *= 1000; // mL'ye çevir
        cost = (amountNeeded / 1000) * data.cost_per_L;
        amountKg = amountNeeded / 1000; // Stok karşılaştırması için L
      } else {
        amountNeeded = totalPNeeded / data.P_content;
        unit = 'g';
        amountKg = amountNeeded / 1000;
        cost = amountKg * data.cost_per_kg;
      }

      const inStock = data.stock >= amountKg;

      recommendations.push({
        riskType: 'nutrient_depletion_P',
        priority: riskValue > 0.6 ? 'HIGH' : riskValue > 0.4 ? 'MEDIUM' : 'LOW',
        chemical: chemical,
        chemicalName: data.name,
        action: `${data.name} takviyesi`,
        description: `Hedef PO₄: ${targetPO4} mg/L için ${amountNeeded.toFixed(1)} ${unit} ekleyin.`,
        dosage: amountNeeded,
        unit: unit,
        cost: cost.toFixed(2),
        inStock: inStock,
        stockAvailable: currentStock,
        alternatives: data.alternatives,
        warning: data.warning || null,
        note: data.note || null
      });
    });

    return recommendations;
  }

  /**
   * pH düşürme önerileri
   */
  generatePHDownRecommendations(riskValue, tankVolume) {
    const recommendations = [];
    const acids = ['HCl', 'H3PO4'];

    // Basit yaklaşım: pH 9.0 → 8.0 düşüş için gerekli meq
    const targetpHDrop = riskValue * 1.5; // pH drop amount
    const meqNeeded = tankVolume * 5 * targetpHDrop; // Yaklaşık hesap

    acids.forEach(chemical => {
      const data = this.chemicalDatabase[chemical];
      if (!data) return;

      let amountNeeded, cost;

      if (chemical === 'HCl') {
        // 0.1M HCl: 1 L = 100 mmol = 100 meq
        amountNeeded = meqNeeded / 100; // L
        cost = amountNeeded * data.cost_per_L;
      } else if (chemical === 'H3PO4') {
        // 85% H3PO4, density ~1.685 g/mL
        const density = 1.685;
        const mL = (meqNeeded / (data.purity * 1000 * 3)); // 3 H+ per H3PO4
        amountNeeded = mL;
        cost = (amountNeeded / 1000) * data.cost_per_L;
      }

      const inStock = data.stock >= (amountNeeded / 1000);

      recommendations.push({
        riskType: 'high_pH_risk',
        priority: riskValue > 0.7 ? 'HIGH' : 'MEDIUM',
        chemical: chemical,
        chemicalName: data.name,
        action: `${data.name} ile pH düşürme`,
        description: `pH'ı ~${targetpHDrop.toFixed(1)} birim düşürmek için ${amountNeeded.toFixed(0)} mL ekleyin (yavaş ve karıştırarak).`,
        dosage: amountNeeded,
        unit: 'mL',
        cost: cost.toFixed(2),
        inStock: inStock,
        stockAvailable: currentStock,
        alternatives: data.alternatives,
        warning: data.warning || 'Korozif asit! Ekipman kullanın, yavaş ekleyin.',
        note: data.note || null
      });
    });

    return recommendations;
  }

  /**
   * pH yükseltme önerileri (alkalinite buffer)
   */
  generatePHUpRecommendations(riskValue, tankVolume) {
    const recommendations = [];
    const bases = ['NaHCO3', 'Na2CO3'];

    const meqNeeded = tankVolume * 3 * riskValue; // Alkalinite ihtiyacı

    bases.forEach(chemical => {
      const data = this.chemicalDatabase[chemical];
      if (!data) return;

      const gramsNeeded = meqNeeded / data.alkalinity_meq_per_g;
      const cost = (gramsNeeded / 1000) * data.cost_per_kg;
      const inStock = data.stock >= (gramsNeeded / 1000);

      recommendations.push({
        riskType: 'low_pH_risk',
        priority: riskValue > 0.6 ? 'HIGH' : 'MEDIUM',
        chemical: chemical,
        chemicalName: data.name,
        action: `${data.name} ile pH yükseltme`,
        description: `pH'ı stabilize etmek için ${gramsNeeded.toFixed(1)} g ekleyin.`,
        dosage: gramsNeeded,
        unit: 'g',
        cost: cost.toFixed(2),
        inStock: inStock,
        stockAvailable: currentStock,
        alternatives: data.alternatives,
        warning: data.warning || null,
        note: data.use || null
      });
    });

    return recommendations;
  }

  /**
   * CO2 sınırlaması önerileri
   */
  generateCO2Recommendations(riskValue, tankVolume) {
    return [{
      riskType: 'CO2_limitation',
      priority: riskValue > 0.6 ? 'HIGH' : 'MEDIUM',
      chemical: 'CO2_gas',
      chemicalName: 'Karbondioksit Gazı',
      action: 'CO₂ akışını artır',
      description: `Havalandırma sistemindeki CO₂ akışını %${(riskValue * 100).toFixed(0)} artırın. Hedef pH: 7.8-8.5. Mevcut akış: kontrol edin.`,
      dosage: riskValue * 100,
      unit: '% artış',
      cost: '0',
      inStock: true,
      alternatives: ['NaHCO3 (geçici çözüm)'],
      note: 'CO₂ gaz tüpü kontrolü yapın, regülatör ayarını optimize edin.'
    }];
  }

  /**
   * NH3 toksisitesi azaltma
   */
  generateNH3MitigationRecommendations(riskValue, tankVolume) {
    const recommendations = [];

    // pH düşürme (NH3 → NH4+ shift)
    recommendations.push({
      riskType: 'NH33_toxicity',
      priority: 'HIGH',
      chemical: 'HCl',
      chemicalName: 'Hidroklorik Asit (0.1M)',
      action: 'pH dusurerek NH3 donusumu',
      description: `Acil pH dusun: 7.0-7.2. Miktar: ~${(tankVolume * 0.05).toFixed(0)} mL HCl 0.1M`,
      dosage: tankVolume * 0.05,
      unit: 'mL',
      cost: (tankVolume * 0.05 * 0.012).toFixed(2),
      inStock: true,
      warning: 'NH33 toksisitesi pH 9.0+ ve yuksek TAN seviyesinde kritik!',
      note: 'Havalandirmayi 2x artirarak NH3 strip edin.'
    });

    // Seyreltme
    recommendations.push({
      riskType: 'NH33_toxicity',
      priority: 'HIGH',
      chemical: 'dilution',
      chemicalName: 'Seyreltme (hasat + taze besin)',
      action: 'Kultur seyreltmesi',
      description: `%${(riskValue * 50).toFixed(0)} kultur hasadi + taze besin ortami ekleyin`,
      dosage: tankVolume * riskValue * 0.5,
      unit: 'L hasat',
      cost: '0',
      inStock: true,
      note: 'En hizli cozum. NH3 konsantrasyonunu dogrudan dusurur.'
    });

    return recommendations;
  }

  /**
   * Işık inhibisyonu önerileri
   */
  generateLightRecommendations(riskValue) {
    return [{
      riskType: 'light_inhibition',
      priority: riskValue > 0.6 ? 'HIGH' : 'MEDIUM',
      chemical: 'light_control',
      chemicalName: 'Işık Şiddeti Kontrolü',
      action: 'Işık şiddetini azalt',
      description: `LED şiddetini %${(riskValue * 50).toFixed(0)} azaltın. Hedef: 400-600 μmol/m²/s`,
      dosage: riskValue * 50,
      unit: '% azalma',
      cost: '0',
      inStock: true,
      note: 'Gölgeleme filtresi veya LED dimmer kullanabilirsiniz.',
      alternatives: ['Kısmi gölgeleme', 'Işık periyodu azaltma (16h → 14h)']
    }];
  }

  /**
   * Havalandırma artırma (gece hipoksisi)
   */
  generateAerationRecommendations(riskValue, tankVolume) {
    return [{
      riskType: 'night_hypoxia',
      priority: riskValue > 0.6 ? 'HIGH' : 'MEDIUM',
      chemical: 'aeration',
      chemicalName: 'Havalandırma Sistemi',
      action: 'Gece havalandırmasını artır',
      description: `Hava pompası akışını %${(riskValue * 100).toFixed(0)} artırın. Gece DO hedefi: >4 mg/L`,
      dosage: riskValue * 100,
      unit: '% artış',
      cost: '0',
      inStock: true,
      note: 'Biyokütle yoğunluğu yüksekse seyreltme yapın.',
      alternatives: ['Seyreltme', 'Biyokütle azaltma (hasat)']
    }];
  }

  /**
   * Acil durum önerileri (kültür çöküşü)
   */
  generateEmergencyRecommendations(riskValue, tankVolume) {
    return [
      {
        riskType: 'culture_crash_imminent',
        priority: 'HIGH',
        chemical: 'emergency_harvest',
        chemicalName: 'ACİL HASAT',
        action: '🚨 Acil hasat yapın',
        description: `Kültürün %${(riskValue * 80).toFixed(0)}'ini hemen hasat edin. Yedek kültür alın!`,
        dosage: tankVolume * riskValue * 0.8,
        unit: 'L hasat',
        cost: '0',
        inStock: true,
        warning: 'KÜLTÜR ÇÖKÜŞÜ RİSKİ! Hemen müdahale edin!',
        note: 'Kalan kültürü taze besin ortamı ile seyreltin, tüm parametreleri reset edin.'
      },
      {
        riskType: 'culture_crash_imminent',
        priority: 'HIGH',
        chemical: 'full_reset',
        chemicalName: 'Tam Reset',
        action: 'Tüm parametreleri sıfırla',
        description: 'pH, sıcaklık, ışık, besin ortamını optimize edin. Yeni batch başlatın.',
        dosage: 0,
        unit: 'işlem',
        cost: '0',
        inStock: true,
        note: 'Kontaminasyon kontrolü yapın, tank temizliği düşünün.'
      }
    ];
  }

  /**
   * Envanter kontrolü
   */
  checkInventory(chemical, amountNeeded) {
    const data = this.chemicalDatabase[chemical];
    if (!data) return { available: false, message: 'Kimyasal bulunamadı' };

    const amountKg = amountNeeded / 1000;
    
    if (data.stock >= amountKg) {
      return {
        available: true,
        remaining: data.stock - amountKg,
        message: `✅ Stokta mevcut. Kalan: ${(data.stock - amountKg).toFixed(2)} ${data.unit || 'kg'}`
      };
    } else {
      return {
        available: false,
        deficit: amountKg - data.stock,
        message: `❌ Yetersiz stok! Eksik: ${(amountKg - data.stock).toFixed(2)} ${data.unit || 'kg'}`,
        alternatives: data.alternatives
      };
    }
  }

  /**
   * Stok güncelleme (kimyasal kullanıldıktan sonra)
   */
  updateStock(chemical, amountUsed, unit = 'g') {
    const data = this.chemicalDatabase[chemical];
    if (!data) return false;

    let amountKg;
    if (unit === 'g') {
      amountKg = amountUsed / 1000;
    } else if (unit === 'mL' || unit === 'L') {
      amountKg = unit === 'mL' ? amountUsed / 1000 : amountUsed;
    } else {
      amountKg = amountUsed;
    }

    data.stock -= amountKg;
    
    if (data.stock < 0) {
      console.warn(`⚠️ ${data.name} stoku negatif oldu! Sipariş verin.`);
      data.stock = 0;
    }

    return {
      chemical: data.name,
      remainingStock: data.stock,
      unit: data.unit || 'kg'
    };
  }

  /**
   * Toplu maliyet hesaplama
   */
  calculateTotalCost(recommendations) {
    let totalCost = 0;
    
    recommendations.forEach(rec => {
      if (rec.cost && !isNaN(rec.cost)) {
        totalCost += parseFloat(rec.cost);
      }
    });

    return {
      totalCost: totalCost.toFixed(2),
      currency: 'TL',
      breakdown: recommendations.map(r => ({
        action: r.action,
        cost: r.cost
      }))
    };
  }
}

// Class'ı export et (main.jsx'de new RecommendationEngine() yapılabilsin)
export default RecommendationEngine;


