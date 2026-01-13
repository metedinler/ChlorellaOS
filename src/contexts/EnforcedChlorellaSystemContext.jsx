import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import modelManager from '../managers/ModelManager.js';
import calibrationService from '../services/calibrationService.js';
import stateSynchronizer from '../utils/stateSynchronizer.js';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║   ENFORCED CHLORELLA SYSTEM CONTEXT - TESİS DİJİTAL İKİZİ    ║
 * ║                                                                ║
 * ║   KURALLAR (İHLAL EDİLEMEZ):                                  ║
 * ║   1. TankID olmadan veri YOK                                  ║
 * ║   2. Timestamp olmadan veri YOK                               ║
 * ║   3. Ölçüm → Model otomatik tetiklenir                        ║
 * ║   4. Model → State otomatik senkronize edilir                 ║
 * ║   5. Her değişiklik ACTION olarak kayıtlı                     ║
 * ║   6. UI sadece DISPATCH eder, STATE değiştirmez               ║
 * ║   7. CultureState = Tek kaynak (Single Source of Truth)       ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const EnforcedChlorellaSystemContext = createContext();

// ============================================================================
// TİP TANIMLARI ve SABITLER
// ============================================================================

const ACTION_TYPES = {
  // Tank yönetimi
  CREATE_TANK: 'CREATE_TANK',
  UPDATE_TANK_ENV: 'UPDATE_TANK_ENV',
  
  // Ölçüm ekleme
  ADD_OD_MEASUREMENT: 'ADD_OD_MEASUREMENT',
  ADD_CELL_COUNT: 'ADD_CELL_COUNT',
  ADD_CHEMISTRY: 'ADD_CHEMISTRY',
  
  // Model güncelleme (otomatik)
  UPDATE_MODEL_STATE: 'UPDATE_MODEL_STATE',
  TRIGGER_MODEL_RECALC: 'TRIGGER_MODEL_RECALC',
  
  // Müdahale
  ADD_INTERVENTION: 'ADD_INTERVENTION',
  
  // Medya ve formülasyon
  ADD_MEDIA_FORMULATION: 'ADD_MEDIA_FORMULATION',
  ASSIGN_MEDIUM_TO_TANK: 'ASSIGN_MEDIUM_TO_TANK',
  
  // Sistem
  SYNC_SYSTEM_TIME: 'SYNC_SYSTEM_TIME',
  BATCH_UPDATE: 'BATCH_UPDATE'
};

// ============================================================================
// BAŞLANGIÇ STATE - Sistem Belgesi Uyumlu
// ============================================================================

