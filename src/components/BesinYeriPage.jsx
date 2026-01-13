import React, { useState } from 'react';
import { Beaker, Library, Calculator, TrendingUp } from 'lucide-react';
import UnifiedMediaLibrary from './UnifiedMediaLibrary';
import NutrientCalculator from './NutrientCalculator';
import MediaComparisonTool from './MediaComparisonTool';

/**
 * BesinYeriPage - Unified media management page with tabs
 * WITH SHARED STATE for seamless data flow between tabs
 */
const BesinYeriPage = () => {
  const [activeSubTab, setActiveSubTab] = useState('library');
  const [selectedMedia, setSelectedMedia] = useState(null);  // ← Shared state
  const [comparisonList, setComparisonList] = useState([]);  // ← Shared state

  // Tab configuration
  const tabs = [
    {
      id: 'library',
      label: 'Kütüphane',
      icon: Library,
      description: '30 standart + özel besin ortamları'
    },
    {
      id: 'calculator',
      label: 'Besin Yeri Tasarlama',
      icon: Calculator,
      description: 'Özel besin yeri oluştur'
    },
    {
      id: 'comparison',
      label: 'Karşılaştırma',
      icon: TrendingUp,
      description: 'Besin ortamları karşılaştır'
    }
  ];

  // Get active tab
  const activeTab = tabs.find(tab => tab.id === activeSubTab);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Beaker className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Besin Yeri Yönetimi</h2>
        </div>
        <p className="text-emerald-100">
          {activeTab?.description || 'Tüm besin ortamı işlemleri'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-md p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:shadow-md'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab Content with Props */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {activeSubTab === 'library' && (
          <UnifiedMediaLibrary 
            onSelectMedia={(media) => {
              setSelectedMedia(media);
              setActiveSubTab('calculator');
            }}
            onCompare={(media) => {
              setComparisonList([...comparisonList, media]);
              setActiveSubTab('comparison');
            }}
            onClone={(media) => {
              setSelectedMedia({ ...media, isClone: true });
              setActiveSubTab('calculator');
            }}
          />
        )}
        
        {activeSubTab === 'calculator' && (
          <NutrientCalculator 
            initialMedia={selectedMedia}
            onSave={(formulation) => {
              setSelectedMedia(null);
            }}
          />
        )}
        
        {activeSubTab === 'comparison' && (
          <MediaComparisonTool />
        )}
      </div>
    </div>
  );
};

export default BesinYeriPage;
