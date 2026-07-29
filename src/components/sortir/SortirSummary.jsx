import React from 'react';
import { FaCamera, FaBox, FaClock, FaCheckCircle } from 'react-icons/fa';

const SortirSummary = ({ sortirData }) => {
  const totalPhotos = sortirData?.length || 0;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ambil waktu dari foto terbaru
  const latestPhoto = sortirData?.[sortirData.length - 1];
  const sortirTime = latestPhoto?.created_at || null;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FaCamera className="mr-2" />
          Hasil Sortir Awal
        </h3>
        <span className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">
          <FaCheckCircle className="mr-1" />
          Selesai
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{totalPhotos}</p>
              <p className="text-xs opacity-80">Foto Diambil</p>
            </div>
            <FaCamera className="text-2xl opacity-50" />
          </div>
        </div>

        <div className="bg-white bg-opacity-15 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{totalPhotos}</p>
              <p className="text-xs opacity-80">Item Tercatat</p>
            </div>
            <FaBox className="text-2xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Time Info */}
      {sortirTime && (
        <div className="flex items-center text-sm opacity-80">
          <FaClock className="mr-2" />
          <span>Disortir: {formatDate(sortirTime)}</span>
        </div>
      )}
    </div>
  );
};

export default SortirSummary;