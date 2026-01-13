import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ModelManager from '../managers/ModelManager';

/**
 * 🔴 MERKEZI VERİ OMURGASI - TEK GERÇEK KAYNAK
 * 
 * Bu Context sistemdeki TÜM sayfalar tarafından kullanılır.
 * Hiçbir sayfa kendi kafasına göre veri üretmez.
 * 
 * Veri Akışı:
 * - Ölçüm Sayfaları (CellCounting, Spectro) → measurements yazarlar
 * - CultureModeling → modelState okur ve yazar
 * - FormulationManager → mediaLibrary okur ve yazar
 * - SimulationWorker → tüm state'i okur ve günceller
 * - İstatistikler → SADECE okur
 */

const ChlorellaSystemContext = createContext();

/**
 * Merkezi SystemState Yapısı
 */
const createInitialSystemState = () => ({
  // Meta bilgiler
  meta: {
    version: '2.0.0',
    lastUpdate: new Date().toISOString(),
    systemTime: new Date().toISOString()
  },
  
  // Tanklar - Her tank için ayrı CultureState
  tanks: {},
  
  // Global medya kütüphanesi
  mediaLibrary: [],
  
  // Kimyasal stok
  chemicalStocks: [],
  
  // Kalibrasyon eğrileri
  calibrationCurves: [],
  
  // Sistem olayları
  systemEvents: []
});

/**
 * Tank için CultureState yapısı
 */
const createTankState = (tankId, metadata = {}) => ({
  // Metadata
  tankId,
  tankName: metadata.tankName || tankId,
  volume_L: metadata.volume || 5.0,
  geometry: metadata.geometry || 'cylindrical',
  status: 'active',
  createdAt: new Date().toISOString(),
  
  // Environment (çevresel parametreler)
  environment: {
    temperature_C: 25,
    light_lux: 12000,
    photoperiod_h: 16,
    agitation_rpm: 0,
    aeration_L_min: 0.5,
    CO2_percent: 0
  },
  
  // Biomass (biyokütle ölçümleri)
  measurements: {
    // OD ölçümleri
    od: [],
    // Hücre sayımları
    cellCount: [],
    // Kuru ağırlık
    dryWeight: [],
    // Kimyasal analizler
    chemistry: []
  },
  
  // Model durumu
  modelState: {
    // Mevcut model parametreleri
    currentBiomass_gL: 0.1,
    N_mgL: 0,
    P_mgL: 0,
    C_mgL: 0,
    pH: 7.2,
    
    // Büyüme parametreleri
    mu_max: 0.05, // 1/h
    K_N: 5.0,
    K_P: 1.0,
    YxN: 10.0,
    YxP: 50.0,
    
    // Simülasyon zamanı
    currentDay: 0,
    currentHour: 0,
    
    // Tahmin/gerçek ayrımı
    isSimulated: false,
    lastCalibration: null
  },
  
  // Medium (besin yeri)
  medium: {
    mediumId: null,
    formulation: null,
    stockSolutions: [],
    initialComposition: {},
    consumptionRates: {}
  },
  
  // Müdahaleler (interventions)
  interventions: {
    feedingEvents: [],
    chemicalAdditions: [],
    phAdjustments: [],
    harvests: []
  },
  
  // İstatistikler
  statistics: {
    growthRate: 0,
    doublingTime: 0,
    yieldCoefficients: {},
    productivityHistory: []
  },
  
  // Risk değerlendirmesi
  risk: {
    nutrientLimitation: false,
    contamination: false,
    lightStress: false,
    CRI: 0,
    riskHistory: [],
    CRIHistory: []
  },
  
  // Zaman serisi (tüm geçmiş)
  history: []
});

