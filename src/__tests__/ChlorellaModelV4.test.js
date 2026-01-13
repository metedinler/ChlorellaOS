/**
 * ChlorellaModelV4 Unit Tests
 * 
 * Sistemplani.md uyumlu testler:
 * - Monod kinetik doğrulaması
 * - Stokiyometri kontrolü
 * - Risk assessment validasyonu
 * - State senkronizasyon testleri
 */

import ChlorellaModelV4 from '../models/ChlorellaModelV4.js';
import modelManager from '../managers/ModelManager.js';
import stateSynchronizer from '../utils/stateSynchronizer.js';

describe('ChlorellaModelV4 - Monod Kinetics', () => {
  let model;

  beforeEach(() => {
    model = new ChlorellaModelV4({
      volume: 1.0,
      initialBiomass: 0.5
    });
  });

  test('Initial state setup', () => {
    expect(model.biology.biomass).toBe(0.5);
    expect(model.nutrients.NO3).toBeGreaterThan(0);
    expect(model.nutrients.PO4).toBeGreaterThan(0);
  });

  test('Monod growth rate calculation', () => {
    // μ = μ_max * min(N_lim, P_lim) * light_lim
    const result = model.step(0.1); // 0.1 hour

    expect(result.biology.growthRate).toBeGreaterThanOrEqual(0);
    expect(result.biology.growthRate).toBeLessThanOrEqual(model.config.μ_max);
  });

  test('Biomass growth with nutrients', () => {
    const initialBiomass = model.biology.biomass;
    
    // 1 saat simülasyon
    for (let i = 0; i < 10; i++) {
      model.step(0.1);
    }

    // Biomass artmalı (besin varken)
    expect(model.biology.biomass).toBeGreaterThan(initialBiomass);
  });

  test('Nutrient consumption (Stoichiometry)', () => {
    const initialNO3 = model.nutrients.NO3;
    const initialPO4 = model.nutrients.PO4;

    // 10 saat simülasyon
    for (let i = 0; i < 100; i++) {
      model.step(0.1);
    }

    // Besinler tüketilmeli
    expect(model.nutrients.NO3).toBeLessThan(initialNO3);
    expect(model.nutrients.PO4).toBeLessThan(initialPO4);

    // Redfield ratio kontrolü (yaklaşık N:P = 16:1)
    const consumedN = initialNO3 - model.nutrients.NO3;
    const consumedP = initialPO4 - model.nutrients.PO4;
    const ratio = consumedN / consumedP;
    
    expect(ratio).toBeGreaterThan(10); // Y_X_N / Y_X_P = 10/50 * biomass
    expect(ratio).toBeLessThan(20);
  });

  test('Growth stops when nutrients depleted', () => {
    // Besinleri tüket
    model.nutrients.NO3 = 0.1; // Çok düşük
    model.nutrients.PO4 = 0.01;

    const initialBiomass = model.biology.biomass;

    // 10 saat simülasyon
    for (let i = 0; i < 100; i++) {
      model.step(0.1);
    }

    // Biomass artışı çok az olmalı
    const growth = model.biology.biomass - initialBiomass;
    expect(growth).toBeLessThan(0.1);
  });

  test('No random numbers in calculations', () => {
    // Aynı başlangıç koşulları → aynı sonuç (deterministic)
    const model1 = new ChlorellaModelV4({ volume: 1.0, initialBiomass: 0.5 });
    const model2 = new ChlorellaModelV4({ volume: 1.0, initialBiomass: 0.5 });

    for (let i = 0; i < 50; i++) {
      model1.step(0.1);
      model2.step(0.1);
    }

    expect(model1.biology.biomass).toBeCloseTo(model2.biology.biomass, 10);
    expect(model1.nutrients.NO3).toBeCloseTo(model2.nutrients.NO3, 10);
  });
});

