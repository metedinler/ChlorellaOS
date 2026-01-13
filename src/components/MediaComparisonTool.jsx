import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Target, Award, DollarSign, CheckCircle, XCircle, AlertTriangle, TrendingUp, Zap, Beaker, Info } from 'lucide-react';
import { MEDIA_DATABASE, getMediaWithStoichiometry } from '../data/mediaDatabase.js';
import { CHEMICALS } from '../data/chemicalDatabase.js';
import { getCustomRecipes } from '../utils/userManager.js';

const MediaComparisonTool = () => {
  const [selectedMedia, setSelectedMedia] = useState(['BBM', 'BG-11', 'JM']);
  const [volume, setVolume] = useState(1);
  const [priorityCriteria, setPriorityCriteria] = useState({
    costEfficiency: 8,
    npRatioBalance: 9,
    easeOfPreparation: 6,
    shelfLife: 5,
    growthRate: 8
  });
  
  const [customRecipes, setCustomRecipes] = useState([]);
  const [customFormulations, setCustomFormulations] = useState([]);
  
  // Custom recipes ve formulations'ları yükle
  useEffect(() => {
    setCustomRecipes(getCustomRecipes());
    
    // ✨ YENİ: localStorage'dan özel formülasyonları yükle
    const savedFormulations = localStorage.getItem('customFormulations');
    if (savedFormulations) {
      try {
        const parsed = JSON.parse(savedFormulations);
        setCustomFormulations(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Formülasyon yükleme hatası:', e);
        setCustomFormulations([]);
      }
    }
  }, []);
  
  const mediaWithData = getMediaWithStoichiometry();
  const REDFIELD_NP_RATIO = 7.11;
  
  // ✨ YENİ: customFormulations'ı medya formatına dönüştür
  const convertFormulationToMedia = (formulation) => {
    // Formülasyondan element analizi yap
    const macronutrients = {};
    
    formulation.stocks?.forEach(stock => {
      stock.chemicals?.forEach(chem => {
        // Her kimyasalın katkısını hesapla
        // Bu basitleştirilmiş bir hesaplama - gerçekte stokiyometrik analiz gerekli
        // Şimdilik temel elementleri tahmin ediyoruz
        const formula = chem.formula || chem.name;
        
        // Temel element mapping (basitleştirilmiş)
        if (formula.includes('NO3') || formula.includes('Nitrat')) {
          if (!macronutrients['N']) macronutrients['N'] = { element: 'N', provides: 0 };
          macronutrients['N'].provides += chem.amount * 0.1; // Yaklaşık
        }
        if (formula.includes('PO4') || formula.includes('Fosfat')) {
          if (!macronutrients['P']) macronutrients['P'] = { element: 'P', provides: 0 };
          macronutrients['P'].provides += chem.amount * 0.05;
        }
        if (formula.includes('K') || formula.includes('Potasyum')) {
          if (!macronutrients['K']) macronutrients['K'] = { element: 'K', provides: 0 };
          macronutrients['K'].provides += chem.amount * 0.2;
        }
      });
    });
    
    return {
      id: formulation.id,
      name: formulation.name,
      fullName: formulation.name,
      composition: {
        macronutrients: macronutrients,
        pH: 7.0, // Default
        hasFullStoichiometry: Object.keys(macronutrients).length > 0
      },
      isCustom: true,
      isFormulation: true
    };
  };
  
  // Tüm medyalar (standart + custom + formulations)
  const allMedia = useMemo(() => {
    const standard = mediaWithData.map(m => ({ ...m, isCustom: false }));
    
    const custom = customRecipes
      .filter(r => r.hasFullStoichiometry && r.macronutrients && Object.keys(r.macronutrients).length > 0)
      .map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.description || r.name,
        composition: {
          macronutrients: r.macronutrients,
          pH: r.pH,
          hasFullStoichiometry: true
        },
        isCustom: true
      }));
    
    // ✨ YENİ: customFormulations'ları ekle
    const formulations = customFormulations
      .map(f => convertFormulationToMedia(f))
      .filter(f => f.composition.hasFullStoichiometry);
    
    return [...standard, ...custom, ...formulations];
  }, [mediaWithData, customRecipes, customFormulations]);
  
  // Her medya için element analizi
  const analyzeMedia = (mediaId) => {
    // Önce standart database'de ara
    let media = MEDIA_DATABASE[mediaId];
    
    // Bulunamazsa custom recipes'de ara
    if (!media) {
      const customRecipe = customRecipes.find(r => r.id === mediaId);
      if (customRecipe && customRecipe.hasFullStoichiometry) {
        media = {
          id: customRecipe.id,
          name: customRecipe.name,
          fullName: customRecipe.description || customRecipe.name,
          composition: {
            macronutrients: customRecipe.macronutrients,
            pH: customRecipe.pH,
            hasFullStoichiometry: true
          }
        };
      }
    }
    
    // ✨ YENİ: Bulunamazsa formulations'da ara
    if (!media) {
      const formulation = customFormulations.find(f => f.id === mediaId);
      if (formulation) {
        media = convertFormulationToMedia(formulation);
      }
    }
    
    if (!media?.composition?.macronutrients) return null;
    
    const elements = { N: 0, P: 0, K: 0, Mg: 0, Ca: 0, S: 0, Na: 0, Cl: 0, C: 0, Fe: 0 };
    
    Object.entries(media.composition.macronutrients).forEach(([compound, data]) => {
      const element = data.element;
      const amount = data.provides * volume;
      if (elements.hasOwnProperty(element)) {
        elements[element] += amount;
      }
    });
    
    const npRatio = elements.N / elements.P;
    
    // Maliyet hesapla
    let totalCost = 0;
    Object.entries(media.composition.macronutrients).forEach(([compound, data]) => {
      const chemicalData = Object.values(CHEMICALS).find(chem => 
        compound.includes(chem.formula) || chem.formula.includes(compound.split('·')[0])
      );
      if (chemicalData?.price?.laboratory) {
        const amountInKg = (data.amount * volume) / 1000;
        totalCost += amountInKg * chemicalData.price.laboratory;
      }
    });
    
    return { elements, npRatio, totalCost, media };
  };
  
  // Scoring sistemi
  const calculateScore = (analysis) => {
    if (!analysis) return 0;
    
    const { npRatio, totalCost, media } = analysis;
    const weights = priorityCriteria;
    
    // 1. N:P Oranı Skoru (0-10)
    const npDeviation = Math.abs(npRatio - REDFIELD_NP_RATIO) / REDFIELD_NP_RATIO;
    const npScore = Math.max(0, 10 - npDeviation * 20);
    
    // 2. Maliyet Skoru (0-10) - daha ucuz = daha yüksek skor
    const costScore = totalCost > 0 ? Math.max(0, 10 - (totalCost / 10)) : 5;
    
    // 3. Hazırlık Kolaylığı (0-10)
    const componentCount = Object.keys(media.composition.macronutrients).length;
    const easeScore = Math.max(0, 10 - componentCount * 0.5);
    
    // 4. Raf Ömrü (0-10) - bazik ortamlar daha stabil
    const phOptimal = media.composition.pH.optimal;
    const shelfScore = phOptimal > 8 ? 9 : (phOptimal > 7 ? 7 : 5);
    
    // 5. Büyüme Hızı (0-10) - yüksek N = hızlı büyüme
    const nContent = analysis.elements.N;
    const growthScore = Math.min(10, nContent / 30);
    
    // Ağırlıklı toplam
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    const weightedScore = (
      (npScore * weights.npRatioBalance) +
      (costScore * weights.costEfficiency) +
      (easeScore * weights.easeOfPreparation) +
      (shelfScore * weights.shelfLife) +
      (growthScore * weights.growthRate)
    ) / totalWeight;
    
    return {
      total: weightedScore,
      breakdown: {
        npRatioBalance: npScore,
        costEfficiency: costScore,
        easeOfPreparation: easeScore,
        shelfLife: shelfScore,
        growthRate: growthScore
      }
    };
  };
  
  // Tüm seçili medyaları analiz et
  const analyses = useMemo(() => {
    return selectedMedia
      .map(id => {
        const analysis = analyzeMedia(id);
        if (!analysis) return null;
        const score = calculateScore(analysis);
        return { id, ...analysis, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score.total - a.score.total);
  }, [selectedMedia, volume, priorityCriteria]);
  
  // Medya seçme/kaldırma
  const toggleMedia = (mediaId) => {
    if (selectedMedia.includes(mediaId)) {
      setSelectedMedia(selectedMedia.filter(id => id !== mediaId));
    } else {
      setSelectedMedia([...selectedMedia, mediaId]);
    }
  };
  
  // Öneri metni
  const getRecommendation = () => {
    if (analyses.length === 0) return null;
    
    const best = analyses[0];
    const reasons = [];
    
    if (best.score.breakdown.npRatioBalance > 7) {
      reasons.push('Redfield oranına çok yakın dengeli formül');
    }
    if (best.score.breakdown.costEfficiency > 7) {
      reasons.push('Maliyet avantajı yüksek');
    }
    if (best.score.breakdown.easeOfPreparation > 7) {
      reasons.push('Hazırlaması kolay');
    }
    if (best.score.breakdown.growthRate > 7) {
      reasons.push('Hızlı büyüme potansiyeli');
    }
    
    return {
      media: best.media,
      score: best.score.total,
      reasons
    };
  };
  
  const recommendation = getRecommendation();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">🎯 Besin Ortamı Karşılaştırma & Karar Destek</h2>
        <p className="text-purple-100">Çoklu Analiz, Scoring Sistemi, Akıllı Öneri</p>
      </div>
      
      {/* Medya Seçici */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Beaker className="w-6 h-6 mr-2 text-purple-600" />
          Karşılaştırılacak Besin Ortamlarını Seçin
        </h3>
        
        {/* Standart Ortamlar */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">📚 Standart Ortamlar</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mediaWithData.map(media => (
              <button
                key={media.id}
                onClick={() => toggleMedia(media.id)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedMedia.includes(media.id)
                    ? 'bg-purple-100 border-purple-500 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold text-sm">{media.name}</div>
                <div className="text-xs text-gray-600 truncate">{media.fullName}</div>
                {selectedMedia.includes(media.id) && (
                  <CheckCircle className="w-4 h-4 text-purple-600 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Özel Tarifler */}
        {customRecipes.filter(r => r.hasFullStoichiometry).length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">
              ⭐ Özel Tariflerim ({customRecipes.filter(r => r.hasFullStoichiometry).length})
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {customRecipes
                .filter(r => r.hasFullStoichiometry && r.macronutrients && Object.keys(r.macronutrients).length > 0)
                .map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => toggleMedia(recipe.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMedia.includes(recipe.id)
                        ? 'bg-green-100 border-green-500 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold">ÖZEL</span>
                    </div>
                    <div className="font-bold text-sm">{recipe.name}</div>
                    <div className="text-xs text-gray-600 truncate">{recipe.description || 'Özel formülasyon'}</div>
                    {selectedMedia.includes(recipe.id) && (
                      <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-2" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}
        
        {/* ✨ YENİ: Özel Formülasyonlar */}
        {customFormulations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">
              🧪 Özel Formülasyonlarım ({customFormulations.length})
              <span className="text-xs text-gray-500 ml-2">
                (Besin Yeri Tasarlama'da oluşturulanlar)
              </span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {customFormulations.map(formulation => {
                const converted = convertFormulationToMedia(formulation);
                if (!converted.composition.hasFullStoichiometry) return null;
                
                return (
                  <button
                    key={formulation.id}
                    onClick={() => toggleMedia(formulation.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedMedia.includes(formulation.id)
                        ? 'bg-blue-100 border-blue-500 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-bold">
                        FORMÜLASYON
                      </span>
                    </div>
                    <div className="font-bold text-sm">{formulation.name}</div>
                    <div className="text-xs text-gray-600">
                      {formulation.stocks?.length || 0} stok • {formulation.cultureVolume}L
                    </div>
                    {formulation.usageCount > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ {formulation.usageCount}× kullanıldı
                      </div>
                    )}
                    {selectedMedia.includes(formulation.id) && (
                      <CheckCircle className="w-4 h-4 text-blue-600 mx-auto mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Kriter Ağırlıkları */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Target className="w-6 h-6 mr-2 text-pink-600" />
          Öncelik Kriterleri (1-10)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(priorityCriteria).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {key === 'costEfficiency' && '💰 Maliyet Verimliliği'}
                {key === 'npRatioBalance' && '⚖️ N:P Dengesi'}
                {key === 'easeOfPreparation' && '🧪 Hazırlık Kolaylığı'}
                {key === 'shelfLife' && '📅 Raf Ömrü'}
                {key === 'growthRate' && '📈 Büyüme Hızı'}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={(e) => setPriorityCriteria({
                  ...priorityCriteria,
                  [key]: parseInt(e.target.value)
                })}
                className="w-full"
              />
              <div className="text-center font-bold text-purple-700">{value}/10</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Hacim Kontrolü */}
      <div className="bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hazırlanacak Hacim (Litre)
        </label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      {/* Öneri Kartı */}
      {recommendation && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6 shadow-lg">
          <div className="flex items-start">
            <Award className="w-12 h-12 text-green-600 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                🏆 ÖNERİLEN: {recommendation.media.name}
              </h3>
              <p className="text-green-700 mb-3">{recommendation.media.fullName}</p>
              <div className="bg-white rounded-lg p-4 mb-3">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  Toplam Skor: {recommendation.score.toFixed(1)}/10
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-600 h-4 rounded-full transition-all"
                    style={{ width: `${recommendation.score * 10}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-bold text-green-800">Neden bu ortam?</div>
                {recommendation.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-green-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Karşılaştırma Tablosu */}
      {analyses.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Sıra</th>
                  <th className="px-4 py-3 text-left">Besin Ortamı</th>
                  <th className="px-4 py-3 text-center">Toplam Skor</th>
                  <th className="px-4 py-3 text-center">N:P Dengesi</th>
                  <th className="px-4 py-3 text-center">Maliyet</th>
                  <th className="px-4 py-3 text-center">Hazırlık</th>
                  <th className="px-4 py-3 text-center">Raf Ömrü</th>
                  <th className="px-4 py-3 text-center">Büyüme</th>
                  <th className="px-4 py-3 text-right">Toplam Fiyat</th>
                  <th className="px-4 py-3 text-center">N:P Oranı</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((analysis, idx) => (
                  <tr
                    key={analysis.id}
                    className={`border-b ${
                      idx === 0 
                        ? 'bg-green-50 font-bold' 
                        : idx % 2 === 0 
                        ? 'bg-gray-50' 
                        : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3">
                      {idx === 0 ? (
                        <div className="flex items-center">
                          <Award className="w-5 h-5 text-green-600 mr-1" />
                          <span className="text-green-700 font-bold">#{idx + 1}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{analysis.media.name}</div>
                      <div className="text-xs text-gray-600">{analysis.media.fullName}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`text-2xl font-bold ${
                        analysis.score.total >= 8 ? 'text-green-600' :
                        analysis.score.total >= 6 ? 'text-blue-600' :
                        analysis.score.total >= 4 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {analysis.score.total.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBar value={analysis.score.breakdown.npRatioBalance} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBar value={analysis.score.breakdown.costEfficiency} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBar value={analysis.score.breakdown.easeOfPreparation} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBar value={analysis.score.breakdown.shelfLife} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ScoreBar value={analysis.score.breakdown.growthRate} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold">{analysis.totalCost.toFixed(2)} TL</div>
                      <div className="text-xs text-gray-600">
                        {(analysis.totalCost / volume).toFixed(2)} TL/L
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className={`font-bold ${
                        Math.abs(analysis.npRatio - REDFIELD_NP_RATIO) / REDFIELD_NP_RATIO < 0.1 
                          ? 'text-green-600' 
                          : Math.abs(analysis.npRatio - REDFIELD_NP_RATIO) / REDFIELD_NP_RATIO < 0.3
                          ? 'text-blue-600'
                          : 'text-yellow-600'
                      }`}>
                        {analysis.npRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Optimal: {REDFIELD_NP_RATIO.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Element Karşılaştırma */}
      {analyses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
            Elementel Kompozisyon Karşılaştırması (mg/L)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Element</th>
                  {analyses.map(analysis => (
                    <th key={analysis.id} className="px-3 py-2 text-center">
                      {analysis.media.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['N', 'P', 'K', 'Mg', 'Ca', 'S', 'Na', 'Cl', 'C', 'Fe'].map(element => (
                  <tr key={element} className="border-b">
                    <td className="px-3 py-2 font-bold text-gray-700">{element}</td>
                    {analyses.map(analysis => {
                      const value = analysis.elements[element];
                      const maxValue = Math.max(...analyses.map(a => a.elements[element]));
                      return (
                        <td key={analysis.id} className="px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="font-medium text-gray-700 w-16 text-right">
                              {value.toFixed(1)}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Bilgilendirme */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
        <div className="flex items-start">
          <Info className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-800 mb-2">Scoring Sistemi Nasıl Çalışır?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>N:P Dengesi:</strong> Redfield oranına (7:1) yakınlık - dengeli büyüme için kritik</li>
              <li>• <strong>Maliyet Verimliliği:</strong> Düşük kimyasal maliyeti - ekonomik üretim</li>
              <li>• <strong>Hazırlık Kolaylığı:</strong> Az bileşen = kolay hazırlık, az hata payı</li>
              <li>• <strong>Raf Ömrü:</strong> pH stabilitesi - bazik ortamlar daha uzun dayanır</li>
              <li>• <strong>Büyüme Hızı:</strong> Yüksek azot içeriği - hızlı biyokütle artışı</li>
            </ul>
            <p className="text-sm text-blue-700 mt-3">
              <strong>Öneri:</strong> Kriterlerin ağırlığını ihtiyaçlarınıza göre ayarlayın. 
              Örneğin, düşük bütçeli üretim için "Maliyet Verimliliği"ni artırın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Yardımcı bileşen - skor barı
const ScoreBar = ({ value }) => {
  const color = value >= 8 ? 'bg-green-500' : value >= 6 ? 'bg-blue-500' : value >= 4 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center justify-center">
      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value * 10}%` }} />
      </div>
      <span className="text-xs font-medium">{value.toFixed(1)}</span>
    </div>
  );
};

export default MediaComparisonTool;
