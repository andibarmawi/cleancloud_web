import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../../services/sortirPublicService';

const PhotoModal = ({ photo, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!photo) return null;

  const imageUrl = getImageUrl(photo.photo_path);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition z-10 p-2"
        aria-label="Tutup"
      >
        <FaTimes size={28} />
      </button>

      {/* Photo Container */}
      <div 
        className="max-w-5xl max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Foto sortir #${photo.photo_id}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        <div 
          className={`${imageUrl ? 'hidden' : 'flex'} w-full h-64 items-center justify-center bg-gray-800 rounded-lg`}
        >
          <p className="text-gray-400">Gambar tidak tersedia</p>
        </div>
        
        {/* Photo Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 rounded-b-lg">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm opacity-80">Foto #{photo.photo_id}</p>
              {photo.created_at && (
                <p className="text-xs opacity-60 mt-1">
                  {formatDate(photo.created_at)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;