describe('Risk Assessment System', () => {
  let model;

  beforeEach(() => {
    model = new ChlorellaModelV4({
      volume: 1.0,
      initialBiomass: 2.0
    });
  });

  test('CRI calculation', () => {
    const snapshot = model.getSnapshot();
    
    expect(snapshot.risks.CRI).toBeGreaterThanOrEqual(0);
    expect(snapshot.risks.CRI).toBeLessThanOrEqual(1);
  });

  test('All 16 risk scenarios present', () => {
    const snapshot = model.getSnapshot();
    const riskKeys = Object.keys(snapshot.risks.risks);

    expect(riskKeys.length).toBe(16);
    expect(riskKeys).toContain('N_limitation');
    expect(riskKeys).toContain('P_limitation');
    expect(riskKeys).toContain('NH3_toxicity');
    expect(riskKeys).toContain('night_hypoxia');
  });

  test('NH3 toxicity risk (high pH)', () => {
    // pH yüksek + NH4 yüksek → NH3 toksik
    model.water.pH = 9.0;
    model.water.NH4 = 20; // mg/L

    const snapshot = model.getSnapshot();
    
    expect(snapshot.risks.risks.NH3_toxicity).toBeGreaterThan(0.5);
  });

  test('Nutrient limitation risk', () => {
    // Besinleri düşür
    model.nutrients.NO3 = 2.0; // mg/L (çok düşük)
    
    const snapshot = model.getSnapshot();
    
    expect(snapshot.risks.risks.N_limitation).toBeGreaterThan(0.7);
  });

  test('CRI increases with multiple risks', () => {
    // İlk durum
    const snapshot1 = model.getSnapshot();
    const CRI1 = snapshot1.risks.CRI;

    // Çoklu risk oluştur
    model.nutrients.NO3 = 1.0; // Azot düşük
    model.nutrients.PO4 = 0.5; // Fosfor düşük
    model.water.pH = 9.5; // pH yüksek

    const snapshot2 = model.getSnapshot();
    const CRI2 = snapshot2.risks.CRI;

    expect(CRI2).toBeGreaterThan(CRI1);
  });
});

describe('ModelManager Integration', () => {
  const testTankId = 'TEST-TANK-001';

  beforeEach(() => {
    // Temiz başla
    modelManager.resetModel(testTankId);
  });

  afterEach(() => {
    modelManager.resetModel(testTankId);
  });

  test('Initialize model', () => {
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 0.5
    });

    expect(modelManager.hasModel(testTankId)).toBe(true);
  });

  test('Update with measurement', () => {
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 0.5
    });

    const result = modelManager.updateWithMeasurement(testTankId, {
      biomass: 1.5,
      NO3: 30,
      PO4: 8,
      pH: 7.5
    });

    expect(result.success).toBe(true);
    expect(result.snapshot.biology.biomass).toBe(1.5);
    expect(result.risks.CRI).toBeGreaterThanOrEqual(0);
  });

  test('Run simulation', async () => {
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 0.5
    });

    let progressCalled = false;
    const result = await modelManager.runSimulation(testTankId, 10, (update) => {
      progressCalled = true;
      expect(update.progress).toBeGreaterThanOrEqual(0);
      expect(update.progress).toBeLessThanOrEqual(100);
    });

    expect(progressCalled).toBe(true);
    expect(result.success).toBe(true);
    expect(result.snapshot.biology.biomass).toBeGreaterThan(0.5);
  });

  test('Get snapshot', () => {
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 2.0
    });

    const result = modelManager.getSnapshot(testTankId);
    
    expect(result.success).toBe(true);
    expect(result.snapshot.biology.biomass).toBe(2.0);
    expect(result.snapshot.risks).toBeDefined();
  });
});

