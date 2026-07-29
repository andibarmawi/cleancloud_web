import React, { useState } from 'react';
import { getImageUrl } from '../../services/sortirPublicService';

const PhotoCard = ({ photo, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  const imageUrl = getImageUrl(photo?.photo_path);

  // Debug: log URL di console
  console.log(`📸 Photo #${photo?.photo_id}:`, {
    photo_path: photo?.photo_path,
    imageUrl: imageUrl
  });

  return (
    <div
      onClick={() => onClick(photo)}
      className="group cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
    >
      {/* Photo Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imgError && imageUrl ? (
          <>
            {/* Loading placeholder */}
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <img
              src={imageUrl}
              alt={`Foto #${photo.photo_id}`}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => {
                console.log(`✅ Photo #${photo.photo_id} loaded successfully`);
                setImgLoaded(true);
              }}
              onError={() => {
                console.error(`❌ Photo #${photo.photo_id} failed to load:`, imageUrl);
                setImgError(true);
              }}
              // ✅ Tambahkan crossOrigin untuk MinIO
              crossOrigin="anonymous"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-400 text-center">
              {imgError ? 'Gagal memuat' : 'Tidak ada gambar'}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3 shadow-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Foto #{photo.photo_id}
            </p>
            {photo.created_at && (
              <p className="text-xs text-gray-500 mt-0.5">
                {timeAgo(photo.created_at)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;