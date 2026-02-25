import React, { useMemo, useState } from 'react';
import { BookOpen, AlertTriangle, Beaker, TrendingUp, Droplet, Activity, ChevronDown, ChevronRight, Info, Lightbulb, Calculator } from 'lucide-react';
import { MEDIA_DATABASE } from '../data/mediaDatabase';
import { ensureKnowledgeDatabases, getKnowledgeTopics } from '../utils/knowledgeDatabase';

const mergeTopicsById = (topicsA, topicsB) => {
  const map = new Map();
  (Array.isArray(topicsA) ? topicsA : []).forEach((topic) => {
    if (topic?.id) map.set(topic.id, topic);
  });
  (Array.isArray(topicsB) ? topicsB : []).forEach((topic) => {
    if (topic?.id && !map.has(topic.id)) {
      map.set(topic.id, topic);
    }
  });
  return Array.from(map.values());
};

const LearningCenter = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [customTopics, setCustomTopics] = useState(() => {
    try {
      ensureKnowledgeDatabases();
      const saved = localStorage.getItem('learningCenterTopics');
      const seeded = getKnowledgeTopics();
      if (!saved) return seeded;
      const parsed = JSON.parse(saved);
      return mergeTopicsById(parsed, seeded);
    } catch (error) {
      console.error('LearningCenter başlangıç hatası, seed içerik ile devam ediliyor:', error);
      return Array.isArray(getKnowledgeTopics()) ? getKnowledgeTopics() : [];
    }
  });
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopic, setNewTopic] = useState({ title: '', parentId: '', format: 'markdown', content: '' });
  const [importInput, setImportInput] = useState('');
  const [importFormat, setImportFormat] = useState('markdown');
  const [importFileName, setImportFileName] = useState('');
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editorDraft, setEditorDraft] = useState({ title: '', format: 'markdown', content: '' });

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const persistTopics = (topics) => {
    setCustomTopics(topics);
    try {
      localStorage.setItem('learningCenterTopics', JSON.stringify(topics));
    } catch (error) {
      console.error('learningCenterTopics kaydetme hatası:', error);
      alert('İçerik belleğe kaydedilemedi (localStorage sınırı/erişim sorunu). Sayfa çalışmaya devam ediyor.');
    }
  };

  const updateTopic = (topicId, updates) => {
    const updated = customTopics.map(topic => (topic.id === topicId ? { ...topic, ...updates } : topic));
    persistTopics(updated);
  };

  const resetTopicForm = () => {
    setNewTopic({ title: '', parentId: '', format: 'markdown', content: '' });
  };

  const addTopic = () => {
    const title = (newTopic.title || '').trim();
    const content = (newTopic.content || '').trim();
    if (!title || !content) {
      alert('Konu başlığı ve içerik zorunludur.');
      return;
    }

    const topic = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      parentId: newTopic.parentId || '',
      format: newTopic.format,
      content,
      createdAt: new Date().toISOString()
    };

    const updated = [...customTopics, topic];
    persistTopics(updated);
    setSelectedTopicId(topic.id);
    resetTopicForm();
  };

  const importTopic = () => {
    const content = (importInput || '').trim();
    if (!content) {
      alert('İçe aktarılacak içerik boş olamaz.');
      return;
    }

    const firstLine = content.split('\n').find(line => line.trim()) || 'İçe Aktarılan Konu';
    const derivedTitle = firstLine
      .replace(/^#+\s*/, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 80) || 'İçe Aktarılan Konu';

    const topic = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: derivedTitle,
      parentId: '',
      format: importFormat,
      content,
      createdAt: new Date().toISOString()
    };

    const updated = [...customTopics, topic];
    persistTopics(updated);
    setSelectedTopicId(topic.id);
    setImportInput('');
    setImportFileName('');
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const name = file.name || '';
    const lowerName = name.toLowerCase();
    if (lowerName.endsWith('.html') || lowerName.endsWith('.htm')) {
      setImportFormat('html');
    } else {
      setImportFormat('markdown');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = typeof e.target?.result === 'string' ? e.target.result : '';
      setImportInput(fileContent);
      setImportFileName(name);
    };
    reader.onerror = () => {
      alert('Dosya okunamadı. Lütfen geçerli bir .md veya .html dosyası seçin.');
    };
    reader.readAsText(file);
  };

  const deleteTopic = (topicId) => {
    const children = customTopics.filter(topic => topic.parentId === topicId);
    if (children.length > 0) {
      alert('Alt konusu olan başlık silinemez. Önce alt konuları taşıyın veya silin.');
      return;
    }
    const updated = customTopics.filter(topic => topic.id !== topicId);
    persistTopics(updated);
    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
      setIsEditingTopic(false);
    }
  };

  const startEditingTopic = (topic) => {
    if (!topic) return;
    setEditorDraft({
      title: topic.title || '',
      format: topic.format || 'markdown',
      content: topic.content || ''
    });
    setIsEditingTopic(true);
  };

  const cancelEditingTopic = () => {
    setIsEditingTopic(false);
    setEditorDraft({ title: '', format: 'markdown', content: '' });
  };

  const saveEditedTopic = () => {
    if (!selectedTopicId) return;
    const title = (editorDraft.title || '').trim();
    const content = (editorDraft.content || '').trim();
    if (!title || !content) {
      alert('Başlık ve içerik boş olamaz.');
      return;
    }
    updateTopic(selectedTopicId, {
      title,
      format: editorDraft.format,
      content,
      updatedAt: new Date().toISOString()
    });
    cancelEditingTopic();
  };

  const extractToc = (content, format) => {
    if (!content) return [];

    if (format === 'html') {
      const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
      const headers = [];
      let match;
      let index = 0;
      while ((match = regex.exec(content)) !== null) {
        headers.push({
          id: `html_heading_${index++}`,
          type: 'heading',
          level: Number(match[1]),
          title: (match[2] || '').replace(/<[^>]*>/g, '').trim()
        });
      }
      return headers;
    }

    const lines = content.split('\n');
    const tocItems = [];

    lines.forEach((line, lineIndex) => {
      const headingMatch = line.match(/^\s*(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        tocItems.push({
          id: `md_heading_${lineIndex}`,
          type: 'heading',
          lineIndex,
          level: headingMatch[1].length,
          title: headingMatch[2].trim().replace(/[*_`]+/g, '')
        });
        return;
      }

      const unorderedMatch = line.match(/^(\s*)[-+*]\s+(.+)$/);
      if (unorderedMatch) {
        const indentLevel = Math.floor((unorderedMatch[1] || '').length / 2);
        tocItems.push({
          id: `md_list_u_${lineIndex}`,
          type: 'list',
          lineIndex,
          level: Math.min(6, 2 + indentLevel),
          title: unorderedMatch[2].trim().replace(/[*_`]+/g, '')
        });
        return;
      }

      const orderedMatch = line.match(/^(\s*)(\d+(?:\.\d+)*)(?:\.|\))?\s+(.+)$/);
      if (orderedMatch) {
        const indentLevel = Math.floor((orderedMatch[1] || '').length / 2);
        const numericDepth = (orderedMatch[2] || '').split('.').length;
        tocItems.push({
          id: `md_list_o_${lineIndex}`,
          type: 'list',
          lineIndex,
          level: Math.min(6, 1 + indentLevel + numericDepth),
          title: `${orderedMatch[2]} ${orderedMatch[3].trim()}`.trim().replace(/[*_`]+/g, '')
        });
      }
    });

    return tocItems;
  };

  const topicsById = useMemo(() => {
    return customTopics.reduce((acc, topic) => {
      acc[topic.id] = topic;
      return acc;
    }, {});
  }, [customTopics]);

  const visibleTopicIds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return new Set(customTopics.map(topic => topic.id));

    const matchedIds = customTopics
      .filter(topic => (`${topic.title} ${topic.content}`).toLowerCase().includes(query))
      .map(topic => topic.id);

    const withAncestors = new Set();
    matchedIds.forEach(id => {
      let current = topicsById[id];
      while (current) {
        withAncestors.add(current.id);
        current = current.parentId ? topicsById[current.parentId] : null;
      }
    });

    return withAncestors;
  }, [customTopics, searchQuery, topicsById]);

  const selectedTopic = customTopics.find(topic => topic.id === selectedTopicId) || null;
  const activeTopic = selectedTopic
    ? (isEditingTopic ? { ...selectedTopic, ...editorDraft } : selectedTopic)
    : null;
  const selectedTopicToc = activeTopic ? extractToc(activeTopic.content, activeTopic.format) : [];

  const literatureMediaNotes = useMemo(() => {
    const mediaList = Object.values(MEDIA_DATABASE || {}).filter((media) => media && typeof media === 'object');
    return mediaList.map(media => {
      const alternatives = mediaList
        .filter(candidate => candidate.id !== media.id && candidate.category === media.category)
        .slice(0, 3)
        .map(candidate => candidate.name);

      const references = Array.isArray(media.references)
        ? media.references
        : typeof media.references === 'string' && media.references.trim()
          ? [media.references]
          : [];

      return {
        id: media.id,
        name: media.name,
        category: media.category,
        references,
        alternatives,
        whenToSelect: media.whenToSelect || 'Genel amaçlı kullanım',
        notes: media.preparationNotes || ''
      };
    });
  }, []);

  const removeMarkdownSection = (content, tocItem, tocList) => {
    const lines = content.split('\n');
    if (tocItem.type === 'list') {
      lines.splice(tocItem.lineIndex, 1);
      return lines.join('\n');
    }

    const currentIndex = tocList.findIndex(item => item.id === tocItem.id);
    const currentLevel = tocItem.level;
    let endLine = lines.length;

    for (let i = currentIndex + 1; i < tocList.length; i += 1) {
      const candidate = tocList[i];
      if (candidate.type === 'heading' && candidate.level <= currentLevel) {
        endLine = candidate.lineIndex;
        break;
      }
    }

    lines.splice(tocItem.lineIndex, endLine - tocItem.lineIndex);
    return lines.join('\n').trim();
  };

  const removeHtmlHeadingSection = (content, tocItem) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const headingIndex = Number((tocItem.id || '').split('_').pop());
    const target = Number.isFinite(headingIndex) ? headings[headingIndex] : null;
    if (!target) return content;

    const targetLevel = Number(target.tagName.slice(1));
    let sibling = target.nextSibling;

    while (sibling) {
      const nextNode = sibling.nextSibling;
      if (
        sibling.nodeType === 1
        && /^H[1-6]$/.test(sibling.tagName)
        && Number(sibling.tagName.slice(1)) <= targetLevel
      ) {
        break;
      }
      sibling.parentNode?.removeChild(sibling);
      sibling = nextNode;
    }

    target.parentNode?.removeChild(target);
    return doc.body.innerHTML.trim();
  };

  const removeTopicSection = (tocItem) => {
    if (!activeTopic) return;

    const currentContent = activeTopic.content || '';
    let nextContent = currentContent;

    if (activeTopic.format === 'html') {
      nextContent = removeHtmlHeadingSection(currentContent, tocItem);
    } else {
      nextContent = removeMarkdownSection(currentContent, tocItem, selectedTopicToc);
    }

    if ((nextContent || '').trim() === (currentContent || '').trim()) {
      alert('Silinecek bölüm bulunamadı.');
      return;
    }

    if (isEditingTopic) {
      setEditorDraft(prev => ({ ...prev, content: nextContent }));
    } else if (selectedTopicId) {
      updateTopic(selectedTopicId, { content: nextContent, updatedAt: new Date().toISOString() });
    }
  };

  const renderTopicTree = (parentId = '', depth = 0) => {
    const children = customTopics.filter(topic => (topic.parentId || '') === parentId && visibleTopicIds.has(topic.id));
    if (children.length === 0) return null;

    return children.map(topic => (
      <div key={topic.id}>
        <button
          onClick={() => setSelectedTopicId(topic.id)}
          className={`w-full text-left px-3 py-2 rounded-lg border transition mb-1 ${
            selectedTopicId === topic.id
              ? 'bg-blue-50 border-blue-300 text-blue-800'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${depth * 12}px` }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium truncate">{topic.title}</div>
              <div className="text-xs text-gray-500 uppercase">{topic.format}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {topic.reviewStatus && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {topic.reviewStatus}
                  </span>
                )}
                {topic.trustLevel && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    trust:{topic.trustLevel}
                  </span>
                )}
                {topic.sourceType && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {topic.sourceType}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTopic(topic.id);
              }}
              className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
              title="Konuyu sil"
            >
              Sil
            </button>
          </div>
        </button>
        {renderTopicTree(topic.id, depth + 1)}
      </div>
    ));
  };

  // 16 Risk Senaryosu
  const risks = [
    {
      category: 'Biyolojik Riskler',
      colorClass: {
        title: 'text-red-700',
        icon: 'text-red-600',
        border: 'border-red-500',
        bg: 'bg-red-50'
      },
      items: [
        {
          id: 1,
          name: 'Amonyak Toksisitesi',
          description: 'pH >9 + Üre kullanımında NH₃ serbest kalır ve hücrelere toksik etki gösterir',
          trigger: 'pH yükselmesi + Üre bazlı besiyeri',
          symptoms: ['pH > 9.0', 'Hücre yoğunluğu düşüşü', 'Yeşil renk soluklaşması'],
          solution: 'pH\'yı 7.0-7.5 aralığına çek (HCl ile). Üre yerine nitrat (NaNO₃, KNO₃) kullan.',
          prevention: 'pH izleme + Nitrat bazlı formülasyona geç'
        },
        {
          id: 2,
          name: 'Fotoksidasyon',
          description: 'Aşırı ışık + Düşük hücre yoğunluğu reaktif oksijen türleri (ROS) oluşturur',
          trigger: 'Işık > 10000 lux + Hücre < 5M/mL',
          symptoms: ['Hücreler sarımsı-kahverengi', 'OD680 düşerken OD750 sabit', 'Motilite kaybı'],
          solution: 'Işığı %50 azalt. Vitamin E (5mg/L) veya askorbat (10mg/L) ekle.',
          prevention: 'Başlangıçta 3000-5000 lux, yoğunluk arttıkça 8000 lux\'a çık'
        },
        {
          id: 3,
          name: 'Gece Hipoksisi',
          description: 'Yüksek yoğunlukta (>100M/mL), gece solunumu O₂ tüketir, sabah ölü hücreler bulunur',
          trigger: 'Yoğunluk > 100M/mL + Gece havalandırma yok',
          symptoms: ['Sabah DO < 2 mg/L', 'pH düşmesi (CO₂ birikimi)', 'Hücre lekeli, ölü'],
          solution: 'Gece havalandırmayı %50 düşür ama KAPATMA. DO > 4 mg/L tut.',
          prevention: '24 saat düşük hızda havalandırma (0.1-0.5 vvm)'
        },
        {
          id: 4,
          name: 'Kontaminasyon',
          description: 'Bakteriler, funguslar, protozoa veya diğer algler kültüre bulaşır',
          trigger: 'Sterilizasyon hatası + Açık ortam',
          symptoms: ['Bulanık su', 'Kötü koku', 'Mikroskobik analiz: yabancı organizmalar'],
          solution: 'Kültürü TEHLİKELİ olarak işaretle. Otoklavlayıp at. Tankı %10 bleach ile dezenfekte et.',
          prevention: 'Aseptik teknik + HEPA filtre + Kapalı sistem'
        },
        {
          id: 5,
          name: 'Besin Limitasyonu',
          description: 'Azot (N), fosfor (P) veya demir (Fe) eksikliği büyümeyi durdurur',
          trigger: 'Uzun süre besleme yok + Yüksek yoğunluk',
          symptoms: ['Sarma (N eksikliği)', 'Mor lekeler (P eksikliği)', 'Kloroz (Fe eksikliği)'],
          solution: 'Besin analizi yap (Nitrat, Fosfat, TDS). Eksik besini stok ile tamamla.',
          prevention: 'Haftalık besin takvimi + TDS izleme (800-1200 mg/L)'
        },
        {
          id: 6,
          name: 'pH Dalgalanması',
          description: 'pH < 5.5 veya > 9.5, hücre membran bütünlüğünü bozar',
          trigger: 'CO₂ kesintisi (pH yükselir) veya aşırı CO₂ (pH düşer)',
          symptoms: ['pH < 5.5: Asidik stres', 'pH > 9.5: Amonyak toksisitesi', 'Hücre patlaması'],
          solution: 'pH 7.0-7.5 aralığına getir. CO₂ flow ayarla (0.05-0.2 vvm).',
          prevention: 'Otomatik pH kontrolü + CO₂ regülatörü'
        },
        {
          id: 7,
          name: 'Işık Heterogenitesi',
          description: 'Tankın merkezinde yeterli ışık, kenarlarda az ışık → Eşitsiz büyüme',
          trigger: 'Büyük hacimli tank (>100L) + Tek taraflı aydınlatma',
          symptoms: ['Merkezde yoğun yeşil, kenarlarda soluk', 'OD ölçümleri değişken'],
          solution: 'Karıştırmayı artır. LED panelleri çevre etrafına dağıt.',
          prevention: '360° aydınlatma + Sürekli karıştırma (100-150 rpm)'
        },
        {
          id: 8,
          name: 'Çökelme/Flokülasyon',
          description: 'Zayıf karıştırma → Hücreler dibe çöker → Besin yetersizliği + Işık azalması',
          trigger: 'Karıştırma durdu veya < 50 rpm',
          symptoms: ['Tank dibinde koyu yeşil tabaka', 'Üstte berrak su', 'OD düşüşü'],
          solution: 'Karıştırmayı 100-150 rpm\'e çıkar. Tankı nazikçe eğerek dip çökeltisini dağıt.',
          prevention: 'Sürekli mekanik karıştırma veya havalandırma'
        }
      ]
    },
    {
      category: 'Kimyasal Riskler',
      colorClass: {
        title: 'text-orange-700',
        icon: 'text-orange-600',
        border: 'border-orange-500',
        bg: 'bg-orange-50'
      },
      items: [
        {
          id: 9,
          name: 'Ağır Metal Toksisitesi',
          description: 'Aşırı Cu, Zn, Mn gibi ağır metaller enzim inhibisyonuna neden olur',
          trigger: 'Trace element stoku fazla dozda eklenmiş',
          symptoms: ['Büyüme durması', 'Hücrelerde granül birikimi', 'Klorofil parçalanması'],
          solution: 'Seyreltme yap (1:1 saf su ile). Yeni ortama transfer et (1:10).',
          prevention: 'Trace element stoku dikkatli dozaj (1-2 mL/L)'
        },
        {
          id: 10,
          name: 'Karbon Sınırlaması',
          description: 'CO₂ yetersiz → pH yükselir, büyüme durur (karbon kaynağı yok)',
          trigger: 'CO₂ tüpü boşalmış veya valve kapalı',
          symptoms: ['pH > 8.5-9.0', 'Büyüme platoya ulaşır', 'Hücreler açık yeşil (karbonhidrat az)'],
          solution: 'CO₂ kaynağını kontrol et. 0.1-0.2 vvm CO₂ başlat.',
          prevention: 'CO₂ tüp basıncı haftalık kontrol + Yedek tüp hazır tut'
        },
        {
          id: 11,
          name: 'Osmotik Stres',
          description: 'Aşırı tuzluluk (TDS > 2000 mg/L) hücre büzülmesine yol açar',
          trigger: 'Stok çözeltisi fazla eklendi + Su buharlaşması',
          symptoms: ['Hücreler küçülmüş', 'Membran yapıları bozuk', 'OD680 düşer'],
          solution: 'TDS\'yi 800-1200 mg/L\'ye düşür (1:1 seyreltme). Yeni ortama transfer.',
          prevention: 'TDS metre ile günlük ölçüm + Buharlaşma telafisi'
        },
        {
          id: 12,
          name: 'Vitamin Eksikliği',
          description: 'Uzun süreli kültür (>30 gün), B12 vitamini azalır → Büyüme yavaşlar',
          trigger: 'Vitamin stoku ilk inokulasyonda eklendi, sonra hiç yenilenmedi',
          symptoms: ['Yavaş büyüme (exponential → linear geçiş)', 'Hücre boyutu küçülür'],
          solution: 'Vitamin stoku (B1, B12, Biotin) 2-3 haftada bir yenile (1 mL/L).',
          prevention: 'Vitamin takvimine uy + Her transfer\'de yeni vitamin'
        }
      ]
    },
    {
      category: 'Fiziksel/Operasyonel Riskler',
      colorClass: {
        title: 'text-blue-700',
        icon: 'text-blue-600',
        border: 'border-blue-500',
        bg: 'bg-blue-50'
      },
      items: [
        {
          id: 13,
          name: 'Sıcaklık Şoku',
          description: 'Ani ±5°C değişim, membran akışkanlığını bozar → Hücre patlaması',
          trigger: 'Soğuk su ile seyreltme veya sıcak stok ekleme',
          symptoms: ['Transfer sonrası ani ölüm', 'Hücre debrisler', 'OD680 çöküşü'],
          solution: 'Stok çözeltilerini tank sıcaklığına getir (25°C\'ye kadar beklet). Yavaş transfer.',
          prevention: 'Tüm eklenen sıvılar 20-25°C aralığında olmalı'
        },
        {
          id: 14,
          name: 'Isı Stresi',
          description: '>35°C enzim denatürasyonu, <10°C metabolizma durur',
          trigger: 'Klima arızası veya kış aylarında ısıtma yok',
          symptoms: ['35°C üzeri: Hücreler lizis', '<15°C: Büyüme durdu'],
          solution: '20-30°C aralığına getir. Soğutma: buzlu su banyosu. Isıtma: akvaryum ısıtıcısı.',
          prevention: 'Termostat + Yedek ısıtma/soğutma sistemi'
        },
        {
          id: 15,
          name: 'Mekanik Hasar',
          description: 'Aşırı hızlı karıştırma (>300 rpm) hücre duvarını parçalar',
          trigger: 'Mekanik karıştırıcı yanlış ayarı',
          symptoms: ['Kültür rengi soluklaşır', 'Mikroskopi: parçalanmış hücreler', 'Debris artışı'],
          solution: 'Karıştırmayı 100-150 rpm\'e düşür. Nazik havalandırma ile değiştir.',
          prevention: 'RPM ayarını kontrol et (100-200 rpm optimal)'
        },
        {
          id: 16,
          name: 'Biyofilm Oluşumu',
          description: 'Tank duvarlarında besin-hücre karışımı yapışır → Kontaminasyon + Besin kaybı',
          trigger: 'Tank 60+ gün temizlenmeden kullanılıyor',
          symptoms: ['Duvar yüzeyinde yeşil-kahverengi tabaka', 'TDS tüketimi hızlanır', 'pH düzensiz'],
          solution: 'Tankı boşalt. %10 HCl veya %5 H₂O₂ ile yıka. Saf suyla durula.',
          prevention: 'Her harvest sonrası tank dezenfeksiyonu + 45-60 günde temizlik'
        }
      ]
    }
  ];

  // Analiz Protokolleri (7 metod)
  const analysisProtocols = [
    {
      name: 'Molybdenum Blue (Fosfat - PO₄³⁻)',
      principle: 'Ortofosfat + Molibdat + Asit → Mavi renk kompleksi (880 nm)',
      reagents: [
        'Amonyum Molibdat: (NH₄)₆Mo₇O₂₄ · 4H₂O',
        'Sülfürik Asit: H₂SO₄ (konsantre)',
        'Askorbik Asit: C₆H₈O₆ (indirgeyici)'
      ],
      stockSolution: '10 g (NH₄)₆Mo₇O₂₄ + 100 mL H₂SO₄ (dikkat!) + 1L saf su. Karanlıkta sakla.',
      procedure: [
        '10 mL numune + 1 mL molibdat reagent',
        '1 mL askorbik asit çözeltisi ekle',
        '30 dakika oda sıcaklığında beklet',
        '880 nm\'de absorbans oku',
        'Standart eğri: 0-10 mg/L PO₄³⁻'
      ],
      calibration: 'KH₂PO₄ (136.09 g/mol) ile standart: 0.219 g → 1L (50 mg PO₄³⁻/L stok)'
    },
    {
      name: 'DMAB (Azot - NH₄⁺)',
      principle: 'Amonyum + Salisilik asit + Hipoklorit → İndofenol mavisi (640 nm)',
      reagents: [
        'Salisilik Asit: C₇H₆O₃',
        'Sodyum Hipoklorit: NaOCl (bleach)',
        'DMAB: p-Dimethylaminobenzaldehyde'
      ],
      stockSolution: 'Salisilik: 50 g/L saf su. Hipoklorit: %0.5 NaOCl (bleach 1:10).',
      procedure: [
        '5 mL numune + 0.5 mL salisilik reaktifi',
        '0.5 mL hipoklorit ekle (dikkat: eklediğinde karıştır!)',
        '10 dakika 37°C\'de beklet',
        '640 nm\'de absorbans oku',
        'Standart: (NH₄)₂SO₄ ile 0-5 mg/L NH₄⁺'
      ],
      calibration: '(NH₄)₂SO₄ (132.14 g/mol) ile: 0.382 g → 1L (100 mg NH₄⁺/L stok)'
    },
    {
      name: 'Claude Boyd (Nitrat - NO₃⁻)',
      principle: 'UV absorbans farkı: 220 nm (nitrat) - 275 nm (organik madde düzeltmesi)',
      reagents: ['Sadece saf su (boş referans)'],
      stockSolution: 'Gerek yok (doğrudan ölçüm)',
      procedure: [
        'Numuneyi 0.45 µm filtreden geçir (organik debris kaldır)',
        'Quartiz küvet kullan (UV geçirgenlik)',
        '220 nm absorbans oku (A₂₂₀)',
        '275 nm absorbans oku (A₂₇₅)',
        'Düzeltilmiş Nitrat = A₂₂₀ - (2 × A₂₇₅)',
        'Standart: KNO₃ ile 0-20 mg/L NO₃⁻'
      ],
      calibration: 'KNO₃ (101.10 g/mol) ile: 0.163 g → 1L (100 mg NO₃⁻/L stok)'
    },
    {
      name: 'Lowry (Protein)',
      principle: 'Protein + Cu²⁺ + Folin reagent → Mavi renk (750 nm)',
      reagents: [
        'CuSO₄ · 5H₂O (bakır sülfat)',
        'Na₂CO₃ (karbonat)',
        'Folin-Ciocalteu Reagent (ticari)'
      ],
      stockSolution: 'Copper reagent: 0.5 g CuSO₄ + 1 g Na₂CO₃ + 100 mL saf su',
      procedure: [
        'Hücreleri sonikasyon ile parçala (protein salınımı)',
        '0.5 mL numune + 2.5 mL bakır reaktifi',
        '10 dakika bekle',
        '0.25 mL Folin reaktifi ekle (hızla karıştır!)',
        '30 dakika oda sıcaklığında → 750 nm oku',
        'Standart: BSA (Bovine Serum Albumin) 0-1 mg/mL'
      ],
      calibration: 'BSA (66 kDa) ile standart eğri: 0-100-500-1000 µg/mL'
    },
    {
      name: 'Phenol-Sulfuric Acid (Karbonhidrat)',
      principle: 'Şeker + Fenol + H₂SO₄ → Sarı-turuncu renk (490 nm)',
      reagents: [
        'Fenol: C₆H₅OH (%5 çözelti)',
        'H₂SO₄: Konsantre sülfürik asit (98%)'
      ],
      stockSolution: 'Fenol: 5 g fenol + 100 mL saf su (zehirli! eldiven giy)',
      procedure: [
        '1 mL numune + 1 mL %5 fenol',
        '5 mL konsantre H₂SO₄ YAVAŞÇA ekle (ısınır! dikkat!)',
        '10 dakika buz banyosunda soğut',
        '490 nm\'de absorbans oku',
        'Standart: Glikoz 0-100 µg/mL'
      ],
      calibration: 'D-Glikoz (180.16 g/mol) ile: 0.100 g → 1L (100 mg/L stok)'
    },
    {
      name: 'Parsons & Strickland (Klorofil-a)',
      principle: 'Klorofil + Asetat ekstraksiyonu → 665 nm absorbans',
      reagents: ['Asetat: %90 asetat (CH₃COOH) veya metanol'],
      stockSolution: 'Gerek yok (organik çözücü hazır)',
      procedure: [
        '10 mL kültür → 0.45 µm filtre (membran üzerinde hücreler)',
        'Membranı 10 mL %90 asetat ile ezdir (havanda veya sonikasyon)',
        'Karanlıkta 24 saat 4°C\'de ekstraksiyon',
        'Filtrele → Berrak asetat çözeltisi',
        '665 nm (klorofil-a), 750 nm (debris düzeltmesi) oku',
        'Klorofil-a (mg/L) = 11.0 × (A₆₆₅ - A₇₅₀)'
      ],
      calibration: 'Ticari klorofil-a standardı (Sigma) ile doğrulama'
    },
    {
      name: 'Thoma Lamı Sayımı',
      principle: 'Hemocytometer grid + Mikroskop → Hücre sayısı/mL',
      reagents: ['Sadece kültür (seyreltme gerekiyorsa saf su)'],
      stockSolution: 'Gerek yok',
      procedure: [
        'Kültürü 10x seyrelt (1 mL + 9 mL saf su)',
        'Thoma lamının altına lameli koy (Newton halkaları görünmeli)',
        '10 µL seyreltilmiş kültür → Lam kenarından enjekte et',
        'Mikroskop 400x büyütme → 4 köşe kareyi say (her biri 16 küçük kare)',
        'Ortalama hücre/kare × 10⁴ × seyreltme faktörü = Hücre/mL',
        'Örnek: 25 hücre/kare × 10⁴ × 10 = 2.5 × 10⁶ hücre/mL'
      ],
      calibration: 'Bilinen yoğunluktaki kültür ile doğrulama (OD680 vs Thoma)'
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center mb-2">
          <BookOpen className="w-8 h-8 mr-3" />
          <h1 className="text-3xl font-bold">ChlorellaOS Öğrenme Merkezi</h1>
        </div>
        <p className="text-blue-100">
          Chlorella üretiminde karşılaşabileceğiniz riskleri, analiz protokollerini ve çözüm yollarını öğrenin
        </p>
      </div>

      {/* Tab Sistemi */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => toggleSection('risks')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
              expandedSection === 'risks'
                ? 'bg-red-50 text-red-700 border-b-2 border-red-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Risk Yönetimi (16 Senaryo)
          </button>
          <button
            onClick={() => toggleSection('protocols')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
              expandedSection === 'protocols'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Beaker className="w-5 h-5 mr-2" />
            Analiz Protokolleri (7 Metod)
          </button>
          <button
            onClick={() => toggleSection('authoring')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
              expandedSection === 'authoring'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            İçerik Yazımı & İçe Aktarım
          </button>
          <button
            onClick={() => toggleSection('literature')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center ${
              expandedSection === 'literature'
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Info className="w-5 h-5 mr-2" />
            Literatür & Alternatifler
          </button>
        </div>

        {/* Risk Yönetimi İçeriği */}
        {expandedSection === 'risks' && (
          <div className="p-6">
            {risks.map((category) => (
              <div key={category.category} className="mb-8">
                <h3 className={`text-xl font-bold mb-4 flex items-center ${category.colorClass.title}`}>
                  <Activity className={`w-6 h-6 mr-2 ${category.colorClass.icon}`} />
                  {category.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((risk) => (
                    <div
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedRisk?.id === risk.id
                          ? `${category.colorClass.border} ${category.colorClass.bg}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <AlertTriangle className={`w-5 h-5 mr-2 ${category.colorClass.icon} flex-shrink-0 mt-1`} />
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-1">{risk.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{risk.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Risk Detay Paneli */}
            {selectedRisk && (
              <div className="mt-6 bg-white border-2 border-blue-500 rounded-lg p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <AlertTriangle className="w-7 h-7 mr-2 text-red-600" />
                    {selectedRisk.name}
                  </h3>
                  <button
                    onClick={() => setSelectedRisk(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <Info className="w-4 h-4 mr-1 text-blue-600" />
                      Tanım:
                    </h4>
                    <p className="text-gray-600">{selectedRisk.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <Activity className="w-4 h-4 mr-1 text-orange-600" />
                      Tetikleyici:
                    </h4>
                    <p className="text-gray-600 bg-orange-50 p-2 rounded">{selectedRisk.trigger}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1 text-red-600" />
                      Belirtiler:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 bg-red-50 p-3 rounded">
                      {(Array.isArray(selectedRisk.symptoms) ? selectedRisk.symptoms : []).map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
                      Çözüm:
                    </h4>
                    <p className="text-gray-600 bg-green-50 p-3 rounded font-medium">{selectedRisk.solution}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                      Önleme:
                    </h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded">{selectedRisk.prevention}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analiz Protokolleri İçeriği */}
        {expandedSection === 'protocols' && (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {analysisProtocols.map((protocol, idx) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                    <Beaker className="w-6 h-6 mr-2 text-blue-600" />
                    {protocol.name}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Prensip:</h4>
                      <p className="text-gray-600 bg-blue-50 p-2 rounded">{protocol.principle}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Reaktifler:</h4>
                      <ul className="list-disc list-inside text-gray-600">
                        {protocol.reagents.map((reagent, ridx) => (
                          <li key={ridx}>{reagent}</li>
                        ))}
                      </ul>
                    </div>

                    {protocol.stockSolution && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                          <Beaker className="w-4 h-4 mr-1 text-purple-600" />
                          Stok Çözelti Hazırlama:
                        </h4>
                        <p className="text-gray-600 bg-purple-50 p-2 rounded font-mono text-sm">
                          {protocol.stockSolution}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1 flex items-center">
                        <Calculator className="w-4 h-4 mr-1 text-green-600" />
                        Prosedür:
                      </h4>
                      <ol className="list-decimal list-inside text-gray-600 space-y-1">
                        {protocol.procedure.map((step, sidx) => (
                          <li key={sidx} className="bg-gray-50 p-2 rounded">{step}</li>
                        ))}
                      </ol>
                    </div>

                    {protocol.calibration && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-1">Kalibrasyon:</h4>
                        <p className="text-gray-600 bg-yellow-50 p-2 rounded font-mono text-sm">
                          {protocol.calibration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedSection === 'authoring' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Konu Arama & Hiyerarşi</h3>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg mb-3"
                    placeholder="Konu veya içerikte ara..."
                  />
                  <div className="max-h-96 overflow-auto pr-1 space-y-1">
                    {customTopics.length === 0 ? (
                      <p className="text-sm text-gray-500">Henüz kullanıcı içeriği yok.</p>
                    ) : (
                      renderTopicTree()
                    )}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Yeni Konu Yaz</h3>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Konu başlığı"
                    />
                    <select
                      value={newTopic.parentId}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, parentId: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Ana başlık</option>
                      {customTopics.map(topic => (
                        <option key={topic.id} value={topic.id}>{topic.title}</option>
                      ))}
                    </select>
                    <select
                      value={newTopic.format}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, format: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="markdown">Markdown</option>
                      <option value="html">HTML</option>
                    </select>
                    <textarea
                      value={newTopic.content}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                      rows={7}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="# Başlık\n## Alt Başlık\nİçerik..."
                    />
                    <button
                      onClick={addTopic}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Konuyu Kaydet
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">Markdown/HTML İçe Aktar</h3>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".md,.markdown,.txt,.html,.htm,text/markdown,text/html,text/plain"
                      onChange={handleImportFile}
                      className="w-full text-sm"
                    />
                    {importFileName && (
                      <div className="text-xs text-gray-500">
                        Seçili dosya: <span className="font-medium text-gray-700">{importFileName}</span>
                      </div>
                    )}
                    <select
                      value={importFormat}
                      onChange={(e) => setImportFormat(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="markdown">Markdown</option>
                      <option value="html">HTML</option>
                    </select>
                    <textarea
                      value={importInput}
                      onChange={(e) => setImportInput(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="# Ana Başlık\n## Alt Başlık\n- Madde\n+ Madde\n1. Numara\n1.2 Alt numara"
                    />
                    <p className="text-xs text-gray-500">
                      Desteklenen alt başlık/madde formatları: <strong>#</strong>, <strong>##</strong>, <strong>-</strong>, <strong>+</strong>, <strong>1.</strong>, <strong>1.2</strong>.
                    </p>
                    <button
                      onClick={importTopic}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Dosyayı/Metni İçe Aktar
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="bg-white border rounded-lg p-5 min-h-[650px]">
                  {!selectedTopic ? (
                    <div className="h-full flex items-center justify-center text-gray-500 text-center">
                      <div>
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>Soldan bir konu seçerek içeriği görüntüleyin.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {isEditingTopic ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editorDraft.title}
                                onChange={(e) => setEditorDraft(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border rounded-lg text-xl font-bold"
                                placeholder="Konu başlığı"
                              />
                              <select
                                value={editorDraft.format}
                                onChange={(e) => setEditorDraft(prev => ({ ...prev, format: e.target.value }))}
                                className="px-3 py-2 border rounded-lg text-sm"
                              >
                                <option value="markdown">Markdown</option>
                                <option value="html">HTML</option>
                              </select>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-2xl font-bold text-gray-800">{activeTopic.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Format: {activeTopic.format.toUpperCase()} {activeTopic.parentId ? '• Alt konu' : '• Ana konu'}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {activeTopic.reviewStatus && (
                                  <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
                                    Review: {activeTopic.reviewStatus}
                                  </span>
                                )}
                                {activeTopic.trustLevel && (
                                  <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                                    Trust: {activeTopic.trustLevel}
                                  </span>
                                )}
                                {activeTopic.sourceType && (
                                  <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                    Source: {activeTopic.sourceType}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditingTopic ? (
                            <>
                              <button
                                onClick={saveEditedTopic}
                                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                              >
                                Kaydet
                              </button>
                              <button
                                onClick={cancelEditingTopic}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                              >
                                İptal
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditingTopic(selectedTopic)}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              Düzenle
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-2">İçindekiler (TOC)</h4>
                        {selectedTopicToc.length === 0 ? (
                          <p className="text-sm text-gray-500">Başlık yapısı bulunamadı.</p>
                        ) : (
                          <ul className="space-y-1 text-sm text-gray-700">
                            {selectedTopicToc.map((item) => (
                              <li key={item.id} style={{ marginLeft: `${(item.level - 1) * 12}px` }} className="flex items-center justify-between gap-2">
                                <span className="truncate">• {item.title}</span>
                                <button
                                  onClick={() => removeTopicSection(item)}
                                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 flex-shrink-0"
                                  title="Bu bölümü sil"
                                >
                                  Bölümü Sil
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">{isEditingTopic ? 'İçerik Editörü' : 'İçerik Önizleme'}</h4>
                        {isEditingTopic ? (
                          <textarea
                            value={editorDraft.content}
                            onChange={(e) => setEditorDraft(prev => ({ ...prev, content: e.target.value }))}
                            rows={18}
                            className="w-full border rounded-lg p-4 bg-white text-gray-700 text-sm font-sans"
                            placeholder="Markdown veya HTML içeriğinizi düzenleyin..."
                          />
                        ) : activeTopic.format === 'html' ? (
                          <div
                            className="prose max-w-none border rounded-lg p-4 bg-white"
                            dangerouslySetInnerHTML={{ __html: activeTopic.content }}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap border rounded-lg p-4 bg-gray-50 text-gray-700 text-sm font-sans">
                            {activeTopic.content}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {expandedSection === 'literature' && (
          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-amber-900 mb-1">Literatür Tabanlı Besin Yeri Notları</h3>
              <p className="text-sm text-amber-800">
                Her besin yeri için literatürde geçen referanslar ve aynı kategoride kullanılabilecek alternatifler listelenir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {literatureMediaNotes.map(item => (
                <div key={item.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase">{item.category}</span>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Ne zaman seçilir:</span> {item.whenToSelect}
                  </p>

                  {item.alternatives.length > 0 && (
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Alternatifler:</span> {item.alternatives.join(', ')}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-xs text-gray-600 mb-2">Hazırlama notu: {item.notes}</p>
                  )}

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">Literatür Referansları</div>
                    {item.references.length > 0 ? (
                      <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                        {item.references.map((ref, idx) => (
                          <li key={`${item.id}_ref_${idx}`}>{ref}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">Referans girilmemiş.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Başlangıç Mesajı */}
        {!expandedSection && (
          <div className="p-12 text-center text-gray-500">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Üstteki sekmelere tıklayarak öğrenmeye başlayın</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => toggleSection('risks')}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Risk Senaryoları
              </button>
              <button
                onClick={() => toggleSection('protocols')}
                className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
              >
                <Beaker className="w-5 h-5 mr-2" />
                Analiz Metotları
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningCenter;
