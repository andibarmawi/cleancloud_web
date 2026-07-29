import React from 'react';
import { getImageUrl } from '../../services/sortirPublicService';

const SortirAkhirList = ({ matches }) => {
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Belum ada hasil pencocokan
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match, index) => (
        <div key={match.sortir_akhir_photo_id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">
              Item #{match.sortir_akhir_photo_id}
            </span>
            <StatusBadge status={match.status} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Foto Awal */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Sortir Awal</p>
              {match.photo_awal ? (
                <img
                  src={getImageUrl(match.photo_awal)}
                  alt="Sortir Awal"
                  className="w-full h-32 object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Belum ada</span>
                </div>
              )}
            </div>

            {/* Foto Akhir */}
            <div>
              <p className="text-xs text-gray-500 mb-1">Sortir Akhir</p>
              {match.photo_akhir ? (
                <img
                  src={getImageUrl(match.photo_akhir)}
                  alt="Sortir Akhir"
                  className="w-full h-32 object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Tidak tersedia</span>
                </div>
              )}
            </div>
          </div>

          {match.similarity_score != null && (
            <div className="mt-3 flex items-center text-xs text-gray-500">
              <span>Kecocokan: </span>
              <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(match.similarity_score * 100).toFixed(0)}%` }}
                />
              </div>
              <span className="ml-2 font-semibold">{(match.similarity_score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    'MATCHED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Match ✅' },
    'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending ⏳' },
    'NEED_CONFIRMATION': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Review 🔍' },
    'NO_MATCH': { bg: 'bg-red-100', text: 'text-red-700', label: 'No Match ❌' },
  };

  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
};

export default SortirAkhirList;