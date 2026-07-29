import React from 'react';
import { FaExchangeAlt, FaCheckCircle, FaClock, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const SortirAkhirSummary = ({ summary }) => {
  // ✅ Jika tidak ada summary, jangan render apa-apa
  if (!summary) return null;

  const total = summary.total_sortir_akhir || 0;
  const matched = summary.total_matched || 0;
  const unmatched = summary.total_unmatched || 0;
  const progress = summary.progress_percent || 0;
  const isComplete = summary.is_fully_completed;

  // Warna dinamis berdasarkan progress
  const progressColor = isComplete ? 'from-green-500 to-green-600' :
    progress >= 70 ? 'from-blue-500 to-blue-600' :
    progress >= 40 ? 'from-orange-500 to-orange-600' :
    'from-red-500 to-red-600';

  return (
    <div className={`bg-gradient-to-br ${progressColor} rounded-2xl shadow-xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FaExchangeAlt className="mr-2" />
          Hasil Sortir Akhir
        </h3>
        <span className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
          {isComplete ? (
            <><FaCheckCircle className="mr-1" /> Selesai</>
          ) : (
            <><FaHourglassHalf className="mr-1 animate-pulse" /> {progress.toFixed(0)}%</>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full h-3 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs opacity-70">
          <span>0%</span>
          <span className="font-bold">{progress.toFixed(0)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{total}</p>
          <p className="text-xs opacity-80">Total</p>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{matched}</p>
          <p className="text-xs opacity-80">Match ✅</p>
        </div>
        <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{unmatched}</p>
          <p className="text-xs opacity-80">Belum ⏳</p>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && (
        <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
          <p className="text-sm font-semibold">🎉 Semua pakaian sudah cocok!</p>
        </div>
      )}
    </div>
  );
};

export default SortirAkhirSummary;