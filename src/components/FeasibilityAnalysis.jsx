import React, { useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, Beaker, AlertCircle, Package, TrendingDown, PieChart, Briefcase } from 'lucide-react';
import { feasibilityData } from '../data/systemData';
import { useMaterials } from '../contexts/MaterialsContext';

const FeasibilityAnalysis = () => {
  const { materials, useChemical, calculateTotals } = useMaterials();
  const [scenario, setScenario] = useState('firstTwo');
  const [priceUSD, setPriceUSD] = useState(3);
  const [exchangeRate, setExchangeRate] = useState(50);
  const [production, setProduction] = useState(1000);
  const [selectedChemical, setSelectedChemical] = useState('');
  const [amountToUse, setAmountToUse] = useState(1);
  const [warningMessage, setWarningMessage] = useState('');

  const calculateProfitability = () => {
    const priceTL = priceUSD * exchangeRate;
    const revenue = production * priceTL;
    
    const fixedCost = feasibilityData.fixedCosts.total;
    const variableCost = scenario === 'firstTwo' 
      ? feasibilityData.variableCosts.scenario1.total 
      : feasibilityData.variableCosts.scenario3Plus.total;
    
    const totalCost = fixedCost + variableCost;
    const profit = revenue - totalCost;
    const profitMargin = ((profit / revenue) * 100).toFixed(1);
    const costPerKg = (totalCost / production).toFixed(2);
    const profitPerKg = (profit / production).toFixed(2);
    
    return {
      revenue,
      fixedCost,
      variableCost,
      totalCost,
      profit,
      profitMargin,
      costPerKg,
      profitPerKg
    };
  };

  const handleUseChemical = () => {
    if (!selectedChemical || amountToUse <= 0) {
      alert('Lütfen kimyasal ve miktar seçin');
      return;
    }

    const result = useChemical(selectedChemical, amountToUse);
    if (result.success) {
      if (result.warning) {
        setWarningMessage(result.warning);
        setTimeout(() => setWarningMessage(''), 5000);
      } else {
        alert(`✅ ${amountToUse} kg ${selectedChemical} stoktan düşüldü`);
      }
      setSelectedChemical('');
      setAmountToUse(1);
    }
  };

  const results = calculateProfitability();
  const chemicalMaterials = materials.filter(m => m.category === 'Kimyasal');
  const totals = calculateTotals();

  // Kategori bazlı analiz
  const categoryAnalysis = materials.reduce((acc, material) => {
    const category = material.category || 'Diğer';
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        totalValue: 0,
        items: []
      };
    }
    acc[category].count += 1;
    acc[category].totalValue += material.totalCost || 0;
    acc[category].items.push(material);
    return acc;
  }, {});

  // Stok durumu analizi
  const stockAnalysis = {
    critical: materials.filter(m => (m.currentStock || 0) === 0).length,
    low: materials.filter(m => (m.currentStock || 0) > 0 && (m.currentStock || 0) < 10).length,
    adequate: materials.filter(m => (m.currentStock || 0) >= 10).length
  };

  return (
    <div className="space-y-6">
      {/* Malzeme & Maliyet Yönetimi Özeti */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Briefcase className="w-10 h-10" />
          <div>
            <h2 className="text-3xl font-bold">Malzeme & Maliyet Yönetimi</h2>
            <p className="text-indigo-100">Tüm alımları kaydedin, stok takibi yapın, maliyetleri analiz edin</p>
          </div>
        </div>

        {/* Ana İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-indigo-100 mb-1">Toplam Maliyet</div>
            <div className="text-3xl font-bold">{totals.total.toLocaleString('tr-TR')} ₺</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-indigo-100 mb-1">Üretim Maliyeti</div>
            <div className="text-3xl font-bold text-green-300">{totals.production.toLocaleString('tr-TR')} ₺</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-indigo-100 mb-1">Diğer Giderler</div>
            <div className="text-3xl font-bold text-orange-300">{totals.nonProduction.toLocaleString('tr-TR')} ₺</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-sm text-indigo-100 mb-1">Toplam Kalem</div>
            <div className="text-3xl font-bold text-yellow-300">{materials.length}</div>
          </div>
        </div>

        {/* Kategori Analizi */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6" />
            Kategori Bazlı Dağılım
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categoryAnalysis).map(([category, data]) => (
              <div key={category} className="bg-white/10 rounded-lg p-3">
                <div className="text-sm text-indigo-100 mb-1">{category}</div>
                <div className="text-xl font-bold">{data.count} adet</div>
                <div className="text-sm text-indigo-200">
                  {data.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stok Durumu Analizi */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            Stok Durumu Analizi
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-300">{stockAnalysis.critical}</div>
              <div className="text-sm text-red-200">Kritik (Stok=0)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-300">{stockAnalysis.low}</div>
              <div className="text-sm text-orange-200">Düşük (&lt;10)</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-300">{stockAnalysis.adequate}</div>
              <div className="text-sm text-green-200">Yeterli (≥10)</div>
            </div>
          </div>
        </div>

        {/* Muhasebe Bilgisi */}
        <div className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="font-bold mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Muhasebe Özeti
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-indigo-200">Dönen Varlıklar:</span>
              <div className="font-bold text-lg">{totals.total.toLocaleString('tr-TR')} ₺</div>
            </div>
            <div>
              <span className="text-indigo-200">Stok Devir Hızı:</span>
              <div className="font-bold text-lg">{(materials.length / 12).toFixed(1)} ay</div>
            </div>
            <div>
              <span className="text-indigo-200">Ortalama Birim Maliyet:</span>
              <div className="font-bold text-lg">{(totals.total / materials.length).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺</div>
            </div>
            <div>
              <span className="text-indigo-200">Üretim/Toplam Oranı:</span>
              <div className="font-bold text-lg">%{((totals.production / totals.total) * 100).toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {warningMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3 animate-pulse">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <p className="text-red-800 font-semibold">{warningMessage}</p>
        </div>
      )}

      {/* Kimyasal Kullanımı */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Beaker className="w-6 h-6" />
          Üretimde Kimyasal Kullan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-teal-100 mb-2">Kimyasal</label>
            <select
              className="w-full px-4 py-2 rounded-lg text-gray-800"
              value={selectedChemical}
              onChange={(e) => setSelectedChemical(e.target.value)}
            >
              <option value="">Seçin...</option>
              {chemicalMaterials.map(m => (
                <option key={m.id} value={m.name}>
                  {m.name} (Stok: {m.currentStock || 0} {m.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-teal-100 mb-2">Miktar (kg)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="w-full px-4 py-2 rounded-lg text-gray-800"
              value={amountToUse}
              onChange={(e) => setAmountToUse(parseFloat(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUseChemical}
              className="w-full bg-white text-teal-600 px-6 py-2 rounded-lg font-semibold hover:bg-teal-50 transition"
            >
              Stoktan Düş
            </button>
          </div>
        </div>
        <p className="text-teal-100 text-sm mt-3">
          💡 Üretimde kullandığınız kimyasalları buradan stoktan düşebilirsiniz. Stok 0'a düşerse otomatik alışveriş listesine eklenir.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Fizibilite ve Karlılık Analizi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senaryo
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
            >
              <option value="firstTwo">1-2. Üretim (Müşteri aljinat verir)</option>
              <option value="thirdPlus">3+ Üretim (Kendi aljinatı)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Satış Fiyatı (USD/kg)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border rounded-lg"
              value={priceUSD}
              onChange={(e) => setPriceUSD(parseFloat(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dolar Kuru (₺)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full px-4 py-2 border rounded-lg"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Üretim Miktarı (kg)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg"
              value={production}
              onChange={(e) => setProduction(parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Satış Fiyatı</div>
            <div className="text-2xl font-bold text-emerald-600">
              {(priceUSD * exchangeRate).toFixed(0)} ₺/kg
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Maliyet</div>
            <div className="text-2xl font-bold text-blue-600">
              {results.costPerKg} ₺/kg
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Kar</div>
            <div className="text-2xl font-bold text-purple-600">
              {results.profitPerKg} ₺/kg
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-1">Kar Marjı</div>
            <div className="text-2xl font-bold text-amber-600">
              %{results.profitMargin}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="font-bold text-gray-800 mb-3">Detaylı Maliyet Analizi</h3>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Gelir ({production} kg × {(priceUSD * exchangeRate).toFixed(0)} ₺)</span>
            <span className="font-semibold text-emerald-600">{results.revenue.toLocaleString()} ₺</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Sabit Maliyet</span>
            <span className="font-semibold text-red-600">-{results.fixedCost.toLocaleString()} ₺</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-700">Değişken Maliyet</span>
            <span className="font-semibold text-red-600">-{results.variableCost.toLocaleString()} ₺</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-bold text-gray-800">Toplam Maliyet</span>
            <span className="font-bold text-red-600">-{results.totalCost.toLocaleString()} ₺</span>
          </div>
          
          <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-3 mt-2">
            <span className="font-bold text-gray-800 text-lg">NET KAR</span>
            <span className="font-bold text-emerald-600 text-2xl">
              {results.profit.toLocaleString()} ₺
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Yatırım Özeti
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Toplam Yatırım</div>
            <div className="text-2xl font-bold text-gray-800">
              {feasibilityData.investment.total.toLocaleString()} ₺
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {Math.ceil(feasibilityData.investment.total / results.profit)} üretimde amorti edilir
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">İlk Kar Zamanı</div>
            <div className="text-2xl font-bold text-emerald-600">
              ~{Math.ceil((feasibilityData.investment.total / results.profit) * 1.5)} ay
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Her üretim ~1.5 ay sürüyor
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          6 Aylık Nakit Akış Projeksiyonu
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Ay</th>
                <th className="px-4 py-2 text-left">Üretim</th>
                <th className="px-4 py-2 text-right">Gelir</th>
                <th className="px-4 py-2 text-right">Maliyet</th>
                <th className="px-4 py-2 text-right">Kar</th>
                <th className="px-4 py-2 text-right">Kümülatif</th>
              </tr>
            </thead>
            <tbody>
              {feasibilityData.cashFlow.map((item, idx) => {
                const isProfit = item.profit > 0;
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">{item.month}</td>
                    <td className="px-4 py-2">{item.production}</td>
                    <td className="px-4 py-2 text-right">{item.revenue.toLocaleString()} ₺</td>
                    <td className="px-4 py-2 text-right text-red-600">{item.cost.toLocaleString()} ₺</td>
                    <td className={`px-4 py-2 text-right font-semibold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.profit.toLocaleString()} ₺
                    </td>
                    <td className={`px-4 py-2 text-right font-bold ${item.cumulative > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {item.cumulative.toLocaleString()} ₺
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeasibilityAnalysis;