const createInitialState = () => ({
  // Meta - Sistem kimliği
  meta: {
    version: '3.0.0-enforced',
    systemId: `COS-${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    currentTime: new Date().toISOString(),
    timeStep: 1.0, // saat
    unitSystem: {
      biomass: 'g/L',
      volume: 'L',
      concentration: 'mg/L',
      temperature: '°C',
      light: 'lux',
      time: 'hours'
    }
  },
  
  // Environment - Global çevresel parametreler
  environment: {
    light: {
      intensity: 12000, // lux
      spectrum: 'white',
      photoperiod: 16 // saat
    },
    temperature: 25, // °C
    pH: 7.2,
    aeration: 0.5, // L/min
    CO2: 0 // %
  },
  
  // Tanks - Her tank TankID ile erişilir
  tanks: {},
  
  // Biology - Tür ve suş bilgisi
  biology: {
    species: 'Chlorella vulgaris',
    strain: 'UTEX-265',
    growthModel: 'monod',
    stoichiometry: {
      C_N_ratio: 6.6,
      C_P_ratio: 106,
      N_P_ratio: 16
    },
    nutrientUptake: {
      maxUptakeRate_N: 0.01, // g N / g biomass / h
      maxUptakeRate_P: 0.002
    }
  },
  
  // Operations - Tüm müdahaleler
  operations: {
    interventions: [],
    schedules: []
  },
  
  // Inventory - Malzeme stoku
  inventory: {
    chemicals: [],
    consumables: [],
    equipment: []
  },
  
  // Observations - Ham ölçüm verisi
  observations: [],
  
  // Logs - Sistem olayları
  logs: [],
  
  // Simülasyonlar
  simulations: []
});

// ============================================================================
// TANK STATE YAPISI - Sistem Belgesi Uyumlu
// ============================================================================

const createTankState = (tankId, metadata = {}) => {
  const now = new Date().toISOString();
  
  return {
    // Tank metadata
    tankId,
    tankName: metadata.tankName || `Tank-${tankId}`,
    volume_L: metadata.volume || 5.0,
    geometry: metadata.geometry || 'cylindrical',
    status: 'active',
    createdAt: now,
    lastUpdate: now,
    
    // Environment overrides (tanğa özel)
    environment: metadata.environment || null, // null = global environment kullan
    
    // Medium - Besi ortamı
    medium: {
      mediumId: null,
      formulation: null,
      stockSolutions: []
    },
    
    // Biomass - Canlı varlık
    biomass: {
      currentBiomass_gL: metadata.initialBiomass || 0.1,
      cellDensity_cells_mL: metadata.initialCellDensity || 1e6,
      viability: 0.95,
      generation: 'YOUNG'
    },
    
    // Measurements - Ölçüm zaman serileri
    measurements: {
      od: [],
      cellCount: [],
      dryWeight: [],
      chemistry: []
    },
    
    // Model State - Hesaplanan durum
    modelState: {
      // Besin konsantrasyonları
      N_mgL: metadata.initialN || 50.0,
      P_mgL: metadata.initialP || 5.0,
      C_mgL: metadata.initialC || 100.0,
      
      // Çevresel
      pH: 7.2,
      O2_mgL: 8.0,
      CO2_mgL: 10.0,
      
      // Büyüme parametreleri
      mu_current: 0.0, // 1/h - şu anki büyüme hızı
      mu_max: 0.05, // 1/h - maksimum büyüme hızı
      
      // Monod sabitleri
      K_N: 5.0, // mg/L
      K_P: 1.0, // mg/L
      
      // Verim katsayıları
      YxN: 10.0, // g biomass / g N
      YxP: 50.0, // g biomass / g P
      
      // Zaman
      currentDay: 0,
      currentHour: 0,
      
      // Model durumu
      isSimulated: false,
      lastCalculation: now,
      lastCalibration: null
    },
    
    // Interventions - Tank'a yapılan müdahaleler
    interventions: {
      feedingEvents: [],
      chemicalAdditions: [],
      phAdjustments: [],
      harvests: []
    },
    
    // Statistics - Hesaplanan istatistikler
    statistics: {
      growthRate: 0.0,
      doublingTime: null,
      productivity_g_L_day: 0.0,
      yieldCoefficients: {
        Yx_N: 0.0,
        Yx_P: 0.0
      }
    },
    
    // Risk - Risk değerlendirmesi
    risk: {
      nutrientLimitation: {
        N: 0.0,
        P: 0.0,
        level: 'SAFE'
      },
      contamination: 0.0,
      lightStress: 0.0,
      CRI: 0.0, // Combined Risk Index
      lastAssessment: now
    },
    
    // History - Tank geçmişi (snapshot)
    history: []
  };
};

// ============================================================================
// REDUCER - Tüm state değişiklikleri buradan
// ============================================================================

const systemReducer = (state, action) => {
  const now = new Date().toISOString();
  
  // Her action log'lanır
  const logAction = (actionType, payload, result) => {
    const newLog = {
      id: Date.now(),
      timestamp: now,
      type: actionType,
      payload,
      result,
      user: 'system' // İleride auth eklenebilir
    };
    
    return [...state.logs, newLog];
  };
  
  switch (action.type) {
    // ========================================================================
    // TANK YÖNETİMİ
    // ========================================================================
    
    case ACTION_TYPES.CREATE_TANK: {
      const { tankId, metadata } = action.payload;
      
      // TankID zorunlu
      if (!tankId) {
        throw new Error('❌ TankID olmadan tank oluşturulamaz!');
      }
      
      // Zaten varsa hata
      if (state.tanks[tankId]) {
        throw new Error(`❌ Tank ${tankId} zaten mevcut!`);
      }
      
      const newTank = createTankState(tankId, metadata);
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: newTank
        },
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('CREATE_TANK', { tankId, metadata }, { success: true })
      };
    }
    
    // ========================================================================
    // ÖLÇÜM EKLEME - Otomatik model tetikleme ile
    // ========================================================================
    
    case ACTION_TYPES.ADD_OD_MEASUREMENT: {
      const { tankId, measurement } = action.payload;
      
      // Zorunlu kontroller
      if (!tankId) throw new Error('❌ TankID zorunlu!');
      if (!state.tanks[tankId]) throw new Error(`❌ Tank ${tankId} bulunamadı!`);
      if (!measurement.value) throw new Error('❌ Ölçüm değeri zorunlu!');
      
      // Timestamp kontrolü
      const timestamp = measurement.timestamp || now;
      
      // OD → Biomass kalibrasyon (CalibrationService)
      const wavelength = measurement.wavelength || 680;
      const calibrationResult = calibrationService.odToBiomass(wavelength, measurement.value);
      
      // Yeni ölçüm objesi
      const newMeasurement = {
        id: Date.now(),
        timestamp,
        value: measurement.value,
        wavelength,
        pathlength: measurement.pathlength || 1,
        calibratedBiomass: calibrationResult.biomass,
        calibrationConfidence: calibrationResult.confidence,
        method: measurement.method || 'spectrophotometer',
        confidence: measurement.confidence || 'medium',
        notes: measurement.notes || ''
      };
      
      // Ölçümü ekle
      let updatedTank = {
        ...state.tanks[tankId],
        measurements: {
          ...state.tanks[tankId].measurements,
          od: [...state.tanks[tankId].measurements.od, newMeasurement]
        },
        lastUpdate: now,
        biomass: {
          ...state.tanks[tankId].biomass,
          currentBiomass_gL: calibrationResult.biomass
        }
      };
      
      // Observation ekle
      const newObservation = {
        id: Date.now(),
        timestamp,
        tankId,
        parameter: 'OD',
        value: measurement.value,
        unit: 'AU',
        method: measurement.method || 'spectrophotometer',
        confidence: measurement.confidence || 'medium'
      };
      
      // MODEL ENTEGRASYONU + STATE SYNC: Context → Model → Context
      try {
        // 1. Context state'i hazırla
        const contextState = {
          biomass: calibrationResult.biomass,
          N_mgL: updatedTank.modelState?.N_mgL || 50,
          P_mgL: updatedTank.modelState?.P_mgL || 10,
          pH: updatedTank.modelState?.pH || 7.2,
          temperature: updatedTank.modelState?.temperature || 25,
          O2_mgL: updatedTank.modelState?.O2_mgL || 8,
          light_lux: state.environment.light.intensity,
          volume: updatedTank.volume
        };
        
        // 2. Bidirectional sync: Context ↔ Model
        const syncResult = stateSynchronizer.bidirectionalSync(tankId, contextState);
        
        if (syncResult.success) {
          // 3. Model snapshot'ını context'e yaz
          updatedTank = {
            ...updatedTank,
            ...syncResult.contextState,
            modelState: {
              ...updatedTank.modelState,
              ...syncResult.contextState.modelState,
              lastCalculation: now
            }
          };
          
          console.log(`✅ OD ölçümü kaydedildi ve model senkronize edildi (${tankId})`);
        } else {
          console.warn(`⚠️ Model senkronizasyonu başarısız (${tankId}):`, syncResult.error);
        }
      } catch (error) {
        console.warn('Model sync hatası:', error);
      }
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: updatedTank
        },
        observations: [...state.observations, newObservation],
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('ADD_OD_MEASUREMENT', { tankId, measurement }, { 
          success: true, 
          modelTriggered: true,
          calibrated: true 
        })
      };
    }
    
    case ACTION_TYPES.ADD_CELL_COUNT: {
      const { tankId, measurement } = action.payload;
      
      // Zorunlu kontroller
      if (!tankId) throw new Error('❌ TankID zorunlu!');
      if (!state.tanks[tankId]) throw new Error(`❌ Tank ${tankId} bulunamadı!`);
      if (!measurement.value) throw new Error('❌ Hücre sayısı zorunlu!');
      
      const timestamp = measurement.timestamp || now;
      
      // Yeni hücre sayımı
      const newCount = {
        id: Date.now(),
        timestamp,
        value: measurement.value, // cells/mL
        method: measurement.method || 'hemocytometer',
        dilution: measurement.dilution || 1,
        viability: measurement.viability || null,
        biomassEstimate_gL: measurement.biomassEstimate_gL || (measurement.value / 5e7),
        confidence: measurement.confidence || 'high',
        notes: measurement.notes || '',
        rawCounts: measurement.rawCounts || []
      };
      
      // Tank güncelle
      let updatedTank = {
        ...state.tanks[tankId],
        measurements: {
          ...state.tanks[tankId].measurements,
          cellCount: [...state.tanks[tankId].measurements.cellCount, newCount]
        },
        lastUpdate: now
      };
      
      // Biomass ve viability güncelle
      updatedTank.biomass = {
        ...updatedTank.biomass,
        currentBiomass_gL: newCount.biomassEstimate_gL,
        cellDensity_cells_mL: measurement.value,
        viability: measurement.viability !== null ? measurement.viability : updatedTank.biomass.viability
      };
      
      // MODEL ENTEGRASYONU + STATE SYNC: Context → Model → Context
      try {
        const contextState = {
          biomass: newCount.biomassEstimate_gL,
          N_mgL: updatedTank.modelState?.N_mgL || 50,
          P_mgL: updatedTank.modelState?.P_mgL || 10,
          pH: updatedTank.modelState?.pH || 7.2,
          temperature: updatedTank.modelState?.temperature || 25,
          O2_mgL: updatedTank.modelState?.O2_mgL || 8,
          light_lux: state.environment.light.intensity,
          volume: updatedTank.volume
        };
        
        // Bidirectional sync
        const syncResult = stateSynchronizer.bidirectionalSync(tankId, contextState);
        
        if (syncResult.success) {
          updatedTank = {
            ...updatedTank,
            ...syncResult.contextState,
            modelState: {
              ...updatedTank.modelState,
              ...syncResult.contextState.modelState,
              lastCalculation: now
            }
          };
          
          console.log(`✅ Cell count kaydedildi ve model senkronize edildi (${tankId})`);
        } else {
          console.warn(`⚠️ Model senkronizasyonu başarısız (${tankId}):`, syncResult.error);
        }
      } catch (error) {
        console.warn('Model sync hatası:', error);
      }
      
      // Observation ekle
      const newObservation = {
        id: Date.now(),
        timestamp,
        tankId,
        parameter: 'cell_count',
        value: measurement.value,
        unit: 'cells/mL',
        method: measurement.method,
        confidence: measurement.confidence
      };
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: updatedTank
        },
        observations: [...state.observations, newObservation],
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('ADD_CELL_COUNT', { tankId, measurement }, { 
          success: true,
          modelTriggered: true
        })
      };
    }
    
    case ACTION_TYPES.ADD_CHEMISTRY: {
      const { tankId, measurement } = action.payload;
      
      if (!tankId) throw new Error('❌ TankID zorunlu!');
      if (!state.tanks[tankId]) throw new Error(`❌ Tank ${tankId} bulunamadı!`);
      
      const timestamp = measurement.timestamp || now;
      
      const newChemistry = {
        id: Date.now(),
        timestamp,
        parameter: measurement.parameter, // 'N', 'P', 'pH', 'O2' vs
        value: measurement.value,
        unit: measurement.unit,
        method: measurement.method || 'manual',
        confidence: measurement.confidence || 'medium'
      };
      
      // Tank güncelle
      let updatedTank = {
        ...state.tanks[tankId],
        measurements: {
          ...state.tanks[tankId].measurements,
          chemistry: [...state.tanks[tankId].measurements.chemistry, newChemistry]
        },
        lastUpdate: now
      };
      
      // Model state'e yansıt
      if (['N', 'P', 'C', 'pH', 'O2', 'CO2'].includes(measurement.parameter)) {
        const modelStateKey = measurement.parameter === 'N' ? 'N_mgL' :
                             measurement.parameter === 'P' ? 'P_mgL' :
                             measurement.parameter === 'C' ? 'C_mgL' :
                             measurement.parameter === 'O2' ? 'O2_mgL' :
                             measurement.parameter === 'CO2' ? 'CO2_mgL' :
                             measurement.parameter;
        
        updatedTank.modelState = {
          ...updatedTank.modelState,
          [modelStateKey]: measurement.value
        };
      }
      
      // MODEL ENTEGRASYONU + STATE SYNC: Context → Model → Context
      try {
        const tankState = state.tanks[tankId];
        const contextState = {
          biomass: tankState.biomass.currentBiomass_gL,
          N_mgL: measurement.parameter === 'N' ? measurement.value : updatedTank.modelState?.N_mgL || 50,
          P_mgL: measurement.parameter === 'P' ? measurement.value : updatedTank.modelState?.P_mgL || 10,
          pH: measurement.parameter === 'pH' ? measurement.value : updatedTank.modelState?.pH || 7.2,
          temperature: updatedTank.modelState?.temperature || 25,
          O2_mgL: measurement.parameter === 'O2' ? measurement.value : updatedTank.modelState?.O2_mgL || 8,
          light_lux: state.environment.light.intensity,
          volume: updatedTank.volume
        };
        
        // Bidirectional sync
        const syncResult = stateSynchronizer.bidirectionalSync(tankId, contextState);
        
        if (syncResult.success) {
          updatedTank = {
            ...updatedTank,
            ...syncResult.contextState,
            modelState: {
              ...updatedTank.modelState,
              ...syncResult.contextState.modelState,
              lastCalculation: now
            }
          };
          
          console.log(`✅ Chemistry (${measurement.parameter}) kaydedildi ve model senkronize edildi (${tankId})`);
        } else {
          console.warn(`⚠️ Model senkronizasyonu başarısız (${tankId}):`, syncResult.error);
        }
      } catch (error) {
        console.warn('Model sync hatası:', error);
      }
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: updatedTank
        },
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('ADD_CHEMISTRY', { tankId, measurement }, { success: true })
      };
    }
    
    // ========================================================================
    // MODEL GÜNCELLEME
    // ========================================================================
    
    case ACTION_TYPES.UPDATE_MODEL_STATE: {
      const { tankId, updates } = action.payload;
      
      if (!tankId) throw new Error('❌ TankID zorunlu!');
      if (!state.tanks[tankId]) throw new Error(`❌ Tank ${tankId} bulunamadı!`);
      
      const updatedTank = {
        ...state.tanks[tankId],
        modelState: {
          ...state.tanks[tankId].modelState,
          ...updates,
          lastCalculation: now
        },
        lastUpdate: now
      };
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: updatedTank
        },
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('UPDATE_MODEL_STATE', { tankId, updates }, { success: true })
      };
    }
    
    // ========================================================================
    // MÜDAHALE EKLEME
    // ========================================================================
    
    case ACTION_TYPES.ADD_INTERVENTION: {
      const { tankId, intervention } = action.payload;
      
      if (!tankId) throw new Error('❌ TankID zorunlu!');
      if (!state.tanks[tankId]) throw new Error(`❌ Tank ${tankId} bulunamadı!`);
      if (!intervention.type) throw new Error('❌ Müdahale tipi zorunlu!');
      
      const timestamp = intervention.timestamp || now;
      
      const newIntervention = {
        id: Date.now(),
        timestamp,
        type: intervention.type,
        details: intervention.details || {},
        result: intervention.result || {},
        notes: intervention.notes || ''
      };
      
      // Müdahale tipine göre kategorize et
      const category = intervention.type.includes('feed') ? 'feedingEvents' :
                      intervention.type.includes('chemical') ? 'chemicalAdditions' :
                      intervention.type.includes('pH') ? 'phAdjustments' :
                      intervention.type.includes('harvest') ? 'harvests' :
                      'chemicalAdditions'; // default
      
      const updatedTank = {
        ...state.tanks[tankId],
        interventions: {
          ...state.tanks[tankId].interventions,
          [category]: [...state.tanks[tankId].interventions[category], newIntervention]
        },
        lastUpdate: now
      };
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: updatedTank
        },
        operations: {
          ...state.operations,
          interventions: [...state.operations.interventions, { tankId, ...newIntervention }]
        },
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('ADD_INTERVENTION', { tankId, intervention }, { success: true })
      };
    }
    
    // ========================================================================
    // MEDYA YÖNETİMİ
    // ========================================================================
    
    case ACTION_TYPES.ADD_MEDIA_FORMULATION: {
      const { formulation } = action.payload;
      
      if (!formulation.id) throw new Error('❌ Formülasyon ID zorunlu!');
      if (!formulation.name) throw new Error('❌ Formülasyon adı zorunlu!');
      
      const newFormulation = {
        ...formulation,
        createdAt: formulation.createdAt || now
      };
      
      // Mevcut varsa güncelle, yoksa ekle
      const existingIndex = state.inventory.chemicals.findIndex(f => f.id === formulation.id);
      let updatedChemicals;
      
      if (existingIndex >= 0) {
        updatedChemicals = [...state.inventory.chemicals];
        updatedChemicals[existingIndex] = newFormulation;
      } else {
        updatedChemicals = [...state.inventory.chemicals, newFormulation];
      }
      
      return {
        ...state,
        inventory: {
          ...state.inventory,
          chemicals: updatedChemicals
        },
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('ADD_MEDIA_FORMULATION', { formulation }, { success: true })
      };
    }
    
    case ACTION_TYPES.ASSIGN_MEDIUM_TO_TANK: {
      const { tankId, mediumId, formulation } = action.payload;
      
      if (!tankId) throw new Error('❌ TankID zorunlu!');
      if (!state.tanks[tankId]) throw new Error(`❌ Tank ${tankId} bulunamadı!`);
      if (!mediumId) throw new Error('❌ Medium ID zorunlu!');
      
      const updatedTank = {
        ...state.tanks[tankId],
        medium: {
          mediumId,
          formulation,
          assignedAt: now
        },
        lastUpdate: now
      };
      
      return {
        ...state,
        tanks: {
          ...state.tanks,
          [tankId]: updatedTank
        },
        meta: {
          ...state.meta,
          lastUpdate: now
        },
        logs: logAction('ASSIGN_MEDIUM_TO_TANK', { tankId, mediumId }, { success: true })
      };
    }
    
    // ========================================================================
    // SİSTEM
    // ========================================================================
    
    case ACTION_TYPES.SYNC_SYSTEM_TIME: {
      return {
        ...state,
        meta: {
          ...state.meta,
          currentTime: now,
          lastUpdate: now
        }
      };
    }
    
    default:
      return state;
  }
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const EnforcedChlorellaSystemProvider = ({ children }) => {
  const [state, dispatch] = useReducer(systemReducer, null, createInitialState);
  
  // localStorage senkronizasyon
  useEffect(() => {
    const savedState = localStorage.getItem('enforcedChlorellaSystem');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: ACTION_TYPES.BATCH_UPDATE, payload: parsed });
      } catch (err) {
        console.warn('⚠️ Saved state yüklenemedi:', err);
      }
    }
  }, []);
  
  // State değişince localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('enforcedChlorellaSystem', JSON.stringify(state));
  }, [state]);
  
  // Sistem zamanı senkronizasyonu (1 saniyede bir)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: ACTION_TYPES.SYNC_SYSTEM_TIME });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // ============================================================================
  // API FONKSIYONLARI
  // ============================================================================
  
  const api = {
    // Tank yönetimi
    createTank: useCallback((tankId, metadata) => {
      dispatch({ 
        type: ACTION_TYPES.CREATE_TANK, 
        payload: { tankId, metadata } 
      });
      
      // ModelManager'a tank kaydı
      try {
        modelManager.initializeModel(tankId, {
          biomass: metadata.initialBiomass || 0.1,
          pH: 7.2,
          NO3: metadata.initialN || 50.0,
          PO4: metadata.initialP || 5.0,
          temperature: 25,
          lightIntensity: 8000,
          aeration: 0.5
        }, {
          tankVolume: metadata.volume || 1.0,
          tankDepth: metadata.depth || 10,
          dt: 0.1
        });
      } catch (error) {
        console.error('Model başlatma hatası:', error);
      }
    }, []),
    
    getTankState: useCallback((tankId) => {
      return state.tanks[tankId] || null;
    }, [state.tanks]),
    
    getAllTankStates: useCallback(() => {
      return state.tanks;
    }, [state.tanks]),
    
    // Ölçüm ekleme
    addODMeasurement: useCallback((tankId, measurement) => {
      dispatch({ 
        type: ACTION_TYPES.ADD_OD_MEASUREMENT, 
        payload: { tankId, measurement } 
      });
    }, []),
    
    addCellCount: useCallback((tankId, measurement) => {
      dispatch({ 
        type: ACTION_TYPES.ADD_CELL_COUNT, 
        payload: { tankId, measurement } 
      });
    }, []),
    
    addChemistry: useCallback((tankId, measurement) => {
      dispatch({ 
        type: ACTION_TYPES.ADD_CHEMISTRY, 
        payload: { tankId, measurement } 
      });
    }, []),
    
    // Model fonksiyonları
    getRiskAssessment: useCallback((tankId) => {
      try {
        const result = modelManager.assessRisks(tankId);
        return result.success ? result.risks : null;
      } catch (error) {
        console.error('Risk değerlendirme hatası:', error);
        return null;
      }
    }, []),
    
    getModelSnapshot: useCallback((tankId) => {
      try {
        const result = modelManager.getSnapshot(tankId);
        return result.success ? result.snapshot : null;
      } catch (error) {
        console.error('Model snapshot hatası:', error);
        return null;
      }
    }, []),
    
    runSimulation: useCallback(async (tankId, duration_h, callback) => {
      try {
        return await modelManager.runSimulation(tankId, duration_h, callback);
      } catch (error) {
        console.error('Simülasyon hatası:', error);
        return null;
      }
    }, []),
    
    calibrateModel: useCallback((tankId, observations) => {
      try {
        return modelManager.calibrateModel(tankId, observations);
      } catch (error) {
        console.error('Kalibrasyon hatası:', error);
        return { success: false, error: error.message };
      }
    }, []),
    
    getModelPerformance: useCallback((tankId) => {
      try {
        return modelManager.getPerformanceReport(tankId);
      } catch (error) {
        console.error('Performans raporu hatası:', error);
        return null;
      }
    }, []),
    
    // Kalibrasyon servisi
    addCalibrationPoint: useCallback((wavelength, OD, biomass) => {
      return calibrationService.addCalibrationPoint(wavelength, OD, biomass);
    }, []),
    
    getCalibrationQuality: useCallback(() => {
      return calibrationService.getQualityReport();
    }, []),
    
    // Model güncelleme
    updateModelState: useCallback((tankId, updates) => {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_MODEL_STATE, 
        payload: { tankId, updates } 
      });
    }, []),
    
    // Müdahale
    addIntervention: useCallback((tankId, intervention) => {
      dispatch({ 
        type: ACTION_TYPES.ADD_INTERVENTION, 
        payload: { tankId, intervention } 
      });
    }, []),
    
    // Medya
    addMediaFormulation: useCallback((formulation) => {
      dispatch({ 
        type: ACTION_TYPES.ADD_MEDIA_FORMULATION, 
        payload: { formulation } 
      });
    }, []),
    
    assignMediumToTank: useCallback((tankId, mediumId, formulation) => {
      dispatch({ 
        type: ACTION_TYPES.ASSIGN_MEDIUM_TO_TANK, 
        payload: { tankId, mediumId, formulation } 
      });
    }, []),
    
    // State okuma
    getSystemState: useCallback(() => state, [state]),
    getObservations: useCallback(() => state.observations, [state.observations]),
    getLogs: useCallback(() => state.logs, [state.logs])
  };
  
  return (
    <EnforcedChlorellaSystemContext.Provider value={{ state, dispatch, ...api }}>
      {children}
    </EnforcedChlorellaSystemContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useEnforcedChlorellaSystem = () => {
  const context = useContext(EnforcedChlorellaSystemContext);
  if (!context) {
    throw new Error('❌ useEnforcedChlorellaSystem must be used within EnforcedChlorellaSystemProvider');
  }
  return context;
};

// ============================================================================
// EXPORT
// ============================================================================

export default EnforcedChlorellaSystemContext;
export { ACTION_TYPES };
