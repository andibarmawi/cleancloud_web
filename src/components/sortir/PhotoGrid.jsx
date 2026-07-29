import React from 'react';
import PhotoCard from './PhotoCard';
import { FaCamera } from 'react-icons/fa';

const PhotoGrid = ({ photos, onPhotoClick }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-300 mb-4">
          <FaCamera className="mx-auto text-5xl" />
        </div>
        <p className="text-gray-500">Belum ada foto sortir</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <PhotoCard
          key={photo.photo_id}
          photo={photo}
          onClick={onPhotoClick}
        />
      ))}
    </div>
  );
};

export default PhotoGrid;