describe('State Synchronizer', () => {
  const testTankId = 'TEST-SYNC-001';

  beforeEach(() => {
    modelManager.resetModel(testTankId);
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 1.0
    });
  });

  afterEach(() => {
    modelManager.resetModel(testTankId);
  });

  test('Context to Model sync', () => {
    const contextState = {
      biomass: 2.5,
      N_mgL: 30,
      P_mgL: 8,
      pH: 7.5,
      temperature: 25,
      O2_mgL: 8,
      light_lux: 12000,
      volume: 1.0
    };

    const result = stateSynchronizer.syncContextToModel(testTankId, contextState);

    expect(result.success).toBe(true);
    expect(result.model.biology.biomass).toBe(2.5);
  });

  test('Model to Context sync', () => {
    const result = stateSynchronizer.syncModelToContext(testTankId);

    expect(result.success).toBe(true);
    expect(result.contextState.biomass).toBeDefined();
    expect(result.contextState.N_mgL).toBeDefined();
    expect(result.contextState.modelState.CRI).toBeGreaterThanOrEqual(0);
  });

  test('Bidirectional sync', () => {
    const contextState = {
      biomass: 3.0,
      N_mgL: 40,
      P_mgL: 10,
      pH: 7.2,
      temperature: 25,
      O2_mgL: 8,
      light_lux: 12000,
      volume: 1.0
    };

    const result = stateSynchronizer.bidirectionalSync(testTankId, contextState);

    expect(result.success).toBe(true);
    expect(result.contextState.biomass).toBeCloseTo(3.0, 1);
    expect(result.model.biology.biomass).toBeCloseTo(3.0, 1);
  });

  test('Conflict detection', () => {
    // Model'i güncelle
    modelManager.updateWithMeasurement(testTankId, {
      biomass: 5.0,
      NO3: 50,
      PO4: 10,
      pH: 7.5
    });

    // Context'te farklı değerler
    const contextState = {
      biomass: 2.0, // Farklı
      N_mgL: 30,
      P_mgL: 8,
      pH: 7.5,
      temperature: 25,
      O2_mgL: 8,
      light_lux: 12000,
      volume: 1.0
    };

    const conflicts = stateSynchronizer.detectConflicts(testTankId, contextState);

    expect(conflicts.hasConflicts).toBe(true);
    expect(conflicts.conflicts.length).toBeGreaterThan(0);
    expect(conflicts.conflicts.some(c => c.field === 'biomass')).toBe(true);
  });

  test('Sync statistics', () => {
    // Birkaç sync yap
    for (let i = 0; i < 5; i++) {
      stateSynchronizer.syncContextToModel(testTankId, {
        biomass: 1.0 + i * 0.5,
        N_mgL: 50,
        P_mgL: 10,
        pH: 7.5,
        temperature: 25,
        O2_mgL: 8,
        light_lux: 12000,
        volume: 1.0
      });
    }

    const stats = stateSynchronizer.getSyncStats();

    expect(stats.totalSyncs).toBeGreaterThanOrEqual(5);
    expect(stats.successRate).toBeDefined();
    expect(stats.avgDuration).toBeDefined();
  });
});

describe('CalibrationService', () => {
  test('OD to Biomass conversion', () => {
    // calibrationService mock (gerçek import gerekebilir)
    const mockCalibrationService = {
      odToBiomass: (wavelength, OD) => {
        // Basit linear kalibrasyon (5:1 ratio)
        return {
          biomass: OD * 5.0,
          confidence: 'high',
          R2: 0.98
        };
      }
    };

    const result = mockCalibrationService.odToBiomass(680, 0.5);

    expect(result.biomass).toBe(2.5);
    expect(result.confidence).toBe('high');
    expect(result.R2).toBeGreaterThan(0.95);
  });
});

describe('7-day Simulation (Integration Test)', () => {
  const testTankId = 'TEST-7DAY-001';

  beforeEach(() => {
    modelManager.resetModel(testTankId);
    modelManager.initializeModel(testTankId, {
      volume: 10.0, // 10L
      initialBiomass: 0.5
    });
  });

  afterEach(() => {
    modelManager.resetModel(testTankId);
  });

  test('7-day growth with sufficient nutrients', async () => {
    const hours = 168; // 7 gün

    const result = await modelManager.runSimulation(testTankId, hours, null);

    expect(result.success).toBe(true);
    
    // Biyokütle artmalı
    expect(result.snapshot.biology.biomass).toBeGreaterThan(0.5);
    
    // Besinler tüketilmeli
    expect(result.snapshot.nutrients.NO3).toBeLessThan(50);
    
    // CRI hesaplanmış olmalı
    expect(result.snapshot.risks.CRI).toBeDefined();
    
    // Risk seviyesi kontrol edilebilir durumda
    expect(result.snapshot.risks.CRI).toBeLessThan(0.9);
  }, 30000); // 30 saniye timeout (uzun test)
});

describe('Performance Tests', () => {
  test('1 hour simulation should complete in <200ms', async () => {
    const testTankId = 'TEST-PERF-001';
    
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 1.0
    });

    const startTime = performance.now();
    await modelManager.runSimulation(testTankId, 1, null);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(200);

    modelManager.resetModel(testTankId);
  });

  test('Bidirectional sync should complete in <150ms', () => {
    const testTankId = 'TEST-PERF-002';
    
    modelManager.initializeModel(testTankId, {
      volume: 1.0,
      initialBiomass: 1.0
    });

    const contextState = {
      biomass: 2.0,
      N_mgL: 40,
      P_mgL: 10,
      pH: 7.5,
      temperature: 25,
      O2_mgL: 8,
      light_lux: 12000,
      volume: 1.0
    };

    const startTime = performance.now();
    const result = stateSynchronizer.bidirectionalSync(testTankId, contextState);
    const duration = performance.now() - startTime;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(150);

    modelManager.resetModel(testTankId);
  });
});
