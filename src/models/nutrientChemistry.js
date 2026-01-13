// nutrientChemistry.js - Besin kimyası ve stokiyometri

export class NutrientChemistry {
  constructor() {
    // Besin konsantrasyonları (mg/L)
    this.TAN = 0.0; // Total Ammonia Nitrogen
    this.NO2 = 0.0; // Nitrit
    this.NO3 = 50.0; // Nitrat
    this.NH4 = 0.0; // Amonyum
    this.NH3 = 0.0; // Amonyak (toksik)
    this.PO4 = 10.0; // Fosfat (orto-fosfat)
    
    // Mikroelementler (mg/L)
    this.Fe = 1.0;
    this.Mn = 0.1;
    this.Zn = 0.05;
    this.Cu = 0.01;
    this.Mo = 0.01;
    this.B = 0.5;
    
    // Vitaminler (μg/L)
    this.B12 = 0.5;
    this.Biotin = 0.5;
    this.Thiamine = 100.0;
    
    // Redfield/Atkinson stokiyometrik oranlar
    this.C_N_RATIO = 6.6; // mol/mol (C106:N16:P1 → C:N = 6.6)
    this.C_P_RATIO = 106; // mol/mol
    this.N_P_RATIO = 16; // mol/mol
  }

  /**
   * Besin limitasyonlarını hesapla (Liebig Minimum Yasası)
   */
  calculateNutrientLimitations() {
    const limits = {};
    
    // Azot limitasyonu (Monod kinetik)
    const Ks_N = 5.0; // mg/L (yarı doyum sabiti)
    limits.N = this.NO3 / (Ks_N + this.NO3);
    
    // Fosfor limitasyonu
    const Ks_P = 1.0; // mg/L
    limits.P = this.PO4 / (Ks_P + this.PO4);
    
    // Demir limitasyonu
    const Ks_Fe = 0.1; // mg/L
    limits.Fe = this.Fe / (Ks_Fe + this.Fe);
    
    // Minimum limitasyon (Liebig yasası)
    limits.overall = Math.min(limits.N, limits.P, limits.Fe);
    limits.limiting = this.identifyLimitingNutrient(limits);
    
    return limits;
  }

  identifyLimitingNutrient(limits) {
    const nutrients = { N: limits.N, P: limits.P, Fe: limits.Fe };
    let minValue = 1.0;
    let limitingNutrient = 'none';
    
    for (const [nutrient, value] of Object.entries(nutrients)) {
      if (value < minValue) {
        minValue = value;
        limitingNutrient = nutrient;
      }
    }
    
    return { nutrient: limitingNutrient, limitation: minValue };
  }

  /**
   * Besin tüketimi hesaplama (biyokütle artışına göre)
   */
  uptakeNutrients(biomassGrowth_gL, waterChem) {
    // Biyokütle artışı (g/L) → Besin tüketimi (mg/L)
    
    // Yield katsayıları (g biyokütle / g besin)
    const Y_X_N = 10.0; // 10 g biyokütle / 1 g N
    const Y_X_P = 50.0; // 50 g biyokütle / 1 g P
    
    // Tüketilen besinler
    const N_consumed = (biomassGrowth_gL / Y_X_N) * 1000; // mg/L
    const P_consumed = (biomassGrowth_gL / Y_X_P) * 1000; // mg/L
    
    // N:P oranı kontrolü (Redfield)
    const actual_NP_ratio = N_consumed / P_consumed;
    const expected_NP_ratio = this.N_P_RATIO * (14 / 31); // mol → g dönüşümü
    
    // State güncelle
    this.NO3 = Math.max(0, this.NO3 - N_consumed);
    this.PO4 = Math.max(0, this.PO4 - P_consumed);
    
    // pH etkisi (nitrat tüketimi pH'ı yükseltir)
    if (waterChem) {
      const pH_increase = N_consumed * 0.0001; // Her 10 mg/L N → +0.001 pH
      waterChem.pH = Math.min(9.0, waterChem.pH + pH_increase);
    }
    
    return {
      N_consumed,
      P_consumed,
      NP_ratio: actual_NP_ratio,
      balanced: Math.abs(actual_NP_ratio - expected_NP_ratio) < 2.0
    };
  }

