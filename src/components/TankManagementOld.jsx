import React, { useState } from 'react';
import { Database, Droplet } from 'lucide-react';
import { tankSystem } from '../data/systemData';

const TankManagement = () => {
  const [activeTanks, setActiveTanks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getAllTanks = () => {
    const allTanks = [];
    Object.entries(tankSystem).forEach(([categoryKey, types]) => {
      const categoryName = {
        kavanozlar: 'Kavanozlar (1L)',
        siseler: 'Şişeler (5L)',
        kovalar: 'Kovalar (70L)',
        ibcler: 'IBC\'ler (1000L)'
      }[categoryKey];
      
      Object.entries(types).forEach(([key, tank]) => {
        if (tank.tanks) {
          tank.tanks.forEach(tankId => {
            allTanks.push({
              id: tankId,
              series: tank.series,
              volume: tank.volume,
              type: tank.type,
              category: categoryName,
              categoryKey
            });
          });
        } else {
          for (let i = 1; i <= tank.count; i++) {
            allTanks.push({
              id: `${key}${i}`,
              series: key,
              volume: tank.volume,
              type: tank.type,
              category: categoryName,
              categoryKey
            });
          }
        }
      });
    });
    return allTanks;
  };

  const tanks = getAllTanks();
  const filteredTanks = selectedCategory === 'all' 
    ? tanks 
    : tanks.filter(t => t.categoryKey === selectedCategory);

  const getTotalVolume = () => {
    return tanks.reduce((sum, tank) => sum + tank.volume, 0);
  };

  const getActiveVolume = () => {
    return activeTanks.reduce((sum, tankId) => {
      const tank = tanks.find(t => t.id === tankId);
      return sum + (tank ? tank.volume : 0);
    }, 0);
  };

  const toggleTank = (tankId) => {
    setActiveTanks(prev => 
      prev.includes(tankId) 
        ? prev.filter(id => id !== tankId)
        : [...prev, tankId]
    );
  };

  const getCategoryStats = () => {
    const stats = {};
    Object.keys(tankSystem).forEach(key => {
      const categoryTanks = tanks.filter(t => t.categoryKey === key);
      const activeCategoryTanks = categoryTanks.filter(t => activeTanks.includes(t.id));
      stats[key] = {
        total: categoryTanks.length,
        active: activeCategoryTanks.length,
        volume: activeCategoryTanks.reduce((sum, t) => sum + t.volume, 0)
      };
    });
    return stats;
  };

  const stats = getCategoryStats();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Database className="w-6 h-6 text-purple-600" />
        Tank Yönetim Sistemi
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Toplam Tank</div>
          <div className="text-3xl font-bold text-blue-600">{tanks.length}</div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Aktif Tank</div>
          <div className="text-3xl font-bold text-emerald-600">{activeTanks.length}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Aktif Hacim</div>
          <div className="text-2xl font-bold text-purple-600">{getActiveVolume()}L</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Toplam Kapasite</div>
          <div className="text-2xl font-bold text-amber-600">{getTotalVolume()}L</div>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kategori Filtrele
        </label>
        <select
          className="w-full px-4 py-2 border rounded-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Tüm Tanklar ({tanks.length})</option>
          <option value="kavanozlar">Kavanozlar 1L ({tanks.filter(t => t.categoryKey === 'kavanozlar').length})</option>
          <option value="siseler">Şişeler 5L ({tanks.filter(t => t.categoryKey === 'siseler').length})</option>
          <option value="kovalar">Kovalar 70L ({tanks.filter(t => t.categoryKey === 'kovalar').length})</option>
          <option value="ibcler">IBC&apos;ler 1000L ({tanks.filter(t => t.categoryKey === 'ibcler').length})</option>
        </select>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-bold text-gray-800 mb-3">Kategori İstatistikleri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats).map(([key, stat]) => (
            <div key={key} className="bg-white rounded-lg p-3 border-l-4 border-emerald-500">
              <div className="text-xs text-gray-600 mb-1">
                {key === 'kavanozlar' ? 'Kavanozlar' :
                 key === 'siseler' ? 'Şişeler' :
                 key === 'kovalar' ? 'Kovalar' : 'IBC\'ler'}
              </div>
              <div className="text-sm font-bold text-gray-800">
                {stat.active}/{stat.total} aktif
              </div>
              <div className="text-xs text-emerald-600">
                {stat.volume}L
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-96 overflow-y-auto">
        {filteredTanks.map(tank => {
          const isActive = activeTanks.includes(tank.id);
          return (
            <button
              key={tank.id}
              onClick={() => toggleTank(tank.id)}
              className={`
                relative aspect-square rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                border-2 ${isActive ? 'border-emerald-400' : 'border-gray-300'}
                flex flex-col items-center justify-center p-2
              `}
              title={`${tank.id} - ${tank.volume}L (${tank.category})`}
            >
              <Droplet className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'} mb-1`} />
              <div className="text-xs font-bold">{tank.id}</div>
              <div className="text-[10px]">{tank.volume}L</div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setActiveTanks(tanks.map(t => t.id))}
          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition text-sm"
        >
          Tümünü Seç
        </button>
        <button
          onClick={() => setActiveTanks([])}
          className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition text-sm"
        >
          Temizle
        </button>
      </div>
    </div>
  );
};

export default TankManagement;
