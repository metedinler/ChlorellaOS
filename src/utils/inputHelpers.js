// Input yardımcı fonksiyonları
// Kullanıcı tercihlerine göre otomatik davranışlar

import { getPreferences } from './userManager';

/**
 * Sayı inputları için onFocus event handler
 * Kullanıcı tercihlerine göre:
 * - Auto-Clear Zero: 0 değerini siler
 * - Auto-Select Text: Tüm metni seçer
 */
export const handleNumberInputFocus = (event) => {
  const preferences = getPreferences();
  
  // Auto-Clear Zero: 0 değerini temizle
  if (preferences.autoClearZero) {
    const value = event.target.value;
    if (value === '0' || value === '0.0' || value === '0.00') {
      event.target.value = '';
    }
  }
  
  // Auto-Select Text: Metni seç
  if (preferences.autoSelectText) {
    event.target.select();
  }
};

/**
 * Text inputları için onFocus event handler
 * Kullanıcı tercihlerine göre metni seçer
 */
export const handleTextInputFocus = (event) => {
  const preferences = getPreferences();
  
  if (preferences.autoSelectText) {
    event.target.select();
  }
};

/**
 * React component'lerde kullanım için hook benzeri yardımcı
 */
export const useInputHelpers = () => {
  const preferences = getPreferences();
  
  return {
    // Sayı inputları için props objesi
    numberInputProps: {
      onFocus: handleNumberInputFocus
    },
    
    // Text inputları için props objesi
    textInputProps: {
      onFocus: handleTextInputFocus
    },
    
    // Manual kontrol için preferences
    preferences
  };
};

/**
 * KULLANIM ÖRNEKLERİ:
 * 
 * 1. Direkt event handler:
 * <input 
 *   type="number" 
 *   onFocus={handleNumberInputFocus}
 *   value={amount}
 *   onChange={(e) => setAmount(e.target.value)}
 * />
 * 
 * 2. Hook ile props spreading:
 * const { numberInputProps } = useInputHelpers();
 * <input 
 *   type="number"
 *   {...numberInputProps}
 *   value={amount}
 *   onChange={(e) => setAmount(e.target.value)}
 * />
 * 
 * 3. Manuel kontrol:
 * const { preferences } = useInputHelpers();
 * {preferences.autoClearZero && <span>Auto-clear açık!</span>}
 */
