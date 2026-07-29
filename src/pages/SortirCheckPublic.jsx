import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaExclamationCircle, FaRedo, FaCamera, FaExchangeAlt } from 'react-icons/fa';
import { fetchSortirAwal, fetchSortirAkhir } from '../services/sortirPublicService';
import SortirSummary from '../components/sortir/SortirSummary';
import SortirAkhirSummary from '../components/sortir/SortirAkhirSummary';
import PhotoGrid from '../components/sortir/PhotoGrid';
import SortirAkhirList from '../components/sortir/SortirAkhirList';
import PhotoModal from '../components/sortir/PhotoModal';

const TABS = { AWAL: 'awal', AKHIR: 'akhir' };

const SortirCheckPublic = () => {
  const [searchParams] = useSearchParams();
  const idProduksi = searchParams.get('id') || '';

  const [activeTab, setActiveTab] = useState(TABS.AWAL);
  const [fetchError, setFetchError] = useState(null);
  const [dataAwal, setDataAwal] = useState(null);
  const [dataAkhir, setDataAkhir] = useState(null);
  const [summaryAkhir, setSummaryAkhir] = useState(null); // ✅ State untuk summary
  const [fetchComplete, setFetchComplete] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const hasId = !!idProduksi;
  const error = !hasId ? 'ID Produksi tidak ditemukan di URL' : fetchError;
  const loading = !fetchComplete;

  useEffect(() => {
    if (!idProduksi) return;
    let cancelled = false;

    const loadAll = async () => {
      try {
        const [resultAwal, resultAkhir] = await Promise.all([
          fetchSortirAwal(idProduksi),
          fetchSortirAkhir(idProduksi)
        ]);

        if (cancelled) return;

        if (resultAwal?.success) {
          setDataAwal(resultAwal.data);
        }

        if (resultAkhir?.success) {
          setDataAkhir(resultAkhir.data);
          // ✅ Set summary dari response baru
          setSummaryAkhir(resultAkhir.data?.summary || null);
        }

        setFetchComplete(true);
      } catch (err) {
        if (!cancelled) {
          setFetchError(err.message);
          setFetchComplete(true);
        }
      }
    };

    loadAll();
    return () => { cancelled = true; };
  }, [idProduksi]);

  const pelanggan = dataAwal?.pelanggan || {};
  const sortirDataAwal = dataAwal?.sortir_awal || [];
  const sortirDataAkhir = dataAkhir?.sortir_akhir || [];

  const hasSortirAwal = sortirDataAwal.length > 0;
  const hasSortirAkhir = sortirDataAkhir.length > 0;

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
          <p className="text-gray-600">Mengambil data sortir...</p>
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
            <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition flex items-center justify-center">
              <FaRedo className="mr-2" /> Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // EMPTY STATE (keduanya kosong)
  // ========================================
  if (!hasSortirAwal && !hasSortirAkhir) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Sortir</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <FaCamera className="text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Data</h2>
            <p className="text-gray-600">Proses sortir belum dimulai.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Cek Sortir</h1>
          {pelanggan?.nama_pelanggan && (
            <p className="text-sm text-gray-600 mt-1">👋 Halo, {pelanggan.nama_pelanggan}!</p>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab(TABS.AWAL)}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === TABS.AWAL
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaCamera className="mr-2" />
              Sortir Awal
              {hasSortirAwal && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {sortirDataAwal.length}
                </span>
              )}
            </button>

            {/* ✅ Tab Sortir Akhir - SELALU TAMPIL (tidak disabled) */}
            <button
              onClick={() => setActiveTab(TABS.AKHIR)}
              className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === TABS.AKHIR
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaExchangeAlt className="mr-2" />
              Sortir Akhir
              {hasSortirAkhir ? (
                <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                  {sortirDataAkhir.length}
                </span>
              ) : (
                <span className="ml-2 text-xs text-gray-400">(belum tersedia)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* TAB: SORTIR AWAL */}
        {activeTab === TABS.AWAL && (
          <>
            <div className="mb-8">
              <p className="text-gray-600">Pakaian Anda sudah kami sortir dan catat sebelum proses pencucian.</p>
            </div>

            {hasSortirAwal ? (
              <>
                <div className="mb-8">
                  <SortirSummary sortirData={sortirDataAwal} />
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">📸 Foto Pakaian Anda</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{sortirDataAwal.length} foto</span>
                  </div>
                  <PhotoGrid photos={sortirDataAwal} onPhotoClick={setSelectedPhoto} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <FaCamera className="text-gray-400 text-5xl mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Foto Sortir Awal</h2>
                <p className="text-gray-600">Proses sortir awal belum dimulai.</p>
              </div>
            )}
          </>
        )}

         {/* TAB: SORTIR AKHIR */}
        {activeTab === TABS.AKHIR && (
          <>
            <div className="mb-8">
              <p className="text-gray-600">Hasil pencocokan sortir akhir dengan sortir awal setelah pencucian.</p>
            </div>

            {hasSortirAkhir ? (
              <>
                <div className="mb-8">
                  {/* ✅ Kirim summary, bukan sortirData */}
                  <SortirAkhirSummary summary={summaryAkhir} />
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">🔍 Hasil Pencocokan</h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sortirDataAkhir.length} item
                    </span>
                  </div>
                  <SortirAkhirList matches={sortirDataAkhir} />
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                <FaExchangeAlt className="text-gray-400 text-5xl mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Hasil Sortir Akhir</h2>
                <p className="text-gray-600">Proses sortir akhir belum selesai. Silakan cek kembali nanti.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
      )}

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">Terima kasih sudah mempercayakan pakaianmu ke Sangkuriang Laundry 💙</p>
        </div>
      </div>
    </div>
  );
};

export default SortirCheckPublic;