export const ChlorellaSystemProvider = ({ children }) => {
  const [systemState, setSystemState] = useState(() => {
    // localStorage'dan yükle
    const saved = localStorage.getItem('chlorellaSystemState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('❌ SystemState yüklenemedi:', error);
      }
    }
    return createInitialSystemState();
  });
  
  const [modelManager] = useState(() => ModelManager.getInstance());

  // SystemState değiştiğinde localStorage'a kaydet
  useEffect(() => {
    try {
      localStorage.setItem('chlorellaSystemState', JSON.stringify(systemState));
    } catch (error) {
      console.error('❌ SystemState kaydedilemedi:', error);
    }
  }, [systemState]);

  /**
   * 🔴 TANK İŞLEMLERİ
   */
  
  // Tank oluştur/aktifleştir
  const createTank = useCallback((tankId, metadata = {}) => {
    setSystemState(prev => {
      if (prev.tanks[tankId]) {
        console.warn(`⚠️ Tank ${tankId} zaten mevcut`);
        return prev;
      }
      
      const newTank = createTankState(tankId, metadata);
      
      return {
        ...prev,
        tanks: {
          ...prev.tanks,
          [tankId]: newTank
        },
        systemEvents: [...prev.systemEvents, {
          type: 'TANK_CREATED',
          tankId,
          timestamp: new Date().toISOString()
        }]
      };
    });
  }, []);

  // Tank state'ini getir
  const getTankState = useCallback((tankId) => {
    return systemState.tanks[tankId] || null;
  }, [systemState]);

  // Tüm tank state'lerini getir
  const getAllTankStates = useCallback(() => {
    return Object.values(systemState.tanks);
  }, [systemState]);

  /**
   * 🔴 ÖLÇÜM İŞLEMLERİ
   */
  
  // OD ölçümü ekle
  const addODMeasurement = useCallback((tankId, measurement) => {
    setSystemState(prev => {
      const tank = prev.tanks[tankId];
      if (!tank) {
        console.error(`❌ Tank ${tankId} bulunamadı`);
        return prev;
      }
      
      const odMeasurement = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        wavelength_nm: measurement.wavelength || 680,
        value: measurement.value,
        pathlength_cm: measurement.pathlength || 1,
        calibrated_biomass_gL: measurement.calibratedBiomass || null,
        method: 'spectrophotometer',
        confidence: measurement.confidence || 'high',
        sourcePage: 'Spectrophotometer'
      };
      
      return {
        ...prev,
        tanks: {
          ...prev.tanks,
          [tankId]: {
            ...tank,
            measurements: {
              ...tank.measurements,
              od: [...tank.measurements.od, odMeasurement]
            }
          }
        }
      };
    });
  }, []);

  // Hücre sayımı ekle
  const addCellCount = useCallback((tankId, measurement) => {
    setSystemState(prev => {
      const tank = prev.tanks[tankId];
      if (!tank) {
        console.error(`❌ Tank ${tankId} bulunamadı`);
        return prev;
      }
      
      const cellCountMeasurement = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        value_cells_per_mL: measurement.value,
        method: measurement.method || 'hemocytometer',
        dilution: measurement.dilution || 1,
        confidence: measurement.confidence || 'high',
        notes: measurement.notes || '',
        sourcePage: 'CellCounting'
      };
      
      return {
        ...prev,
        tanks: {
          ...prev.tanks,
          [tankId]: {
            ...tank,
            measurements: {
              ...tank.measurements,
              cellCount: [...tank.measurements.cellCount, cellCountMeasurement]
            }
          }
        }
      };
    });
  }, []);

  /**
   * 🔴 MODEL İŞLEMLERİ
   */
  
  // Model parametrelerini güncelle
  const updateModelState = useCallback((tankId, updates) => {
    setSystemState(prev => {
      const tank = prev.tanks[tankId];
      if (!tank) {
        console.error(`❌ Tank ${tankId} bulunamadı`);
        return prev;
      }
      
      return {
        ...prev,
        tanks: {
          ...prev.tanks,
          [tankId]: {
            ...tank,
            modelState: {
              ...tank.modelState,
              ...updates,
              lastUpdate: new Date().toISOString()
            }
          }
        }
      };
    });
  }, []);

  /**
   * 🔴 MÜDAHALE İŞLEMLERİ
   */
  
  // Kimyasal ekleme
  const addChemicalIntervention = useCallback((tankId, intervention) => {
    setSystemState(prev => {
      const tank = prev.tanks[tankId];
      if (!tank) {
        console.error(`❌ Tank ${tankId} bulunamadı`);
        return prev;
      }
      
      const chemicalIntervention = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        chemical: intervention.chemical,
        amount: intervention.amount,
        unit: intervention.unit,
        targetParameter: intervention.target,
        reason: intervention.reason || '',
        appliedBy: intervention.user || 'system'
      };
      
      return {
        ...prev,
        tanks: {
          ...prev.tanks,
          [tankId]: {
            ...tank,
            interventions: {
              ...tank.interventions,
              chemicalAdditions: [...tank.interventions.chemicalAdditions, chemicalIntervention]
            }
          }
        }
      };
    });
  }, []);

  /**
   * 🔴 MEDIUM İŞLEMLERİ
   */
  
  // Medium formülasyonu ekle (global)
  const addMediaFormulation = useCallback((formulation) => {
    setSystemState(prev => ({
      ...prev,
      mediaLibrary: [...prev.mediaLibrary, {
        ...formulation,
        id: Date.now(),
        createdAt: new Date().toISOString()
      }]
    }));
  }, []);

  // Tanka medium ata
  const assignMediumToTank = useCallback((tankId, mediumId) => {
    setSystemState(prev => {
      const tank = prev.tanks[tankId];
      const medium = prev.mediaLibrary.find(m => m.id === mediumId);
      
      if (!tank || !medium) {
        console.error(`❌ Tank veya medium bulunamadı`);
        return prev;
      }
      
      return {
        ...prev,
        tanks: {
          ...prev.tanks,
          [tankId]: {
            ...tank,
            medium: {
              mediumId,
              formulation: medium,
              stockSolutions: medium.stockSolutions || [],
              initialComposition: medium.composition || {},
              assignedAt: new Date().toISOString()
            }
          }
        }
      };
    });
  }, []);

  const value = {
    // State
    systemState,
    
    // Tank operasyonları
    createTank,
    getTankState,
    getAllTankStates,
    
    // Ölçüm operasyonları
    addODMeasurement,
    addCellCount,
    
    // Model operasyonları
    updateModelState,
    
    // Müdahale operasyonları
    addChemicalIntervention,
    
    // Medium operasyonları
    addMediaFormulation,
    assignMediumToTank,
    
    // ModelManager referansı
    modelManager
  };

  return (
    <ChlorellaSystemContext.Provider value={value}>
      {children}
    </ChlorellaSystemContext.Provider>
  );
};

/**
 * Hook kullanımı
 */
export const useChlorellaSystem = () => {
  const context = useContext(ChlorellaSystemContext);
  if (!context) {
    throw new Error('useChlorellaSystem must be used within ChlorellaSystemProvider');
  }
  return context;
};

export default ChlorellaSystemContext;