  /**
   * Stok çözeltisinden besin ekleme
   */
  addNutrientStock(stockType, volume_mL, stockConcentration_gL) {
    // stockType: 'N', 'P', 'Fe', etc.
    const amount_mg = volume_mL * stockConcentration_gL; // mg
    
    switch (stockType) {
      case 'N':
        this.NO3 += amount_mg;
        break;
      case 'P':
        this.PO4 += amount_mg;
        break;
      case 'Fe':
        this.Fe += amount_mg;
        break;
      case 'Mn':
        this.Mn += amount_mg;
        break;
      case 'Zn':
        this.Zn += amount_mg;
        break;
    }
    
    return { nutrient: stockType, added: amount_mg, newConcentration: this[stockType === 'N' ? 'NO3' : stockType] };
  }

  /**
   * Besin ortamı formülasyonundan başlangıç değerleri
   */
  initializeFromFormulation(formulation) {
    // formulation: { components: [{ formula, concentration }] }
    let N_total = 0;
    let P_total = 0;
    let Fe_total = 0;
    
    formulation.components.forEach(comp => {
      // Kimyasal formülden element hesaplama
      if (comp.formula.includes('NO3')) {
        N_total += comp.concentration * 0.226; // NO3 → N (14/62)
      }
      if (comp.formula.includes('PO4')) {
        P_total += comp.concentration * 0.326; // PO4 → P (31/95)
      }
      if (comp.formula.includes('Fe')) {
        Fe_total += comp.concentration * 0.2; // Fe-EDTA ~ 20% Fe
      }
    });
    
    this.NO3 = N_total;
    this.PO4 = P_total;
    this.Fe = Fe_total;
    
    return { N: N_total, P: P_total, Fe: Fe_total };
  }

  /**
   * Durum raporu
   */
  getStatus() {
    const limits = this.calculateNutrientLimitations();
    
    return {
      nutrients: {
        TAN: this.TAN,
        NO2: this.NO2,
        NO3: this.NO3,
        NH3: this.NH3,
        NH4: this.NH4,
        PO4: this.PO4
      },
      micronutrients: {
        Fe: this.Fe,
        Mn: this.Mn,
        Zn: this.Zn,
        Cu: this.Cu,
        Mo: this.Mo,
        B: this.B
      },
      vitamins: {
        B12: this.B12,
        Biotin: this.Biotin,
        Thiamine: this.Thiamine
      },
      limitations: limits,
      stoichiometry: {
        C_N_ratio: this.C_N_RATIO,
        C_P_ratio: this.C_P_RATIO,
        N_P_ratio: this.N_P_RATIO
      },
      warnings: this.checkWarnings()
    };
  }

  checkWarnings() {
    const warnings = [];
    
    if (this.NO3 < 20) {
      warnings.push({ type: 'N_limitation', severity: 'HIGH', message: `NO3 kritik seviyede: ${this.NO3.toFixed(1)} mg/L (min 20)` });
    }
    
    if (this.PO4 < 5) {
      warnings.push({ type: 'P_limitation', severity: 'HIGH', message: `PO4 kritik seviyede: ${this.PO4.toFixed(1)} mg/L (min 5)` });
    }
    
    if (this.NH3 > 0.5) {
      warnings.push({ type: 'NH3_toxicity', severity: 'CRITICAL', message: `NH3 toksik seviyede: ${this.NH3.toFixed(2)} mg/L (max 0.5)` });
    }
    
    if (this.Fe < 0.5) {
      warnings.push({ type: 'Fe_limitation', severity: 'MEDIUM', message: `Fe düşük: ${this.Fe.toFixed(2)} mg/L (min 0.5)` });
    }
    
    return warnings;
  }
}
