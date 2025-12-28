import { useState, useEffect } from 'react';
import { FaWhatsapp } from "react-icons/fa"; // ✅ Tambahkan ini
import { 
  FaFileInvoice, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaCheckCircle, 
  FaClock, 
  FaExclamationCircle,
  FaTshirt,
  FaWeight,
  FaMoneyBillWave,
  FaCreditCard,
  FaArrowLeft,
  FaSpinner,
  FaTruck,
  FaBath,
  FaBox,
  FaFire,
  FaBell,
  FaCaretDown,
  FaCaretUp,
  FaTimes
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildApiUrl } from '../apiConfig';

const InvoicePage = () => {
  const [searchParams] = useSearchParams();
  // Tambahkan useNavigate hook
  const navigate = useNavigate();
  const invoiceNumber = searchParams.get('invoice') || 'INV-202501-0042';
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [expandedTrackingItems, setExpandedTrackingItems] = useState({});
  
  // State untuk error handling
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: '',
    message: '',
    details: ''
  });

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceNumber]);

  // Helper untuk toggle expanded tracking
  const toggleTrackingExpansion = (itemId) => {
    setExpandedTrackingItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const WhatsAppButton = ({ phone, invoice, laundryName }) => {
    if (!phone) return null;

    const url = `https://wa.me/${phone.replace(/^0/, "62")}?text=${encodeURIComponent(
      `Halo ${laundryName} 👋 Saya ingin menanyakan invoice ${invoice}`
    )}`;

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        <FaWhatsapp />
        WhatsApp
      </a>
    );
  };

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/public/31/pay/invoice?invoice=${invoiceNumber}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API Error');
      }
      
      setInvoiceData(data);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
      
      // Tampilkan error modal untuk fetch data
      setErrorModal({
        show: true,
        title: 'Gagal Memuat Data Invoice',
        message: 'Terjadi kesalahan saat mengambil data invoice dari server.',
        details: error.message
      });
      
      // Set data kosong
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

