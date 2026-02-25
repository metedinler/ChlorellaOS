import {
  LEARNING_CENTER_TOPIC_SEEDS,
  PRODUCTION_PLAN_SEEDS,
  DAILY_STAGE_PLAN_SEEDS,
  SPECTRO_CALIBRATION_OBJECT_SEEDS,
  INTERVENTION_DICTIONARY_SEEDS,
  ANALYTICAL_QC_PROFILE_SEEDS,
  COLD_CHAIN_EVENT_TEMPLATE_SEEDS
} from '../data/documentOperationalSeed';
import { ensureKnowledgeDatabases, getSpectroMethods } from './knowledgeDatabase';

const safeParseArray = (raw) => {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const safeParseObject = (raw, fallback = {}) => {
  try {
    const parsed = JSON.parse(raw || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const mergeById = (existing, seeds) => {
  const map = new Map();
  (Array.isArray(existing) ? existing : []).forEach((item) => {
    if (item?.id != null) map.set(String(item.id), item);
  });
  (Array.isArray(seeds) ? seeds : []).forEach((item) => {
    if (item?.id == null) return;
    const key = String(item.id);
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
};

const writeArrayKey = (key, seeds) => {
  const existing = safeParseArray(localStorage.getItem(key));
  const merged = mergeById(existing, seeds);
  localStorage.setItem(key, JSON.stringify(merged));
  return merged.length;
};

const ensureSpectroCalibrationDb = () => {
  const existingCal = safeParseObject(localStorage.getItem('chlorella_calibrations'), {});
  const mergedCal = {
    ...SPECTRO_CALIBRATION_OBJECT_SEEDS,
    ...existingCal
  };
  localStorage.setItem('chlorella_calibrations', JSON.stringify(mergedCal));

  const existingDb = safeParseObject(localStorage.getItem('chlorellaSpectroCalibrationDb'), {
    calibrations: {},
    methods: [],
    updatedAt: null
  });

  const mergedDb = {
    calibrations: {
      ...SPECTRO_CALIBRATION_OBJECT_SEEDS,
      ...(existingDb.calibrations || {})
    },
    methods: mergeById(existingDb.methods || [], getSpectroMethods()),
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem('chlorellaSpectroCalibrationDb', JSON.stringify(mergedDb));
};

const ensureLearningCenterTopics = () => {
  const existing = safeParseArray(localStorage.getItem('learningCenterTopics'));
  const merged = mergeById(existing, LEARNING_CENTER_TOPIC_SEEDS);
  localStorage.setItem('learningCenterTopics', JSON.stringify(merged));
  return merged.length;
};

const ensureDailyCheckKeys = () => {
  const manualChecks = safeParseObject(localStorage.getItem('chlorellaDailyStageManualChecks'), null);
  const dailyChecks = safeParseObject(localStorage.getItem('chlorellaDailyStageDailyChecks'), null);

  if (!manualChecks) localStorage.setItem('chlorellaDailyStageManualChecks', JSON.stringify({}));
  if (!dailyChecks) localStorage.setItem('chlorellaDailyStageDailyChecks', JSON.stringify({}));
};

export const ensureDocumentDatabaseIntegration = () => {
  ensureKnowledgeDatabases();

  const learningCount = ensureLearningCenterTopics();
  const productionCount = writeArrayKey('productionPlans', PRODUCTION_PLAN_SEEDS);
  const dailyPlanCount = writeArrayKey('chlorellaDailyStagePlans', DAILY_STAGE_PLAN_SEEDS);
  const interventionDictCount = writeArrayKey('chlorellaInterventionDictionary', INTERVENTION_DICTIONARY_SEEDS);
  const qcProfileCount = writeArrayKey('chlorellaAnalyticalQCProfiles', ANALYTICAL_QC_PROFILE_SEEDS);
  const coldChainCount = writeArrayKey('chlorellaColdChainEvents', COLD_CHAIN_EVENT_TEMPLATE_SEEDS);

  ensureDailyCheckKeys();
  ensureSpectroCalibrationDb();

  return {
    learningCount,
    productionCount,
    dailyPlanCount,
    interventionDictCount,
    qcProfileCount,
    coldChainCount
  };
};
