/**
 * Özel Formülasyonlar Veritabanı
 * Kullanıcı tarafından oluşturulan özel besin ortamı formülasyonları
 */

import { indexedDBService } from '../services/IndexedDBService.js';

// Özel formülasyon şablonu
export const CUSTOM_FORMULATION_TEMPLATE = {
  id: '',
  name: '',
  description: '',
  cultureVolume: 1,
  stocks: [],
  targetSpecies: [],
  createdDate: '',
  modifiedDate: '',
  usageCount: 0,
  stockTransactions: [],
  isActive: true,
  notes: ''
};

// Yardımcı fonksiyonlar
export const getCustomFormulationById = async (id) => {
  try {
    await indexedDBService.init();
    return await indexedDBService.getCustomFormulation(id);
  } catch (error) {
    console.error('Error getting custom formulation:', error);
    return null;
  }
};

export const saveCustomFormulation = async (formulation) => {
  try {
    await indexedDBService.init();

    // Validation
    if (!formulation.name || !formulation.name.trim()) {
      throw new Error('Formülasyon adı gerekli');
    }

    if (!formulation.stocks || formulation.stocks.length === 0) {
      throw new Error('En az bir stok eklenmeli');
    }

    // Add timestamps
    const now = new Date().toISOString();
    if (!formulation.id) {
      formulation.id = `custom_${Date.now()}`;
      formulation.createdDate = now;
    }
    formulation.modifiedDate = now;

    await indexedDBService.saveCustomFormulation(formulation);
    return formulation;
  } catch (error) {
    console.error('Error saving custom formulation:', error);
    throw error;
  }
};

export const getAllCustomFormulations = async () => {
  try {
    await indexedDBService.init();
    const formulations = await indexedDBService.getCustomFormulations();
    return formulations || [];
  } catch (error) {
    console.error('Error getting custom formulations:', error);
    return [];
  }
};

export const deleteCustomFormulationById = async (id) => {
  try {
    await indexedDBService.init();
    await indexedDBService.deleteCustomFormulation(id);
    return true;
  } catch (error) {
    console.error('Error deleting custom formulation:', error);
    throw error;
  }
};

export const updateCustomFormulationUsage = async (id) => {
  try {
    const formulation = await getCustomFormulationById(id);
    if (formulation) {
      formulation.usageCount = (formulation.usageCount || 0) + 1;
      formulation.modifiedDate = new Date().toISOString();
      await saveCustomFormulation(formulation);
    }
  } catch (error) {
    console.error('Error updating formulation usage:', error);
  }
};

export const searchCustomFormulations = async (searchTerm) => {
  try {
    const allFormulations = await getAllCustomFormulations();
    if (!searchTerm || !searchTerm.trim()) {
      return allFormulations;
    }

    const term = searchTerm.toLowerCase();
    return allFormulations.filter(formulation =>
      formulation.name.toLowerCase().includes(term) ||
      formulation.description.toLowerCase().includes(term) ||
      (formulation.targetSpecies && formulation.targetSpecies.some(species =>
        species.toLowerCase().includes(term)
      ))
    );
  } catch (error) {
    console.error('Error searching custom formulations:', error);
    return [];
  }
};

export const getActiveCustomFormulations = async () => {
  try {
    const allFormulations = await getAllCustomFormulations();
    return allFormulations.filter(formulation => formulation.isActive !== false);
  } catch (error) {
    console.error('Error getting active custom formulations:', error);
    return [];
  }
};

export const validateCustomFormulation = (formulation) => {
  const errors = [];

  if (!formulation.name || !formulation.name.trim()) {
    errors.push('Formülasyon adı gerekli');
  }

  if (!formulation.stocks || formulation.stocks.length === 0) {
    errors.push('En az bir stok eklenmeli');
  }

  if (formulation.cultureVolume <= 0) {
    errors.push('Kültür hacmi 0\'dan büyük olmalı');
  }

  // Check for duplicate stock names
  const stockNames = formulation.stocks.map(stock => stock.name);
  const uniqueStockNames = [...new Set(stockNames)];
  if (stockNames.length !== uniqueStockNames.length) {
    errors.push('Aynı isimde birden fazla stok olamaz');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export template for new formulations
export const createNewCustomFormulation = () => {
  return {
    ...CUSTOM_FORMULATION_TEMPLATE,
    id: `custom_${Date.now()}`,
    createdDate: new Date().toISOString(),
    modifiedDate: new Date().toISOString()
  };
};