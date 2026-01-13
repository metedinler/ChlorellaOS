/**
 * TAM KAPSAMLI MODEL - SU KİMYASI MODÜLÜ
 * Kaynak: tamkapsamli_chlorellaOS_model.md
 */

export class WaterChemistry {
  constructor(initial = {}) {
    this.volume = initial.volume || 100.0;           // L
    this.pH = initial.pH || 7.2;
    this.alkalinity = initial.alkalinity || 50.0;    // mg/L CaCO3
    this.hardness = initial.hardness || 50.0;        // mg/L CaCO3
    this.temperature = initial.temperature || 25.0;  // °C
    this.EC = initial.EC || 64.0;                   // μS/cm
    this.TDS = initial.TDS || 100.0;                // mg/L
    this.Ca = initial.Ca || 20.0;                   // mg/L
    this.Mg = initial.Mg || 10.0;                   // mg/L
    this.Na = initial.Na || 15.0;                   // mg/L
    this.K = initial.K || 5.0;                      // mg/L
  }

  /**
   * Asit ekleme (HCl, H2SO4, vs.)
   */
  applyAcid(acidMl, acidConcentration, acidType = 'HCl') {
    const molesH = (acidMl / 1000) * acidConcentration;
    
    // Alkalinite nötralizasyonu
    const alkalinityReduction = molesH * 50000; // mg/L CaCO3 eşdeğeri
    this.alkalinity = Math.max(0, this.alkalinity - alkalinityReduction / this.volume);
    
    // pH değişimi (Henderson-Hasselbalch yaklaşımı)
    let pHChange;
    if (this.alkalinity > 0) {
      pHChange = -Math.log10(1 + molesH / (this.alkalinity * this.volume / 50000));
    } else {
      pHChange = -Math.log10(molesH * 1000 / this.volume);
    }
    
    this.pH += pHChange;
    this.pH = Math.max(4.0, Math.min(10.0, this.pH));
    
    // TDS ve EC güncelleme
    if (acidType === 'HCl') {
      this.TDS += (acidMl * 0.36) / this.volume;
      this.EC = this.TDS * 0.64;
    }
    
    return { pHChange, newpH: this.pH };
  }

  /**
   * Baz ekleme (NaHCO3, NaOH, vs.)
   */
  applyBase(baseMl, baseConcentration, baseType = 'NaHCO3') {
    const molesHCO3 = (baseMl / 1000) * baseConcentration;
    
    this.alkalinity += (molesHCO3 * 50000) / this.volume;
    
    let pHChange;
    if (this.alkalinity > 0) {
      pHChange = Math.log10(1 + molesHCO3 / (this.alkalinity * this.volume / 50000));
    } else {
      pHChange = Math.log10(molesHCO3 * 1000 / this.volume);
    }
    
    this.pH += pHChange;
    this.pH = Math.max(4.0, Math.min(10.0, this.pH));
    
    if (baseType === 'NaHCO3') {
      this.TDS += (baseMl * 0.84) / this.volume;
      this.EC = this.TDS * 0.64;
    }
    
    return { pHChange, newpH: this.pH };
  }

  /**
   * İyonik güç hesaplama
   */
  calculateIonicStrength() {
    const concentrations = [
      this.Ca / 40.08 / 2,
      this.Mg / 24.31 / 2,
      this.Na / 22.99,
      this.K / 39.10
    ];
    const charges = [2, 2, 1, 1];
    
    let ionicStrength = 0;
    for (let i = 0; i < concentrations.length; i++) {
      ionicStrength += concentrations[i] * Math.pow(charges[i], 2);
    }
    
    return 0.5 * ionicStrength;
  }

  /**
   * NH3/NH4+ dengesi (pH ve sıcaklığa bağlı)
   */
  calculateNH3NH4(TAN, temperature) {
    const pKa = 9.25 + 0.032 * (25 - temperature);
    let NH3Ratio;
    
    if (this.pH > pKa) {
      NH3Ratio = 1 / (1 + Math.pow(10, pKa - this.pH));
    } else {
      NH3Ratio = 0;
    }
    
    const NH3 = TAN * NH3Ratio;
    const NH4 = TAN * (1 - NH3Ratio);
    
    return { NH3, NH4 };
  }
}

export default WaterChemistry;
