import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FaExclamationCircle,
  FaWhatsapp,
  FaPhone,
  FaRedo,
  FaCamera
} from 'react-icons/fa';
import { fetchSortirAwal } from '../services/sortirPublicService';
import SortirSummary from '../components/sortir/SortirSummary';
import PhotoGrid from '../components/sortir/PhotoGrid';
import PhotoModal from '../components/sortir/PhotoModal';

const SortirAwalPublic = () => {
  const [searchParams] = useSearchParams();
  const idProduksi = searchParams.get('id') || '';

  const [fetchError, setFetchError] = useState(null);
  const [data, setData] = useState(null);
  const [fetchComplete, setFetchComplete] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Derived state
  const hasId = !!idProduksi;
  const error = !hasId ? 'ID Produksi tidak ditemukan di URL' : fetchError;
  const loading = !fetchComplete;

  useEffect(() => {
    if (!idProduksi) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      const result = await fetchSortirAwal(idProduksi);

      if (cancelled) return;

      if (result.success) {
        setData(result.data);
        setFetchError(null);
      } else {
        setFetchError(result.message || 'Gagal memuat data');
      }
      
      setFetchComplete(true);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [idProduksi]);

  // ✅ Safety: pastikan sortirData selalu array
  const pelanggan = data?.pelanggan || {};
  const sortirData = data?.sortir_awal || [];

  // ========================================
  // LOADING STATE
  // ========================================
  if (loading && hasId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Memuat Data</h2>
          <p className="text-gray-600">Mengambil data sortir awal...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR STATE
  // ========================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition flex items-center justify-center"
            >
              <FaRedo className="mr-2" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // EMPTY STATE
  // ========================================
  if (sortirData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Sortir Awal</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCamera className="text-gray-400 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Foto</h2>
            <p className="text-gray-600">Proses sortir awal belum dimulai atau belum ada foto yang diambil.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Sortir Awal</h1>
          {pelanggan?.nama_pelanggan && (
            <p className="text-sm text-gray-600 mt-1">👋 Halo, {pelanggan.nama_pelanggan}!</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-gray-600">
            Pakaian Anda sudah kami sortir dan catat sebelum proses pencucian.
          </p>
        </div>

        <div className="mb-8">
          <SortirSummary sortirData={sortirData} />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">📸 Foto Pakaian Anda</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {sortirData.length} foto
            </span>
          </div>

          <PhotoGrid photos={sortirData} onPhotoClick={setSelectedPhoto} />

          {sortirData.length > 0 && (
            <p className="text-xs text-gray-400 text-center mt-6">
              👆 Ketuk foto untuk melihat lebih jelas
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">💬 Ada yang Tidak Sesuai?</h3>
          <p className="text-gray-600 mb-4">
            Jika jumlah item berbeda dengan yang Anda serahkan, segera hubungi kami.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-xl transition flex items-center justify-center"
            >
              <FaWhatsapp className="mr-2" /> Chat WhatsApp
            </a>
            <a
              href="tel:081234567890"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition flex items-center justify-center"
            >
              <FaPhone className="mr-2" /> Telepon
            </a>
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}

      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            Terima kasih sudah mempercayakan pakaianmu ke Sangkuriang Laundry 💙
          </p>
        </div>
      </div>
    </div>
  );
};

export default SortirAwalPublic;