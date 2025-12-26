import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FaBuilding, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaFileInvoice,
  FaUser, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaCalendarAlt,
  FaClock,
  FaArrowLeft,
  FaSpinner,
  FaFilter,
  FaSortAmountDown,
  FaChartLine,
  FaHistory,
  FaWallet,
  FaBell,
  FaPercentage,
  FaCalculator,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaWhatsapp,
  FaMoneyBill,  // Icon untuk pencairan dana
  FaExchangeAlt  // Tetap dipertahankan untuk consistency
} from 'react-icons/fa';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Wrapper component untuk proteksi route
const KosanOwnerDashboardWrapper = () => {
  const { kosanId } = useParams();
  
  return (
    <ProtectedRoute requiredRole="mitra_owner" requiredKosanId={kosanId}>
      <KosanOwnerDashboard />
    </ProtectedRoute>
  );
};

// Main Dashboard Component
const KosanOwnerDashboard = () => {
  const { kosanId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState({
    data: {
      kosan: {},
      items: []
    },
    success: false,
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('tgl_pengantaran');
  const [sortOrder, setSortOrder] = useState('desc');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState({
    isOpen: false,
    totalAmount: 0,
    transactionCount: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDashboardData();
  }, [kosanId]);

  const fetchDashboardData = useCallback(async () => {
    try {
      console.log('[DEBUG] fetchDashboardData() called');
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('kosan_owner_token');
      console.log('[DEBUG] Token from localStorage:', token);

      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login kembali.');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const requestUrl = `${apiUrl}/mitra/kosan/${kosanId}/owner`;

      console.log('[DEBUG] Request URL:', requestUrl);

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('[DEBUG] Response status:', response.status);

      if (response.status === 401) {
        logout();
        navigate('/kosan-owner/login', {
          state: {
            from: `/kosan/${kosanId}/owner`,
            message: 'Sesi Anda telah berakhir. Silakan login kembali.'
          }
        });
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Raw response JSON:', data);

      const validatedData = {
        ...data,
        data: {
          kosan: data.data?.kosan || {},
          items: Array.isArray(data.data?.items) ? data.data.items : []
        }
      };

      setDashboardData(validatedData);
    } catch (error) {
      console.error('[DEBUG] Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
      console.log('[DEBUG] fetchDashboardData() finished');
    }
  }, [kosanId, logout, navigate]);

  // Fungsi untuk membuka modal pencairan dana
  const openWithdrawModal = useCallback(() => {
  const items = dashboardData?.data?.items || [];
  const unpaidFeeItems = items.filter(item => {
    const status = item.status_fee?.toUpperCase();
    return status === 'BELUM BAYAR';
  });
  
  // Hitung jumlah sementara untuk display modal
  const totalUnpaidFeeAmount = unpaidFeeItems.reduce((sum, item) => {
    const total = Number(item.total) || 0;
    const commission = total * 0.1;
    return sum + commission;
  }, 0);
  
  if (unpaidFeeItems.length === 0) {
    alert('Tidak ada fee yang bisa dicairkan saat ini. Semua fee sudah dibayar.');
    return;
  }
  
  // Simpan ID transaksi untuk dikirim nanti
  const transactionIds = unpaidFeeItems.map(item => 
    item.id_transaksi || item.invoice || item.id || item.transaction_id
  ).filter(id => id);
  
  setWithdrawModal({
    isOpen: true,
    totalAmount: totalUnpaidFeeAmount, // Hanya untuk display
    transactionCount: unpaidFeeItems.length, // Hanya untuk display
    transactionIds: transactionIds // Untuk dikirim ke backend
  });
}, [dashboardData?.data?.items]);

  // Fungsi untuk menutup modal pencairan dana
  const closeWithdrawModal = useCallback(() => {
    setWithdrawModal({
      isOpen: false,
      totalAmount: 0,
      transactionCount: 0
    });
  }, []);

  const formatCurrency = useCallback((amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(numAmount);
  }, []);


  // Fungsi untuk memproses pencairan dana
  const processWithdrawal = useCallback(async () => {
  console.log('[WITHDRAW] processWithdrawal() START');

  try {
    setWithdrawLoading(true);
    console.log('[WITHDRAW] Loading set to TRUE');

    // =========================
    // AMBIL DATA DASHBOARD
    // =========================
    const items = dashboardData?.data?.items || [];
    console.log('[WITHDRAW] Dashboard items:', items);

    const unpaidFeeItems = items.filter(item => {
      const status = item.status_fee?.toUpperCase();
      return status === 'BELUM BAYAR';
    });

    console.log('[WITHDRAW] Unpaid fee items:', unpaidFeeItems);
    console.log('[WITHDRAW] Unpaid count:', unpaidFeeItems.length);

    // =========================
    // AMBIL ID TRANSAKSI SAJA (NO RESI/INVOICE)
    // =========================
    const transactionIds = unpaidFeeItems.map(item => {
      // Prioritaskan ID transaksi jika ada, fallback ke invoice
      return item.id_transaksi || item.invoice || item.id || item.transaction_id;
    }).filter(id => id); // Hapus yang null/undefined

    console.log('[WITHDRAW] Transaction IDs to send:', transactionIds);

    // =========================
    // PAYLOAD YANG DIKIRIM KE SERVER
    // HANYA ID TRANSAKSI + DATA KONTEKS
    // =========================
    const withdrawalPayload = {
      transaction_ids: transactionIds, // Kirim array ID transaksi
      kosan_id: kosanId, // ID kosan untuk konfirmasi
      mitra_id: user?.id, // ID mitra/owner
      request_date: new Date().toISOString()
      // NOTE: JANGAN kirim amount/fee calculation, biar backend yg hitung
      // amount: withdrawModal.totalAmount, // HAPUS atau COMMENT
      // transaction_count: withdrawModal.transactionCount, // HAPUS atau COMMENT
    };

    // =========================
    // AUTH & URL
    // =========================
    const token = localStorage.getItem('kosan_owner_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const endpoint = `${apiUrl}/mitra/kosan/${kosanId}/withdraw-fee`;

    // =========================
    // 🔥 LOG DATA YANG DIKIRIM KE SERVER
    // =========================
    console.log('================= WITHDRAW REQUEST =================');
    console.log('[SEND] Endpoint:', endpoint);
    console.log('[SEND] Method: POST');
    console.log('[SEND] Token exists:', !!token);
    console.log('[SEND] Headers:', {
      Authorization: token ? 'Bearer ***TOKEN EXISTS***' : 'NO TOKEN',
      'Content-Type': 'application/json'
    });
    console.log('[SEND] Body:', withdrawalPayload);
    console.log('[SEND] Summary:', {
      kosan_id: withdrawalPayload.kosan_id,
      mitra_id: withdrawalPayload.mitra_id,
      transaction_count: transactionIds.length,
      transaction_ids_sample: transactionIds.slice(0, 3) // Tampilkan 3 contoh
    });
    console.log('====================================================');

    // =========================
    // REQUEST KE SERVER
    // =========================
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(withdrawalPayload)
    });

    console.log('[WITHDRAW] HTTP Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[WITHDRAW] API Error response:', errorData);
      throw new Error(errorData.message || 'Gagal memproses pencairan dana');
    }

    const result = await response.json();
    console.log('[WITHDRAW] API Success response:', result);

    if (result.success) {
      console.log('[WITHDRAW] Withdrawal SUCCESS');
      
      // Tampilkan data dari server jika ada
      if (result.data) {
        const { total_amount, transaction_count, request_id } = result.data;
        alert(
          `✅ Permintaan pencairan berhasil!\n\n` +
          `ID Permintaan: ${request_id || 'N/A'}\n` +
          `Jumlah Transaksi: ${transaction_count}\n` +
          `Total Pencairan: ${formatCurrency(total_amount)}\n\n` +
          `Admin laundry akan memproses dalam 1-3 hari kerja.`
        );
      } else {
        alert('Permintaan pencairan dana berhasil dikirim! Admin laundry akan memproses pembayaran dalam waktu 1-3 hari kerja.');
      }
      
      closeWithdrawModal();
      fetchDashboardData(); // Refresh data dashboard
    } else {
      throw new Error(result.message || 'Gagal memproses pencairan dana');
    }

  } catch (error) {
    console.error('[WITHDRAW] ERROR:', error);
    alert(`Gagal memproses pencairan dana: ${error.message}`);
  } finally {
    setWithdrawLoading(false);
    console.log('[WITHDRAW] Loading set to FALSE');
    console.log('[WITHDRAW] processWithdrawal() END');
  }
}, [
  kosanId,
  fetchDashboardData,
  closeWithdrawModal,
  dashboardData?.data?.items,
  user,
  formatCurrency // Pastikan formatCurrency ada di dependencies
]);

  // Fungsi untuk membuka WhatsApp ke admin laundry
  const openWhatsAppToLaundry = useCallback(() => {
    // Nomor admin laundry bisa diambil dari konfigurasi atau API
    const adminPhone = '6281234567890'; // Ganti dengan nomor admin sebenarnya
    
    // Format nomor untuk WhatsApp
    const phoneNumber = adminPhone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('0') ? '62' + phoneNumber.substring(1) : phoneNumber;
    
    // Nama kosan untuk pesan
    const kosanName = dashboardData?.data?.kosan?.name || 'Kosan';
    const ownerName = user?.name || 'Owner Kosan';
    
    // Hitung fee yang belum dibayar
    const items = dashboardData?.data?.items || [];
    const unpaidFeeItems = items.filter(item => {
      const status = item.status_fee?.toUpperCase();
      return status === 'BELUM BAYAR';
    });
    const totalUnpaidFeeAmount = unpaidFeeItems.reduce((sum, item) => {
      const total = Number(item.total) || 0;
      const commission = total * 0.1;
      return sum + commission;
    }, 0);
    
    // Pesan template untuk permintaan pencairan dana
    const message = `Halo Admin Laundry! 👋\n\nSaya ${ownerName} dari ${kosanName}.\n\nSaya ingin mengajukan permintaan pencairan fee sebesar ${formatCurrency(totalUnpaidFeeAmount)} dari ${unpaidFeeItems.length} transaksi yang belum dibayar.\n\nMohon dapat diproses pada kesempatan terbaik.\n\nTerima kasih.`;
    
    // Buat URL WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, [dashboardData?.data?.kosan?.name, dashboardData?.data?.items, user?.name]);

  
  const formatShortDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const options = { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      };
      return date.toLocaleDateString('id-ID', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }, []);

  const getPaymentStatusBadge = useCallback((status) => {
    if (!status) return null;
    
    const statusUpper = status.toUpperCase();
    switch(statusUpper) {
      case 'PAID':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> LUNAS
          </span>
        );
      case 'UNPAID':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaExclamationCircle className="mr-1" /> BELUM LUNAS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <FaClock className="mr-1" /> {status}
          </span>
        );
    }
  }, []);

  const getFeeStatusBadge = useCallback((status) => {
    if (!status) return null;
    
    const statusUpper = status.toUpperCase();
    switch(statusUpper) {
      case 'SUDAH BAYAR':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" /> SUDAH BAYAR
          </span>
        );
      case 'BELUM BAYAR':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaExclamationCircle className="mr-1" /> BELUM BAYAR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <FaClock className="mr-1" /> {status}
          </span>
        );
    }
  }, []);

  // Calculate summary statistics dengan useMemo
  const summary = useMemo(() => {
    const items = dashboardData?.data?.items || [];
    
    const totalRevenue = items.reduce((sum, item) => {
      const total = Number(item.total) || 0;
      return sum + total;
    }, 0);
    
    const unpaidFeeItems = items.filter(item => {
      const status = item.status_fee?.toUpperCase();
      return status === 'BELUM BAYAR';
    });
    
    const totalUnpaidFeeAmount = unpaidFeeItems.reduce((sum, item) => {
      const total = Number(item.total) || 0;
      const commission = total * 0.1;
      return sum + commission;
    }, 0);
    
    const paidTransactions = items.filter(item => {
      const status = item.status_pembayaran?.toUpperCase();
      return status === 'PAID';
    }).length;
    
    const unpaidTransactions = items.filter(item => {
      const status = item.status_pembayaran?.toUpperCase();
      return status === 'UNPAID';
    }).length;
    
    const paidFee = items.filter(item => {
      const status = item.status_fee?.toUpperCase();
      return status === 'SUDAH BAYAR';
    }).length;
    
    return {
      totalTransactions: items.length,
      totalRevenue,
      unpaidFee: unpaidFeeItems.length,
      totalUnpaidFeeAmount,
      paidTransactions,
      unpaidTransactions,
      paidFee
    };
  }, [dashboardData?.data?.items]);

  // Filter and sort items dengan useMemo
  const filteredItems = useMemo(() => {
    const items = dashboardData?.data?.items || [];
    
    const filtered = items.filter(item => {
      if (filterStatus === 'ALL') return true;
      
      const paymentStatus = item.status_pembayaran?.toUpperCase();
      const feeStatus = item.status_fee?.toUpperCase();
      
      if (filterStatus === 'UNPAID_FEE') return feeStatus === 'BELUM BAYAR';
      if (filterStatus === 'PAID_FEE') return feeStatus === 'SUDAH BAYAR';
      if (filterStatus === 'UNPAID_CUSTOMER') return paymentStatus === 'UNPAID';
      if (filterStatus === 'PAID') return paymentStatus === 'PAID';
      
      return true;
    });
    
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'tgl_pengantaran': {
          const dateA = a.tgl_pengantaran ? new Date(a.tgl_pengantaran) : new Date(0);
          const dateB = b.tgl_pengantaran ? new Date(b.tgl_pengantaran) : new Date(0);
          comparison = dateB.getTime() - dateA.getTime();
          break;
        }
        case 'total': {
          const totalA = Number(a.total) || 0;
          const totalB = Number(b.total) || 0;
          comparison = totalB - totalA;
          break;
        }
        case 'nama': {
          const namaA = a.nama || '';
          const namaB = b.nama || '';
          comparison = namaA.localeCompare(namaB);
          break;
        }
        case 'status_fee': {
          const statusA = a.status_fee || '';
          const statusB = b.status_fee || '';
          comparison = statusA.localeCompare(statusB);
          break;
        }
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });
  }, [dashboardData?.data?.items, filterStatus, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of table
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    setCurrentPage(1); // Reset ke halaman pertama saat refresh
  }, [fetchDashboardData]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/kosan-owner/login');
  }, [logout, navigate]);

  const handleViewDetails = useCallback((item) => {
    if (item.invoice) {
      navigate(`/invoice?invoice=${item.invoice}`);
    } else {
      alert('Invoice tidak tersedia');
    }
  }, [navigate]);

  const handleViewFeeHistory = useCallback(() => {
    // TODO: Navigate ke halaman riwayat pembayaran fee
    alert('Fitur riwayat pembayaran fee akan segera tersedia.');
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data dashboard mitra...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardData.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                Coba Lagi
              </button>
              <button
                onClick={handleLogout}
                className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition"
              >
                Login Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const kosanData = dashboardData?.data?.kosan || {};
  const userData = user || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Modal Pencairan Dana */}
      {withdrawModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  <FaMoneyBill className="inline mr-2 text-green-600" />
                  Permintaan Pencairan Fee
                </h3>
                <button
                  onClick={closeWithdrawModal}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-center mb-2">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(withdrawModal.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Total fee yang akan dicairkan
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah transaksi:</span>
                      <span className="font-medium">{withdrawModal.transactionCount} transaksi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-yellow-600">Menunggu pencairan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Waktu proses:</span>
                      <span className="font-medium">1-3 hari kerja</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <FaExclamationCircle className="text-yellow-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-700">
                        <strong>Perhatian:</strong> Permintaan pencairan akan dikirim ke admin laundry untuk diverifikasi dan diproses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closeWithdrawModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={processWithdrawal}
                  disabled={withdrawLoading}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl ${
                    withdrawLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {withdrawLoading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FaMoneyBill className="inline mr-2" />
                      Ajukan Pencairan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="mr-4 text-gray-600 hover:text-blue-600 transition"
              >
                <FaArrowLeft className="text-xl" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Mitra Kosan</h1>
                <p className="text-sm text-gray-600">
                  Login sebagai: <span className="font-medium text-blue-600">{userData.name || 'Owner Kosan'}</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FaSpinner className="mr-2" />
                Refresh Data
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kosan Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <FaBuilding className="text-2xl mr-3" />
                <h2 className="text-2xl font-bold">{kosanData.name || 'Nama Kosan'}</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{kosanData.address || 'Alamat tidak tersedia'}</span>
                </div>
                <div className="flex items-center">
                  <FaPhone className="mr-2" />
                  <span>{kosanData.telp || 'Telepon tidak tersedia'}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-sm opacity-90">Status Partnership</div>
              <div className="text-2xl font-bold mt-1">Aktif</div>
              <div className="text-sm opacity-90 mt-2">
                Partner dengan: {filteredItems[0]?.laundry || 'Clean Laundry'}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Transaksi */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 mr-4">
                <FaFileInvoice className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{summary?.totalTransactions || 0}</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 mr-4">
                <FaMoneyBillWave className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Fee Belum Dibayar */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 mr-4">
                <FaWallet className="text-2xl text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fee Belum Dibayar</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(summary?.totalUnpaidFeeAmount || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary?.unpaidFee || 0} transaksi
                </p>
              </div>
            </div>
          </div>

          {/* Komisi (10%) */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 mr-4">
                <FaPercentage className="text-2xl text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Komisi (10%)</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency((summary?.totalRevenue || 0) * 0.1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Dari total revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-blue-600" />
                Daftar Transaksi ({filteredItems.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
                  }}
                >
                  <option value="ALL">Semua Transaksi</option>
                  <option value="UNPAID_FEE">Fee Belum Dibayar</option>
                  <option value="PAID_FEE">Fee Sudah Dibayar</option>
                  <option value="UNPAID_CUSTOMER">Customer Belum Bayar</option>
                  <option value="PAID">Customer Sudah Bayar</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center">
                <FaSortAmountDown className="mr-2 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1); // Reset ke halaman 1 saat sorting berubah
                  }}
                >
                  <option value="tgl_pengantaran">Tanggal Pengantaran</option>
                  <option value="total">Total Tertinggi</option>
                  <option value="nama">Nama Customer</option>
                  <option value="status_fee">Status Fee</option>
                </select>
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setCurrentPage(1); // Reset ke halaman 1 saat sorting order berubah
                  }}
                  className="ml-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title={sortOrder === 'desc' ? 'Urut menurun' : 'Urut menaik'}
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                {summary?.paidTransactions || 0}
              </div>
              <div className="text-sm text-blue-700">Customer Lunas</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">
                {summary?.unpaidTransactions || 0}
              </div>
              <div className="text-sm text-red-700">Customer Belum Lunas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {summary?.paidFee || 0}
              </div>
              <div className="text-sm text-green-700">Fee Dibayar</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">
                {summary?.unpaidFee || 0}
              </div>
              <div className="text-sm text-yellow-700">Fee Tertunda</div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200 mb-8">
            <FaFileInvoice className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada transaksi</h3>
            <p className="text-gray-600 mb-6">Tidak ditemukan transaksi dengan filter yang dipilih.</p>
            <button
              onClick={() => {
                setFilterStatus('ALL');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Tampilkan semua transaksi
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedItems.map((item, index) => {
                      const total = Number(item.total) || 0;
                      const commission = total * 0.1;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                                <FaFileInvoice className="text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.invoice || '-'}</div>
                                <div className="text-sm text-gray-500">{item.laundry || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <FaUser className="text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{item.nama || '-'}</div>
                                <div className="text-sm text-gray-500">{item.telp || '-'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-right">
                              <div className="font-bold text-gray-900">{formatCurrency(total)}</div>
                              <div className="text-xs text-gray-500">
                                Komisi: {formatCurrency(commission)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {getPaymentStatusBadge(item.status_pembayaran)}
                              {item.tgl_pelunasan && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Lunas: {formatShortDate(item.tgl_pelunasan)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              {getFeeStatusBadge(item.status_fee)}
                              {item.tgl_pembayaran && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Dibayar: {formatShortDate(item.tgl_pembayaran)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">
                                <FaCalendarAlt className="inline mr-1" />
                                {formatShortDate(item.tgl_pengantaran)}
                              </div>
                              {item.tgl_pelunasan && (
                                <div className="text-xs text-gray-500">
                                  Pelunasan: {formatShortDate(item.tgl_pelunasan)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewDetails(item)}
                                className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 transition text-sm"
                              >
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mb-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === 1
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaChevronLeft className="inline mr-1" />
                  Sebelumnya
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Logic untuk menampilkan halaman dengan ellipsis
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                          currentPage === pageNum
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border ${
                          currentPage === totalPages
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === totalPages
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Selanjutnya
                  <FaChevronRight className="inline ml-1" />
                </button>
                
                <div className="text-sm text-gray-600 ml-4">
                  Halaman {currentPage} dari {totalPages} • 
                  Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} dari {filteredItems.length} transaksi
                </div>
              </div>
            )}
          </>
        )}

        {/* Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Komisi Summary */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalculator className="mr-2 text-blue-600" />
              Ringkasan Komisi
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Total Revenue Kosan</span>
                <span className="font-bold text-blue-600">{formatCurrency(summary?.totalRevenue || 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">Komisi 10%</span>
                <span className="font-bold text-green-600">
                  {formatCurrency((summary?.totalRevenue || 0) * 0.1)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700">Fee Belum Dibayar</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(summary?.totalUnpaidFeeAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-200">
                <span className="text-gray-700 font-medium">Fee Sudah Diterima</span>
                <span className="font-bold text-green-700">
                  {formatCurrency(((summary?.totalRevenue || 0) * 0.1) - (summary?.totalUnpaidFeeAmount || 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions - DIUBAH menjadi Tombol Pencairan Dana */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl shadow-sm p-6 text-white">
            <h4 className="font-semibold mb-4 flex items-center">
              <FaMoneyBill className="mr-2" />
              Pencairan Fee
            </h4>
            <div className="space-y-3">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(summary?.totalUnpaidFeeAmount || 0)}
                </div>
                <div className="text-sm opacity-90">
                  Fee yang bisa dicairkan
                </div>
                <div className="text-xs opacity-75 mt-1">
                  {summary?.unpaidFee || 0} transaksi
                </div>
              </div>
              
              <button 
                onClick={openWithdrawModal}
                disabled={summary?.unpaidFee === 0}
                className={`w-full bg-white hover:bg-white/90 text-green-600 font-medium py-3 rounded-lg transition flex items-center justify-center ${
                  summary?.unpaidFee === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaMoneyBill className="mr-2" />
                Ajukan Pencairan
              </button>
              
              <button 
                onClick={handleViewFeeHistory}
                className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-lg transition flex items-center justify-center"
              >
                <FaHistory className="mr-2" />
                Riwayat Pencairan
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-800 text-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h4 className="font-semibold mb-2">Informasi Partnership</h4>
              <p className="text-gray-400 text-sm">
                Sistem komisi otomatis 10% dari setiap transaksi laundry penghuni kosan.
                Fee akan ditransfer setiap akhir bulan setelah verifikasi.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                User ID: {userData.id || '-'} • Kosan ID: {userData.kosan_id || '-'} • Role: {userData.role || '-'}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={openWhatsAppToLaundry}
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  <FaWhatsapp className="mr-2" />
                  Chat WhatsApp ke Laundry
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export wrapper component
export default KosanOwnerDashboardWrapper;