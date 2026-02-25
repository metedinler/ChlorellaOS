import {
  KNOWLEDGE_DB_KEYS,
  LEARNING_TOPIC_SEEDS,
  SPECIAL_STOCK_LIBRARY,
  FEEDING_PROGRAM_LIBRARY,
  SPECTRO_METHOD_LIBRARY,
  PROCESS_GUARDRAILS,
  DELIVERY_SPECS
} from '../data/knowledgeDatabaseSeed';

const safeGetItem = (key, fallback = null) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`localStorage read hatası (${key}):`, error);
    return fallback;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`localStorage write hatası (${key}):`, error);
    return false;
  }
};

const parseArray = (raw) => {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveArray = (key, value) => {
  safeSetItem(key, JSON.stringify(Array.isArray(value) ? value : []));
};

const mergeById = (existing, seeds) => {
  const map = new Map();
  (Array.isArray(existing) ? existing : []).forEach((item) => {
    if (item?.id) map.set(item.id, item);
  });
  (Array.isArray(seeds) ? seeds : []).forEach((item) => {
    if (!item?.id) return;
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
};

export const ensureKnowledgeDatabases = () => {
  const existingTopics = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.learningTopics, '[]'));
  const existingStocks = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.specialStocks, '[]'));
  const existingPrograms = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.feedingPrograms, '[]'));
  const existingMethods = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.spectroMethods, '[]'));
  const existingGuardrails = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.processGuardrails, '[]'));
  const existingDeliverySpecs = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.deliverySpecs, '[]'));
  const existingHarvestBatches = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.harvestBatches, '[]'));
  const existingIncidentLog = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.incidentLog, '[]'));
  const existingOdProfiles = parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.odCalibrationProfiles, '[]'));

  const mergedTopics = mergeById(existingTopics, LEARNING_TOPIC_SEEDS);
  const mergedStocks = mergeById(existingStocks, SPECIAL_STOCK_LIBRARY);
  const mergedPrograms = mergeById(existingPrograms, FEEDING_PROGRAM_LIBRARY);
  const mergedMethods = mergeById(existingMethods, SPECTRO_METHOD_LIBRARY);
  const mergedGuardrails = mergeById(existingGuardrails, PROCESS_GUARDRAILS);
  const mergedDeliverySpecs = mergeById(existingDeliverySpecs, DELIVERY_SPECS);

  saveArray(KNOWLEDGE_DB_KEYS.learningTopics, mergedTopics);
  saveArray(KNOWLEDGE_DB_KEYS.specialStocks, mergedStocks);
  saveArray(KNOWLEDGE_DB_KEYS.feedingPrograms, mergedPrograms);
  saveArray(KNOWLEDGE_DB_KEYS.spectroMethods, mergedMethods);
  saveArray(KNOWLEDGE_DB_KEYS.processGuardrails, mergedGuardrails);
  saveArray(KNOWLEDGE_DB_KEYS.deliverySpecs, mergedDeliverySpecs);
  saveArray(KNOWLEDGE_DB_KEYS.harvestBatches, existingHarvestBatches);
  saveArray(KNOWLEDGE_DB_KEYS.incidentLog, existingIncidentLog);
  saveArray(KNOWLEDGE_DB_KEYS.odCalibrationProfiles, existingOdProfiles);

  return {
    topics: mergedTopics,
    stocks: mergedStocks,
    programs: mergedPrograms,
    spectroMethods: mergedMethods,
    processGuardrails: mergedGuardrails,
    deliverySpecs: mergedDeliverySpecs
  };
};

export const getKnowledgeTopics = () => parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.learningTopics, '[]'));
export const getSpecialStocks = () => parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.specialStocks, '[]'));
export const getFeedingPrograms = () => parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.feedingPrograms, '[]'));
export const getSpectroMethods = () => parseArray(safeGetItem(KNOWLEDGE_DB_KEYS.spectroMethods, '[]'));
