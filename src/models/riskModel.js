/**
 * TAM KAPSAMLI MODEL - 16 RİSK SENARYOSU
 * Kaynak: tamkapsamli_chlorellaOS_model.md
 * Boyd-Tomasso-Losordo risk metodolojisi
 */

export const RiskLevel = {
  SAFE: 'GÜVENLİ',
  WATCH: 'İZLE',
  ALERT: 'UYARI',
  CRITICAL: 'KRİTİK',
  COLLAPSE: 'ÇÖKÜŞ'
};

export class RiskModel {
  constructor() {
    // Risk ağırlıkları (Boyd-Tomasso-Losordo temelli)
    this.weights = {
      NH3_toxicity: 3.0,
      night_hypoxia: 2.8,
      photooxidation: 2.0,
      contamination: 2.5,
      N_limitation: 2.0,
      pH_fluctuation: 2.2,
      light_heterogeneity: 1.5,
      sedimentation: 1.8,
      heavy_metal: 2.5,
      carbon_limitation: 2.0,
      osmotic_stress: 1.8,
      vitamin_deficiency: 1.2,
      temperature_shock: 2.0,
      heat_stress: 2.2,
      mechanical_damage: 1.5,
      biofilm: 1.0
    };

    this.thresholds = {
      NH3_toxicity: { safe: 0.05, critical: 0.5 },
      night_hypoxia: { safe: 5.0, critical: 2.0 },
      photooxidation: { safe: 2500, critical: 5000 },
      N_limitation: { safe: 50, critical: 10 },
      pH_fluctuation: { safeLow: 7.0, safeHigh: 7.5, criticalLow: 6.0, criticalHigh: 9.0 },
      carbon_limitation: { safe: 1.0, critical: 0.2 },
      osmotic_stress: { safeLow: 0.8, safeHigh: 1.5, criticalLow: 0.3, criticalHigh: 2.5 },
      heat_stress: { safeLow: 22, safeHigh: 28, critical: 35 },
      temperature_shock: { safe: 2, critical: 5 }
    };
  }

  calculateRiskNH3(NH3) {
    const { safe, critical } = this.thresholds.NH3_toxicity;
    
    if (NH3 <= safe) return 0.0;
    if (NH3 >= critical) return 1.0;
    
    return (NH3 - safe) / (critical - safe);
  }

  calculateRiskHypoxia(O2, isNight) {
    if (!isNight || O2 >= this.thresholds.night_hypoxia.safe) return 0.0;
    
    const { safe, critical } = this.thresholds.night_hypoxia;
    
    if (O2 <= critical) return 1.0;
    return (safe - O2) / (safe - critical);
  }

  calculateRiskPhotooxidation(lightIntensity, cellDensity) {
    const densityFactor = Math.max(0.1, Math.min(1.0, cellDensity / 5e6));
    const effectiveLight = lightIntensity / densityFactor;
    
    const { safe, critical } = this.thresholds.photooxidation;
    
    if (effectiveLight <= safe) return 0.0;
    if (effectiveLight >= critical) return 1.0;
    
    return (effectiveLight - safe) / (critical - safe);
  }

  calculateRiskNLimitation(NO3, NH4) {
    const totalN = NO3 + NH4;
    const { safe, critical } = this.thresholds.N_limitation;
    
    if (totalN >= safe) return 0.0;
    if (totalN <= critical) return 1.0;
    
    return (safe - totalN) / (safe - critical);
  }

  calculateRiskPH(pH, prevpH) {
    const { safeLow, safeHigh, criticalLow, criticalHigh } = this.thresholds.pH_fluctuation;
    
    // pH değeri riski
    let pHValueRisk = 0.0;
    if (pH >= safeLow && pH <= safeHigh) {
      pHValueRisk = 0.0;
    } else if (pH < criticalLow || pH > criticalHigh) {
      pHValueRisk = 1.0;
    } else {
      if (pH < safeLow) {
        pHValueRisk = (safeLow - pH) / (safeLow - criticalLow);
      } else {
        pHValueRisk = (pH - safeHigh) / (criticalHigh - safeHigh);
      }
    }
    
    // pH değişim hızı riski
    let changeRisk = 0.0;
    if (prevpH !== undefined) {
      const pHChange = Math.abs(pH - prevpH);
      changeRisk = Math.min(1.0, pHChange / 0.5); // 0.5 pH/saat kritik
    }
    
    return Math.max(pHValueRisk, changeRisk * 0.5);
  }