const handlePayment = async () => {
  if (!invoiceData) return;

  // Cek apakah invoice sudah lunas
  if (invoiceData.data.invoice.payment_status === 'LUNAS') {
    setErrorModal({
      show: true,
      title: 'Pembayaran Sudah Lunas',
      message: 'Invoice ini sudah dibayar lunas dan tidak dapat diproses lagi.',
      details: ''
    });
    return;
  }

    try {
      setPaymentProcessing(true);

      const paymentData = {
        order: {
          invoice_number: `${invoiceData.data.invoice.invoice_number}`,
          amount: invoiceData.data.invoice.total,
          currency: 'IDR',
        },
        customer: {
          id: `USER-${invoiceData.data.invoice.consumer_id}`,
          name: invoiceData.data.invoice.customer_name,
          email: `andibarmawi@gmail.com`,
          phone: '08123456789'
        },
        additional_info: {
          override_notification_url: "https://api.cleancloud.click/payment/notify",
          payment_type: "invoicepayment",
          invoice_id: invoiceNumber,
          customer_id: invoiceData.data.invoice.consumer_id
        },
        payment: {
          payment_due_date: 60,
          description: `Pembayaran invoice laundry: ${invoiceData.data.invoice.invoice_number}`
        }
      };

      console.log('🔄 [INVOICE PAYMENT] Sending payment data:', paymentData);
      
      const endpointUrl = buildApiUrl('/doku/payment');
      console.log('🔗 [INVOICE PAYMENT] Endpoint URL:', endpointUrl);
      
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      console.log('📡 [INVOICE PAYMENT] Response Status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 [INVOICE PAYMENT] Raw Response Text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ [INVOICE PAYMENT] Parsed Response:', result);
      } catch (parseError) {
        console.error('❌ [INVOICE PAYMENT] JSON Parse Error:', parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('❌ [INVOICE PAYMENT] Server Error Response:', result);
        
        // Tampilkan error modal dengan pesan dari server
        setErrorModal({
          show: true,
          title: 'Gagal Memproses Pembayaran',
          message: result.message || `Terjadi kesalahan saat memproses pembayaran.`,
          details: response.statusText || 'Tidak ada detail tambahan'
        });
        
        throw new Error(result.message || `Server error: ${response.status} ${response.statusText}`);
      }

      // ✅ Perbaikan parsing response berdasarkan struktur Go
      let paymentUrl = null;
      
      // Cek berbagai kemungkinan struktur response dari DOKU API
      if (result.response?.payment?.url) {
        paymentUrl = result.response.payment.url;
        console.log('🔗 [INVOICE PAYMENT] Found payment URL in result.response.payment.url');
      } else if (result.payment_url) {
        paymentUrl = result.payment_url;
        console.log('🔗 [INVOICE PAYMENT] Found payment URL in result.payment_url');
      } else if (result.url) {
        paymentUrl = result.url;
        console.log('🔗 [INVOICE PAYMENT] Found payment URL in result.url');
      } else if (result.data?.payment_url) {
        paymentUrl = result.data.payment_url;
        console.log('🔗 [INVOICE PAYMENT] Found payment URL in result.data.payment_url');
      } else if (result.data?.url) {
        paymentUrl = result.data.url;
        console.log('🔗 [INVOICE PAYMENT] Found payment URL in result.data.url');
      }

      if (paymentUrl) {
        console.log('🔗 [INVOICE PAYMENT] Payment URL received:', paymentUrl);
        
        // Tunggu sedikit untuk memastikan UI tidak freeze
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // ✅ Load DOKU script jika belum dimuat
        if (!window.loadJokulCheckout) {
          console.log('📦 [INVOICE PAYMENT] DOKU script not loaded, loading now...');
          await loadDokuScript();
        }
        
        // Panggil loadJokulCheckout langsung - DOKU akan membuat modal sendiri
        if (window.loadJokulCheckout) {
          console.log('🚀 [INVOICE PAYMENT] Launching DOKU Checkout...');
          window.loadJokulCheckout(paymentUrl);
          
          // Tampilkan modal sukses
          setShowPaymentModal(false);
          
        } else {
          console.warn('⚠️ [INVOICE PAYMENT] DOKU Checkout function not available');
          // Fallback: open in new tab
          window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          setShowPaymentModal(false);
        }
        
      } else {
        console.warn('⚠️ [INVOICE PAYMENT] No payment URL found in response');
        console.log('📊 [INVOICE PAYMENT] Full response structure:', JSON.stringify(result, null, 2));
        
        // Tampilkan error modal untuk kasus tidak ada payment URL
        setErrorModal({
          show: true,
          title: 'URL Pembayaran Tidak Ditemukan',
          message: 'Sistem tidak dapat menemukan URL pembayaran dari server.',
          details: 'Response server tidak mengandung URL pembayaran yang valid.'
        });
      }
    } catch (error) {
      console.error('❌ [INVOICE PAYMENT] Error:', error);
      
      // Tampilkan error modal untuk kesalahan umum
      if (!errorModal.show) {
        setErrorModal({
          show: true,
          title: 'Terjadi Kesalahan',
          message: 'Gagal memproses pembayaran. Silakan coba lagi.',
          details: error.message
        });
      }
    } finally {
      setPaymentProcessing(false);
      
      // Refresh data setelah pembayaran
      setTimeout(() => {
        fetchInvoiceData();
      }, 3000);
    }
  };

  // Load DOKU Script
  const loadDokuScript = () => {
    // Cek apakah script sudah diload
    if (window.loadJokulCheckout || document.querySelector('script[src*="jokul-checkout"]')) {
      console.log('✅ DOKU Checkout script already loaded');
      return;
    }

    // Tambahkan script DOKU Checkout
    const script = document.createElement('script');
    script.src = 'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ DOKU Checkout script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load DOKU Checkout script');
    };
    
    document.head.appendChild(script);
  };

  useEffect(() => {
    fetchInvoiceData();
    loadDokuScript(); // ✅ Load DOKU script saat komponen mount
  }, [invoiceNumber]);

  const PaymentSuccessModal = () => {
    const handleClose = () => {
      // Refresh data invoice setelah modal ditutup
      fetchInvoiceData();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Diproses</h3>
              <p className="text-gray-600">
                Halaman pembayaran DOKU sedang dibuka untuk invoice{' '}
                <span className="font-semibold">{invoiceData?.data?.invoice?.invoice_number}</span>
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700 text-center">
                Jika halaman pembayaran tidak muncul, periksa pop-up blocker di browser Anda atau klik link pembayaran yang dikirim ke email Anda.
              </p>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Tutup
            </button>
            
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Halaman ini akan refresh otomatis untuk update status
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component untuk Error Modal
  const ErrorModal = () => {
    const handleClose = () => {
      setErrorModal({
        show: false,
        title: '',
        message: '',
        details: ''
      });
    };

    const handleRetry = () => {
      handleClose();
      if (errorModal.title === 'Gagal Memuat Data Invoice') {
        fetchInvoiceData();
      } else if (errorModal.title === 'Gagal Memproses Pembayaran') {
        handlePayment();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <FaExclamationCircle className="text-red-600 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{errorModal.title}</h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">{errorModal.message}</p>
              
              {errorModal.details && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">Detail Error:</p>
                  <p className="text-xs text-gray-500 font-mono break-words">{errorModal.details}</p>
                </div>
              )}
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-700">
                  <FaExclamationCircle className="inline mr-2" />
                  Silakan coba lagi beberapa saat atau hubungi laundry jika masalah berlanjut.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                Coba Lagi
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
              >
                Tutup
              </button>
            </div>
            
            {errorModal.title === 'Gagal Memuat Data Invoice' && (
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  Kembali ke Halaman Utama
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getPaymentStatusBadge = (status) => {
  switch(status) {
    case 'LUNAS':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" /> LUNAS
        </span>
      );
    case 'BELUM LUNAS':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <FaExclamationCircle className="mr-1" /> BELUM LUNAS
        </span>
      );
    case 'SEBAGIAN':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          <FaClock className="mr-1" /> SEBAGIAN
        </span>
      );
    default:
      return null;
  }
};

  const getWorkStatusBadge = (status) => {
    const statusConfig = {
      'SORTIR': { color: 'bg-blue-100 text-blue-800', icon: <FaTshirt className="mr-1" /> },
      'CUCI': { color: 'bg-indigo-100 text-indigo-800', icon: <FaBath className="mr-1" /> },
      'SETRIKA': { color: 'bg-purple-100 text-purple-800', icon: <FaFire className="mr-1" /> },
      'SELESAI': { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="mr-1" /> },
      'PACKING': { color: 'bg-yellow-100 text-yellow-800', icon: <FaBox className="mr-1" /> },
      'PROCESSING': { color: 'bg-orange-100 text-orange-800', icon: <FaSpinner className="mr-1 animate-spin" /> }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: <FaClock className="mr-1" /> };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  };

  const getTrackingStatusIcon = (track) => {
    if (track.skipped) {
      return <span className="text-gray-400">—</span>;
    }
    if (track.completed) {
      return <FaCheckCircle size={16} className="text-green-500" />;
    }
    if (track.current) {
      return <FaSpinner className="animate-spin" size={16} />;
    }
    return <div className="w-2 h-2 rounded-full bg-gray-400"></div>;
  };

  const getTrackingStatusColor = (track) => {
    if (track.skipped) return 'text-gray-400';
    if (track.completed) return 'text-green-700';
    if (track.current) return 'text-blue-700';
    return 'text-gray-700';
  };

  // Component untuk menampilkan tracking per item
  const TrackingTimeline = ({ item }) => {
    const isExpanded = expandedTrackingItems[item.id];
    
    return (
      <div className="mt-4 border rounded-lg overflow-hidden">
        <button
          onClick={() => toggleTrackingExpansion(item.id)}
          className="w-full p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
        >
          <div className="flex items-center">
            <FaTruck className="mr-3 text-gray-600" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900">{item.service_name}</h4>
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium">{item.work_status}</span> • 
                Progress: {item.work_status_progress}%
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">
              {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
            </span>
            {isExpanded ? <FaCaretUp /> : <FaCaretDown />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-white">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-4">
                {item.tracking_history?.map((track, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                      track.skipped 
                        ? 'bg-gray-100 border border-gray-300' 
                        : track.completed 
                          ? 'bg-green-100 border border-green-300' 
                          : track.current 
                            ? 'bg-blue-100 border border-blue-300' 
                            : 'bg-gray-100 border border-gray-300'
                    }`}>
                      {getTrackingStatusIcon(track)}
                    </div>
                    
                    <div className="ml-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`font-medium ${getTrackingStatusColor(track)}`}>
                            {track.title}
                            {track.skipped && <span className="ml-2 text-xs text-gray-500">(dilewati)</span>}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">{track.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Component untuk progress ringkasan keseluruhan
  const OverallProgress = () => {
    if (!invoiceData?.data?.invoice?.overall_tracking) return null;
    
    const overall = invoiceData.data.invoice.overall_tracking;
    
    return (
      <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <FaTruck className="mr-2 text-purple-600" />
            Progress Keseluruhan Pesanan
          </h3>
          <div className="text-lg font-bold text-blue-600">{overall.overall_progress}%</div>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${overall.overall_progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Mulai</span>
            <span>{overall.overall_progress}%</span>
            <span>Selesai</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600">Status Saat Ini</div>
            <div className="font-medium">{overall.current_stage}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-blue-600">Estimasi Selesai</div>
            <div className="font-medium">{invoiceData.data.invoice.estimated_finished}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-600">Proses Berikutnya</div>
            <div className="font-medium">{overall.next_estimated_time}</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data invoice...</p>
        </div>
      </div>
    );
  }

  // Jika data invoice tidak ada (error saat fetch)
  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Invoice</h2>
          <p className="text-gray-600 mb-6">
            Tidak dapat memuat data invoice. Silakan coba lagi atau hubungi laundry untuk bantuan.
          </p>
          <div className="space-y-3">
            <button
              onClick={fetchInvoiceData}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
            >
              Kembali ke Halaman Utama
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cek apakah invoice sudah lunas
  const isPaid = invoiceData.data.invoice.payment_status === 'PAID';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {/* Ganti Link dengan button yang menggunakan navigate(-1) */}
              <button 
                onClick={() => navigate(-1)} // <- Ini akan kembali ke halaman sebelumnya
                className="mr-4 text-gray-600 hover:text-blue-600 transition"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invoice Laundry</h1>
                <p className="text-sm text-gray-600">Detail transaksi dan pembayaran</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Invoice Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <FaFileInvoice className="text-2xl mr-3" />
                <h1 className="text-2xl font-bold">INVOICE</h1>
              </div>
              <p className="text-blue-100">Nomor: <span className="font-mono font-bold">{invoiceData.data.invoice.invoice_number}</span></p>
              <p className="text-blue-100 text-sm mt-1">Tanggal: {invoiceData.data.invoice.created_at}</p>
              <p className="text-blue-100 text-sm">Jumlah Item: {invoiceData.data.invoice.items.length} jenis layanan</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-3xl font-bold mb-2">{formatCurrency(invoiceData.data.invoice.total)}</div>
                <div className="flex items-center justify-end">
                  {getPaymentStatusBadge(invoiceData.data.invoice.payment_status)}
                  <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">
                    {invoiceData.data.invoice.pickup_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Customer & Laundry Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer & Laundry Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Informasi Pelanggan
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nama</p>
                    <p className="font-medium">{invoiceData.data.invoice.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {invoiceData.data.invoice.customer_phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Laundry Info */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-green-600" />
                  Informasi Laundry
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nama Laundry</p>
                    <p className="font-medium">{invoiceData.data.invoice.laundry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-medium flex items-start">
                      <FaMapMarkerAlt className="mr-2 text-gray-400 mt-1 flex-shrink-0" />
                      {invoiceData.data.invoice.laundry.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium">{invoiceData.data.invoice.laundry.phone}</p>
                  </div>

                  {/* Tombol Chat WhatsApp */}
                  <div className="mt-4">
                    <WhatsAppButton
                      phone={invoiceData?.data?.invoice?.laundry?.contact}
                      invoice={invoiceData?.data?.invoice?.invoice_number}
                      laundryName={invoiceData?.data?.invoice?.laundry?.name}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Detail Pesanan ({invoiceData.data.invoice.items.length} Items)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Layanan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceData.data.invoice.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-50 rounded-lg mr-3">
                              <FaTshirt className="text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.service_name}</div>
                              <div className="text-sm text-gray-500">
                                ID: {item.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-600">
                            <FaWeight className="mr-2" />
                            {item.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">{formatCurrency(item.price)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getWorkStatusBadge(item.work_status)}
                          {item.work_status_progress && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${item.work_status_progress}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{item.work_status_progress}% selesai</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tracking Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <FaTruck className="mr-2 text-purple-600" />
                  Tracking Detail per Item
                </h3>
                <div className="text-sm text-gray-600 flex items-center">
                  <FaBell className="mr-2" />
                  <span className="font-medium">Estimasi Selesai:</span> {invoiceData.data.invoice.estimated_finished}
                </div>
              </div>
              
              {/* Overall Progress */}
              <OverallProgress />
              
              {/* Individual Item Tracking */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700 mb-3">Detail Tracking per Layanan:</h4>
                {invoiceData.data.invoice.items.map((item) => (
                  <TrackingTimeline key={item.id} item={item} />
                ))}
              </div>
              
              {/* Tracking Legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Keterangan Status:</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-gray-600">Selesai</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs text-gray-600">Sedang Berjalan</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
                    <span className="text-xs text-gray-600">Belum Dimulai</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 border border-gray-400 rounded-full bg-gray-100 mr-2"></div>
                    <span className="text-xs text-gray-600">Dilewati</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-8">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
  <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
    <FaMoneyBillWave className="mr-2 text-green-600" />
    Ringkasan Pembayaran
  </h3>
  
  <div className="space-y-4">
    {invoiceData.data.invoice.items.map((item) => (
      <div key={item.id} className="flex justify-between text-sm">
        <span className="text-gray-600">{item.service_name}</span>
        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
      </div>
    ))}
    
    <div className="border-t pt-4 mt-4">
      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-blue-600">{formatCurrency(invoiceData.data.invoice.total)}</span>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex items-center mb-2">
          <FaCalendarAlt className="mr-2" />
          <span>Jatuh Tempo: {invoiceData.data.invoice.due_date}</span>
        </div>
        <div className="flex items-center">
          <FaClock className="mr-2" />
          <span>Status: {invoiceData.data.invoice.payment_status === 'LUNAS' ? 'LUNAS' : 'BELUM LUNAS'}</span>
        </div>
        <div className="flex items-center mt-2">
          <FaBox className="mr-2" />
          <span>Jumlah Item: {invoiceData.data.invoice.items.length}</span>
        </div>
      </div>
    </div>
  </div>
  
  {/* Payment Button atau Status LUNAS */}
  <div className="w-full mt-6">
    {invoiceData.data.invoice.payment_status === 'LUNAS' ? (
      <div className="text-center">
        <div className="bg-green-100 border border-green-300 rounded-xl p-6">
          <div className="flex flex-col items-center justify-center">
            <FaCheckCircle className="text-4xl text-green-600 mb-3" />
            <h3 className="text-lg font-bold text-green-800 mb-2">PEMBAYARAN SUDAH LUNAS</h3>
            
            <div className="mt-4 text-xs text-green-600">
              Terima kasih telah menggunakan layanan kami
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700 text-center">
            <FaBell className="inline mr-2" />
            Anda dapat mengambil pesanan Anda di laundry sesuai jadwal yang telah ditentukan.
          </p>
        </div>
      </div>
    ) : (
      <button
        onClick={handlePayment}
        disabled={paymentProcessing}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50"
      >
        {paymentProcessing ? (
          <>
            <FaSpinner className="animate-spin mr-3" />
            Mengarahkan ke Payment Gateway...
          </>
        ) : (
          <>
            <FaCreditCard className="mr-3" />
            Bayar Sekarang
          </>
        )}
      </button>
    )}
  </div>
</div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Catatan Penting</h3>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Setiap item dapat memiliki progress berbeda</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pembayaran akan meng-cover semua item</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Item dapat diambil secara bertahap</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Untuk pertanyaan, hubungi: {invoiceData.data.invoice.laundry.phone}</span>
                </li>
              </ul>
            </div>

            {/* Payment Info - hanya tampil jika belum lunas */}
            {!isPaid && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Pembayaran via CleanCloud</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Semua pembayaran diproses melalui sistem payment gateway CleanCloud yang aman dan terpercaya.
                </p>
                <div className="text-xs text-blue-600">
                  <div className="flex items-center mb-1">
                    <FaCheckCircle className="mr-2" />
                    <span>Transaksi aman & terenkripsi</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <FaCheckCircle className="mr-2" />
                    <span>Konfirmasi otomatis real-time</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>Support 24/7 untuk masalah pembayaran</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Info tambahan jika sudah lunas */}
            {isPaid && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Status Pembayaran
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Pembayaran invoice ini sudah lunas dan telah dikonfirmasi oleh sistem.
                </p>
                <div className="text-xs text-green-600">
                  <div className="flex items-center mb-1">
                    <FaCheckCircle className="mr-2" />
                    <span>Pembayaran sudah diterima</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <FaCheckCircle className="mr-2" />
                    <span>Status pembayaran: LUNAS</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheckCircle className="mr-2" />
                    <span>Pesanan dapat diambil sesuai jadwal</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentSuccessModal />}

      {/* Error Modal */}
      {errorModal.show && <ErrorModal />}

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} {invoiceData.data.invoice.laundry.name}. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Invoice ini sah secara hukum dan dapat digunakan sebagai bukti transaksi.
              </p>
              {isPaid && (
                <p className="text-green-400 text-xs mt-1">
                  ✓ Pembayaran sudah lunas dan terverifikasi
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <a 
                href={`tel:${invoiceData.data.invoice.laundry.phone}`}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Butuh Bantuan? Hubungi: {invoiceData.data.invoice.laundry.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;