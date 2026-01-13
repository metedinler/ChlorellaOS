import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, XCircle, Settings, RefreshCw } from 'lucide-react';

/**
 * MODEL DURUM PANELİ
 * - Otomatik simülasyon aktif/pasif
 * - Şu anda işlenen tank
 * - Tarih aralığı
 * - Son simülasyon zamanı
 * - Sonraki simülasyon
 */
const ModelStatusWidget = () => {
  const [status, setStatus] = useState({
    isActive: false,
    currentTank: null,
    dateRange: null,
    lastSimulation: null,
    nextSimulation: null
  });

  useEffect(() => {
    // SimulationWorker durumunu kontrol et
    const checkStatus = () => {
      const workerStatus = JSON.parse(localStorage.getItem('simulationWorker_status') || '{}');
      
      setStatus({
        isActive: workerStatus.isRunning || false,
        currentTank: localStorage.getItem('currentSimulatingTank') || null,
        dateRange: localStorage.getItem('simulationDateRange') || null,
        lastSimulation: workerStatus.lastRun || null,
        nextSimulation: workerStatus.isRunning ? 
          Date.now() + (5 * 60 * 1000) : null  // 5 dakika sonra
      });
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);  // Her 10 saniyede güncelle

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    return `${hours} saat önce`;
  };

  const formatNextTime = (timestamp) => {
    if (!timestamp) return '-';
    const diff = timestamp - Date.now();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds} saniye`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} dakika`;
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg shadow-sm border border-emerald-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Activity className={`w-5 h-5 ${status.isActive ? 'text-emerald-600 animate-pulse' : 'text-gray-400'}`} />
        <h3 className="text-sm font-semibold text-gray-800">Otomatik Simülasyon</h3>
        
        <div className="ml-auto flex items-center gap-2">
          {status.isActive ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Aktif</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Pasif</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white rounded p-2">
          <div className="flex items-center gap-1 text-gray-500 mb-1">
            <Clock className="w-3 h-3" />
            <span className="font-medium">Son Simülasyon</span>
          </div>
          <div className="text-gray-800 font-semibold">
            {formatTime(status.lastSimulation)}
          </div>
        </div>

        <div className="bg-white rounded p-2">
          <div className="flex items-center gap-1 text-gray-500 mb-1">
            <RefreshCw className="w-3 h-3" />
            <span className="font-medium">Sonraki</span>
          </div>
          <div className="text-gray-800 font-semibold">
            {status.isActive ? formatNextTime(status.nextSimulation) : 'Pasif'}
          </div>
        </div>

        {status.currentTank && (
          <div className="col-span-2 bg-emerald-100 rounded p-2 border border-emerald-300">
            <div className="flex items-center gap-1 text-emerald-700 mb-1">
              <Activity className="w-3 h-3" />
              <span className="font-medium">Şu Anda İşleniyor</span>
            </div>
            <div className="text-emerald-900 font-bold">
              Tank: {status.currentTank}
            </div>
            {status.dateRange && (
              <div className="text-emerald-700 text-xs mt-1">
                {status.dateRange}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-emerald-200">
        <div className="text-xs text-gray-600 flex items-center gap-1">
          <Settings className="w-3 h-3" />
          <span>Her 5 dakikada otomatik güncelleme</span>
        </div>
      </div>
    </div>
  );
};

export default ModelStatusWidget;