  calculateRiskCarbon(CO2, pH) {
    const { safe, critical } = this.thresholds.carbon_limitation;
    
    let CO2Risk = 0.0;
    if (CO2 >= safe) {
      CO2Risk = 0.0;
    } else if (CO2 <= critical) {
      CO2Risk = 1.0;
    } else {
      CO2Risk = (safe - CO2) / (safe - critical);
    }
    
    // pH'a bağlı ek risk
    const pHRisk = Math.max(0, (pH - 7.5) / 2.0);
    
    return Math.min(1.0, CO2Risk + pHRisk * 0.3);
  }

  calculateRiskOsmotic(EC) {
    const { safeLow, safeHigh, criticalLow, criticalHigh } = this.thresholds.osmotic_stress;
    
    if (EC >= safeLow && EC <= safeHigh) return 0.0;
    if (EC < criticalLow || EC > criticalHigh) return 1.0;
    
    if (EC < safeLow) {
      return (safeLow - EC) / (safeLow - criticalLow);
    } else {
      return (EC - safeHigh) / (criticalHigh - safeHigh);
    }
  }

  calculateRiskHeatStress(temp) {
    const { safeLow, safeHigh, critical } = this.thresholds.heat_stress;
    
    if (temp >= safeLow && temp <= safeHigh) return 0.0;
    if (temp >= critical) return 1.0;
    
    if (temp < safeLow) {
      return (safeLow - temp) / (safeLow - 10);
    } else {
      return (temp - safeHigh) / (critical - safeHigh);
    }
  }

  /**
   * TÜM 16 RİSKİ HESAPLA
   */
  calculateAllRisks(state, prevState = {}) {
    const risks = {
      NH3_toxicity: 0,
      night_hypoxia: 0,
      photooxidation: 0,
      N_limitation: 0,
      pH_fluctuation: 0,
      carbon_limitation: 0,
      osmotic_stress: 0,
      heat_stress: 0,
      contamination: state.contaminationLevel || 0,
      light_heterogeneity: state.lightHeterogeneity || 0,
      sedimentation: state.sedimentationRate || 0,
      heavy_metal: state.heavyMetalIndex || 0,
      vitamin_deficiency: state.vitaminDeficiency || 0,
      temperature_shock: state.tempChangeRate ? state.tempChangeRate / 5.0 : 0,
      mechanical_damage: state.shearStress ? state.shearStress / 2.0 : 0,
      biofilm: state.biofilmThickness ? state.biofilmThickness / 5.0 : 0
    };

    // NH3 toksisitesi
    if (state.NH3 !== undefined) {
      risks.NH3_toxicity = this.calculateRiskNH3(state.NH3);
    }

    // Gece hipoksisi
    const isNight = state.hourOfDay !== undefined && (state.hourOfDay >= 18 || state.hourOfDay < 6);
    if (state.O2 !== undefined) {
      risks.night_hypoxia = this.calculateRiskHypoxia(state.O2, isNight);
    }

    // Fotooksidasyon
    if (state.lightIntensity !== undefined && state.cellDensity !== undefined) {
      risks.photooxidation = this.calculateRiskPhotooxidation(state.lightIntensity, state.cellDensity);
    }

    // Azot limitasyonu
    if (state.NO3 !== undefined && state.NH4 !== undefined) {
      risks.N_limitation = this.calculateRiskNLimitation(state.NO3, state.NH4);
    }

    // pH dalgalanması
    if (state.pH !== undefined) {
      risks.pH_fluctuation = this.calculateRiskPH(state.pH, prevState.pH);
    }

    // Karbon limitasyonu
    if (state.CO2 !== undefined && state.pH !== undefined) {
      risks.carbon_limitation = this.calculateRiskCarbon(state.CO2, state.pH);
    }

    // Osmotik stres
    if (state.EC !== undefined) {
      risks.osmotic_stress = this.calculateRiskOsmotic(state.EC);
    }

    // Isı stresi
    if (state.temperature !== undefined) {
      risks.heat_stress = this.calculateRiskHeatStress(state.temperature);
    }

    // 0-1 aralığına sınırla
    Object.keys(risks).forEach(key => {
      risks[key] = Math.max(0.0, Math.min(1.0, risks[key]));
    });

    return risks;
  }
}

