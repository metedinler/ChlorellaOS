import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, PieChart, TrendingUp, Droplet, Thermometer, Wind } from 'lucide-react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * STATİSTİKS GRAPHS - GÜNLÜK TREND GRAFİKLERİ
 * =============================================
 * TankDetails'ten gelen günlük parametreleri grafikleştirir:
 * - pH trendi (tank bazlı)
 * - Sıcaklık trendi
 * - Çözünmüş O2 trendi
 * - İletkenlik trendi
 * - Hücre yoğunluğu (CellCountingV2'den)
 */
const StatisticsGraphs = ({ tankId }) => {
  const [selectedGraph, setSelectedGraph] = useState('ph');
  const [selectedTank, setSelectedTank] = useState(tankId || '');
  const [activeTanks, setActiveTanks] = useState([]);
  const [graphData, setGraphData] = useState({
    ph: [],
    temperature: [],
    dissolvedO2: [],
    conductivity: [],
    tds: [],
    od: [],
    cellDensity: []
  });

  // Tank listesini yükle
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setActiveTanks(active);
      if (active.length > 0 && !selectedTank) {
        setSelectedTank(active[0].id);
      }
    }
  }, []);

  // Graf verilerini yükle
  useEffect(() => {
    if (!selectedTank) return;

    try {
      const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
      const tankData = tankDetails[selectedTank];

      if (!tankData) {
        setGraphData({ ph: [], temperature: [], dissolvedO2: [], conductivity: [], cellDensity: [] });
        return;
      }

      // Kalite parametreleri (pH, sıcaklık, DO, iletkenlik)
      const qualityParams = tankData.qualityParams || [];
      const phData = qualityParams.map((param, idx) => ({
        index: idx + 1,
        date: new Date(param.date).toLocaleDateString('tr-TR'),
        value: parseFloat(param.ph),
        timestamp: new Date(param.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      const tempData = qualityParams.map((param, idx) => ({
        index: idx + 1,
        date: new Date(param.date).toLocaleDateString('tr-TR'),
        value: parseFloat(param.temp),
        timestamp: new Date(param.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      const doData = qualityParams.map((param, idx) => ({
        index: idx + 1,
        date: new Date(param.date).toLocaleDateString('tr-TR'),
        value: parseFloat(param.do),
        timestamp: new Date(param.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      const conductivityData = qualityParams.map((param, idx) => ({
        index: idx + 1,
        date: new Date(param.date).toLocaleDateString('tr-TR'),
        value: parseFloat(param.conductivity),
        timestamp: new Date(param.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      // TDS verisi
      const tdsData = qualityParams.map((param, idx) => ({
        index: idx + 1,
        date: new Date(param.date).toLocaleDateString('tr-TR'),
        value: parseFloat(param.tds || param.conductivity * 640), // TDS = İletkenlik * 640 (yaklaşık)
        timestamp: new Date(param.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      // OD değerleri (Spektrofotometre verileri)
      const odMeasurements = JSON.parse(localStorage.getItem('odMeasurements') || '[]');
      const tankOD = odMeasurements.filter(m => m.tankId === selectedTank);
      const odData = tankOD.map((measurement, idx) => ({
        index: idx + 1,
        date: new Date(measurement.date).toLocaleDateString('tr-TR'),
        value: parseFloat(measurement.od || measurement.absorbance),
        wavelength: measurement.wavelength,
        timestamp: new Date(measurement.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      // Hücre yoğunluğu
      const cellCounts = tankData.cellCounts || [];
      const cellDensityData = cellCounts.map((count, idx) => ({
        index: idx + 1,
        date: new Date(count.date).toLocaleDateString('tr-TR'),
        value: count.cellsPerMl / 1e6, // Million cells/ml
        viability: count.viability,
        timestamp: new Date(count.date).getTime()
      })).sort((a, b) => a.timestamp - b.timestamp);

      setGraphData({
        ph: phData,
        temperature: tempData,
        dissolvedO2: doData,
        conductivity: conductivityData,
        tds: tdsData,
        od: odData,
        cellDensity: cellDensityData
      });

    } catch (error) {
      console.error('Graf verisi yükleme hatası:', error);
    }
  }, [selectedTank]);

  const graphTypes = [
    { id: 'ph', label: 'pH Trendi', icon: Droplet, color: '#3b82f6', unit: 'pH' },
    { id: 'temperature', label: 'Sıcaklık', icon: Thermometer, color: '#ef4444', unit: '°C' },
    { id: 'dissolvedO2', label: 'Çözünmüş O₂', icon: Wind, color: '#10b981', unit: 'mg/L' },
    { id: 'conductivity', label: 'İletkenlik', icon: BarChart3, color: '#f59e0b', unit: 'mS/cm' },
    { id: 'tds', label: 'TDS', icon: BarChart3, color: '#06b6d4', unit: 'ppm' },
    { id: 'od', label: 'OD Değerleri', icon: TrendingUp, color: '#a855f7', unit: 'OD' },
    { id: 'cellDensity', label: 'Hücre Yoğunluğu', icon: TrendingUp, color: '#8b5cf6', unit: 'M cells/ml' }
  ];

  const currentGraph = graphTypes.find(g => g.id === selectedGraph);
  const currentData = graphData[selectedGraph] || [];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">;
      {/* Başlık ve Tank Seçici */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Günlük Trend Grafikleri</h2>
        </div>

        <select
          value={selectedTank}
          onChange={(e) => setSelectedTank(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 font-semibold"
        >
          <option value="">Tank seçin...</option>
          {activeTanks.map(tank => (
            <option key={tank.id} value={tank.id}>
              {tank.id}{tank.series ? ` - Seri#${tank.series}` : ''} - {tank.formulationName || tank.medium || 'Besin yok'}{tank.customName ? ` - ${tank.customName}` : ''} ({tank.volume}L - {tank.category})
            </option>
          ))}
        </select>
      </div>

      {/* Graf Seçimi */}
      <div className="flex flex-wrap gap-2 mb-6">
        {graphTypes.map(graph => {
          const Icon = graph.icon;
          return (
            <button 
              key={graph.id}
              onClick={() => setSelectedGraph(graph.id)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                selectedGraph === graph.id 
                  ? 'text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedGraph === graph.id ? { backgroundColor: graph.color } : {}}
            >
              <Icon className="w-5 h-5" />
              {graph.label}
            </button>
          );
        })}
      </div>

      {/* Graf */}
      {selectedTank && currentData.length > 0 ? (
        <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-gray-50 to-blue-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {currentGraph?.label} - {activeTanks.find(t => t.id === selectedTank)?.customName || selectedTank}
          </h3>

          <ResponsiveContainer width="100%" height={400}>
            <RechartsLine data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                label={{ value: 'Tarih', position: 'insideBottom', offset: -5 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: currentGraph?.unit, angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={currentGraph?.color} 
                strokeWidth={3} 
                name={currentGraph?.label}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
              {selectedGraph === 'cellDensity' && (
                <Line 
                  type="monotone" 
                  dataKey="viability" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  name="Canlılık (%)"
                  strokeDasharray="5 5"
                />
              )}
            </RechartsLine>
          </ResponsiveContainer>

          {/* İstatistikler */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold" style={{ color: currentGraph?.color }}>
                {currentData.length}
              </div>
              <div className="text-sm text-gray-600">Ölçüm Sayısı</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-green-600">
                {currentData.length > 0 ? Math.max(...currentData.map(d => d.value)).toFixed(2) : '-'}
              </div>
              <div className="text-sm text-gray-600">Maksimum</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-blue-600">
                {currentData.length > 0 
                  ? (currentData.reduce((sum, d) => sum + d.value, 0) / currentData.length).toFixed(2)
                  : '-'}
              </div>
              <div className="text-sm text-gray-600">Ortalama</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <div className="text-2xl font-bold text-red-600">
                {currentData.length > 0 ? Math.min(...currentData.map(d => d.value)).toFixed(2) : '-'}
              </div>
              <div className="text-sm text-gray-600">Minimum</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-emerald-50 to-cyan-50 text-center">
          <LineChart className="w-24 h-24 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">
            {selectedTank ? 'Henüz veri girilmedi' : 'Tank seçin'}
          </h3>
          <p className="text-gray-600 mt-2">
            {selectedTank 
              ? 'Tank Detay sayfasından parametre girin veya Hücre Sayım yapın'
              : 'Grafikleri görüntülemek için bir tank seçin'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatisticsGraphs;