/**
 * CRI (Composite Risk Index) MODELI
 */
export class CRIModel {
  constructor(riskModel) {
    this.riskModel = riskModel;
    
    // Grup katsayıları
    this.groupCoefficients = {
      biological: 0.6,    // α
      chemical: 0.9,      // β
      physical: 1.3       // γ
    };

    // Risk grupları
    this.riskGroups = {
      biological: [
        'NH3_toxicity', 'night_hypoxia', 'photooxidation',
        'contamination', 'N_limitation', 'pH_fluctuation',
        'light_heterogeneity', 'sedimentation'
      ],
      chemical: [
        'heavy_metal', 'carbon_limitation', 'osmotic_stress',
        'vitamin_deficiency'
      ],
      physical: [
        'temperature_shock', 'heat_stress', 'mechanical_damage',
        'biofilm'
      ]
    };
  }

  calculateGroupRisk(risks, group) {
    const groupRisks = this.riskGroups[group];
    
    let productTerm = 1.0;
    for (const riskName of groupRisks) {
      if (risks[riskName] !== undefined) {
        const weight = this.riskModel.weights[riskName];
        productTerm *= (1 - weight * risks[riskName]);
      }
    }
    
    return 1 - productTerm;
  }

  calculateTotalCRI(risks) {
    // Kilitleyici risk kontrolü
    if (risks.NH3_toxicity > 0.8 || risks.night_hypoxia > 0.8) {
      return 1.0; // Kritik çöküş
    }

    // Grup risk skorları
    const BRI = this.calculateGroupRisk(risks, 'biological');
    const CRI_chem = this.calculateGroupRisk(risks, 'chemical');
    const PRI = this.calculateGroupRisk(risks, 'physical');

    // Toplam CRI
    const CRI = 1 - (
      Math.pow(1 - BRI, this.groupCoefficients.biological) *
      Math.pow(1 - CRI_chem, this.groupCoefficients.chemical) *
      Math.pow(1 - PRI, this.groupCoefficients.physical)
    );

    return Math.max(0.0, Math.min(1.0, CRI));
  }

  getRiskLevel(CRI) {
    if (CRI < 0.2) return RiskLevel.SAFE;
    if (CRI < 0.4) return RiskLevel.WATCH;
    if (CRI < 0.6) return RiskLevel.ALERT;
    if (CRI < 0.8) return RiskLevel.CRITICAL;
    return RiskLevel.COLLAPSE;
  }

  calculateCRITrend(CRIHistory) {
    if (CRIHistory.length < 3) {
      return { dCRI: 0, ddCRI: 0, trend: 'stable' };
    }

    const recent = CRIHistory.slice(-5);
    const dCRI = recent[recent.length - 1] - recent[recent.length - 2];
    const ddCRI = (recent[recent.length - 1] - 2 * recent[recent.length - 2] + recent[recent.length - 3]);

    let trend = 'stable';
    if (dCRI < -0.01) trend = 'improving';
    else if (dCRI > 0.01) trend = 'worsening';

    return { dCRI, ddCRI, trend };
  }
}

export default { RiskModel, CRIModel, RiskLevel };
