import { useState, useEffect, useRef, useCallback } from 'react';
import { FaWhatsapp } from "react-icons/fa";
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
  FaBox,
  FaBell,
  FaTimes,
  FaSync
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildApiUrl } from '../apiConfig';

// Constants untuk status WebSocket
const WS_URL = "wss://api.cleancloud.cloud/ws";
const WS_RECONNECT_DELAY = 5000;
const POLLING_INTERVAL = 10000;
const MAX_POLLING_ATTEMPTS = 30;

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const getPaymentStatusBadge = (status) => {
  const statusConfig = {
    'LUNAS': {
      color: 'bg-green-100 text-green-800',
      icon: <FaCheckCircle className="mr-1" />,
      text: 'LUNAS'
    },
    'BELUM LUNAS': {
      color: 'bg-red-100 text-red-800',
      icon: <FaExclamationCircle className="mr-1" />,
      text: 'BELUM LUNAS'
    },
    'SEBAGIAN': {
      color: 'bg-yellow-100 text-yellow-800',
      icon: <FaClock className="mr-1" />,
      text: 'SEBAGIAN'
    }
  };

  const config = statusConfig[status];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.icon} {config.text}
    </span>
  );
};

const getWorkStatusBadge = (status) => {
  const statusConfig = {
    'SORTIR': { color: 'bg-blue-100 text-blue-800', icon: <FaTshirt className="mr-1" /> },
    'CUCI': { color: 'bg-indigo-100 text-indigo-800', icon: <FaTshirt className="mr-1" /> },
    'SETRIKA': { color: 'bg-purple-100 text-purple-800', icon: <FaTshirt className="mr-1" /> },
    'SELESAI': { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="mr-1" /> },
    'PACKING': { color: 'bg-yellow-100 text-yellow-800', icon: <FaBox className="mr-1" /> },
    'PROCESSING': { color: 'bg-orange-100 text-orange-800', icon: <FaSpinner className="mr-1 animate-spin" /> }
  };
  
  const config = statusConfig[status] || { 
    color: 'bg-gray-100 text-gray-800', 
    icon: <FaClock className="mr-1" /> 
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.icon} {status}
    </span>
  );
};

// Component untuk WhatsApp Button
const WhatsAppButton = ({ phone, invoiceNumber, laundryName }) => {
  if (!phone) return null;

  const formattedPhone = phone.replace(/^0/, "62");
  const message = `Halo ${laundryName} 👋 Saya ingin menanyakan invoice ${invoiceNumber}`;
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

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

// Component untuk Error Modal
const ErrorModal = ({ error, onClose, onRetry }) => {
  const copyPaymentUrl = () => {
    if (error.details) {
      navigator.clipboard.writeText(error.details);
      alert('URL telah disalin ke clipboard!');
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
              <h3 className="text-xl font-bold text-gray-900">{error.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Tutup modal"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-3">{error.message}</p>
            
            {error.details && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                <p className="text-sm font-medium text-gray-600 mb-1">Detail:</p>
                <p className="text-xs text-gray-500 font-mono break-words">{error.details}</p>
                
                {error.title === 'Pop-up Diblokir' && (
                  <button
                    onClick={copyPaymentUrl}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Salin URL Pembayaran
                  </button>
                )}
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
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                Coba Lagi
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component untuk Success Modal
const SuccessModal = ({ success, onClose, onRefresh }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-600 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{success.title}</h3>
            <p className="text-gray-600">{success.message}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <FaSpinner className="animate-spin text-green-600 mr-3" />
              <p className="text-sm text-green-700">
                Memperbarui status invoice...
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
            >
              <FaSync className="mr-2" />
              Refresh Status
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component untuk Loading State
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Memuat data invoice...</p>
    </div>
  </div>
);

// Component untuk Error State
const ErrorState = ({ invoiceNumber, onRetry, onNavigateHome }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
    <div className="text-center max-w-md p-8">
      <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Tidak Ditemukan</h2>
      <p className="text-gray-600 mb-6">
        Invoice dengan nomor {invoiceNumber} tidak ditemukan atau telah kadaluarsa.
      </p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          Coba Lagi
        </button>
        <button
          onClick={onNavigateHome}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
        >
          Kembali ke Halaman Utama
        </button>
      </div>
    </div>
  </div>
);

// Component untuk Payment Processing Modal
const PaymentProcessingModal = ({ invoiceNumber, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Diproses</h3>
          <p className="text-gray-600">
            Anda akan diarahkan ke halaman pembayaran DOKU untuk invoice{' '}
            <span className="font-semibold">{invoiceNumber}</span>
          </p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 text-center">
            <FaBell className="inline mr-2" />
            Jika halaman tidak terbuka otomatis, periksa pop-up blocker di browser Anda.
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
);

const InvoicePage = () => {
  // Hooks
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceNumber = searchParams.get('invoice') || '';
  
  console.log("🚀 [InvoicePage] Component mounted with invoice:", invoiceNumber);
  console.log("🔗 Current URL:", window.location.href);
  
  // Refs
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const paymentPollingRef = useRef(null);
  const fetchInvoiceDataRef = useRef(null); // Ref untuk menyimpan fungsi terbaru
  
  // State
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Error and Success states
  const [error, setError] = useState({
    show: false,
    title: '',
    message: '',
    details: ''
  });
  
  const [success, setSuccess] = useState({
    show: false,
    title: '',
    message: ''
  });

  // Fetch invoice data
  const fetchInvoiceData = useCallback(async () => {
    if (!invoiceNumber) return;

    console.log("📡 [Invoice] Fetching data for invoice:", invoiceNumber);

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
      
      console.log("✅ [Invoice] Data received:", data);
      setInvoiceData(data);
    } catch (error) {
      console.error('❌ [Invoice] Error fetching data:', error);
      
      setError({
        show: true,
        title: 'Gagal Memuat Data Invoice',
        message: 'Terjadi kesalahan saat mengambil data invoice dari server.',
        details: error.message
      });
      
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
  }, [invoiceNumber]);

  // Update ref ketika fungsi berubah
  useEffect(() => {
    fetchInvoiceDataRef.current = fetchInvoiceData;
  }, [fetchInvoiceData]);

  // WebSocket connection management
  const connectWebSocket = useCallback((noresi) => {
    if (!noresi) {
      console.error("❌ [WebSocket] No invoice number provided");
      return null;
    }
    
    console.log("🔌 [WebSocket] Connecting to:", WS_URL);
    console.log("📝 [WebSocket] For invoice:", noresi);
    
    // Clean up existing connection
    if (wsRef.current) {
      console.log("🗑️ [WebSocket] Closing existing connection");
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      console.log("🗑️ [WebSocket] Clearing reconnect timeout");
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ [WebSocket] Connected successfully");
        console.log("📡 [WebSocket] ReadyState:", ws.readyState);
        
        // Register to listen for this invoice
        const registerMessage = JSON.stringify({
          event: "REGISTER_INVOICE",
          data: { noresi }
        });
        console.log("📤 [WebSocket] Sending registration:", registerMessage);
        ws.send(registerMessage);
      };

      ws.onmessage = (event) => {
        console.log("📩 [WebSocket] Raw message received:", event.data);
        try {
          const msg = JSON.parse(event.data);
          console.log("📩 [WebSocket] Parsed message:", msg);

          if (msg.event === "REGISTRATION_ACCEPTED") {
            console.log("✅ [WebSocket] Registration accepted for invoice:", msg.data?.noresi);
          }
          
          if (msg.event === "REGISTRATION_ACCEPTED" && msg.data?.noresi === noresi) {
            console.log("🎉 [WebSocket] Payment SUCCESS for invoice:", noresi);

            // Update UI
            setShowPaymentModal(false);
            
            // Show success modal
            setSuccess({
              show: true,
              title: "Pembayaran Berhasil!",
              message: `Invoice ${noresi} sudah berhasil dibayar dan diverifikasi oleh sistem.`
            });

            // Gunakan ref untuk memanggil fungsi terbaru
            if (fetchInvoiceDataRef.current) {
              console.log("🔄 [WebSocket] Calling fetchInvoiceData via ref");
              fetchInvoiceDataRef.current();
            } else {
              console.error("❌ [WebSocket] fetchInvoiceDataRef is null!");
            }
          }
        } catch (err) {
          console.error("❌ [WebSocket] Parse error:", err, "Raw:", event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ [WebSocket] Error event:", err);
        console.error("❌ [WebSocket] ReadyState:", ws.readyState);
      };

      ws.onclose = (event) => {
        console.log("🔌 [WebSocket] Closed:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        // Attempt reconnect after delay if not normal closure
        if (event.code !== 1000) {
          console.log("🔄 [WebSocket] Will reconnect in", WS_RECONNECT_DELAY, "ms");
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 [WebSocket] Attempting reconnect...");
            connectWebSocket(noresi);
          }, WS_RECONNECT_DELAY);
        }
      };
      
      return ws;
    } catch (error) {
      console.error("❌ [WebSocket] Connection error:", error);
      return null;
    }
  }, []);

  // Cleanup WebSocket and polling
  const cleanupConnections = useCallback(() => {
    console.log("🧹 Cleaning up connections...");
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (paymentPollingRef.current) {
      clearInterval(paymentPollingRef.current);
      paymentPollingRef.current = null;
    }
  }, []);

  // Handle payment
  const handlePayment = useCallback(async () => {
    if (!invoiceData) return;

    // Check if invoice is already paid
    if (invoiceData.data.invoice.payment_status === 'LUNAS') {
      setError({
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
          phone: invoiceData.data.invoice.customer_phone || '08123456789'
        },
        additional_info: {
          override_notification_url: "https://api.cleancloud.cloud/payment/notify",
          payment_type: "invoicepayment",
          invoice_id: invoiceNumber,
          customer_id: invoiceData.data.invoice.consumer_id
        },
        payment: {
          payment_due_date: 60,
          description: `Pembayaran invoice laundry: ${invoiceData.data.invoice.invoice_number}`
        }
      };

      console.log('🔄 [Payment] Sending payment data');
      
      const endpointUrl = buildApiUrl('/doku/payment');
      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      // eslint-disable-next-line no-unused-vars
      } catch (parseError) {
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(result.message || `Server error: ${response.status}`);
      }

      // Extract payment URL from response
      let paymentUrl = null;
      const responseToCheck = result.response || result.data || result;
      
      if (responseToCheck?.payment?.url) {
        paymentUrl = responseToCheck.payment.url;
      } else if (responseToCheck?.payment_url) {
        paymentUrl = responseToCheck.payment_url;
      } else if (responseToCheck?.url) {
        paymentUrl = responseToCheck.url;
      }

      if (paymentUrl) {
        console.log('🔗 [Payment] Payment URL received');
        
        // Show payment modal
        setShowPaymentModal(true);
        
        // Open payment in new tab
        const paymentWindow = window.open(paymentUrl, '_blank', 'noopener,noreferrer,width=800,height=600');
        
        if (!paymentWindow) {
          // If popup blocked, show instructions
          setError({
            show: true,
            title: 'Pop-up Diblokir',
            message: 'Browser Anda memblokir jendela pembayaran. Silakan izinkan pop-up atau klik tautan di bawah:',
            details: paymentUrl
          });
        }
        
      } else {
        throw new Error('Payment URL not found in server response');
      }
    } catch (error) {
      console.error('❌ [Payment] Error:', error);
      
      setError({
        show: true,
        title: 'Terjadi Kesalahan',
        message: 'Gagal memproses pembayaran. Silakan coba lagi.',
        details: error.message
      });
    } finally {
      setPaymentProcessing(false);
    }
  }, [invoiceData, invoiceNumber]);

  // Event handlers
  const handleErrorClose = useCallback(() => {
    setError({ show: false, title: '', message: '', details: '' });
  }, []);

  const handleErrorRetry = useCallback(() => {
    handleErrorClose();
    if (error.title === 'Gagal Memuat Data Invoice') {
      fetchInvoiceData();
    } else if (error.title === 'Gagal Memproses Pembayaran') {
      handlePayment();
    }
  }, [error.title, fetchInvoiceData, handleErrorClose, handlePayment]);

  const handleSuccessClose = useCallback(() => {
    setSuccess({ show: false, title: '', message: '' });
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  const handleSuccessRefresh = useCallback(() => {
    setSuccess({ show: false, title: '', message: '' });
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  const handlePaymentModalClose = useCallback(() => {
    setShowPaymentModal(false);
    fetchInvoiceData();
  }, [fetchInvoiceData]);

  const handleNavigateHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // Initialize WebSocket when invoice data is available
  useEffect(() => {
    console.group("🧪 [WS EFFECT] useEffect triggered");

    const noresi = invoiceNumber;
    console.log("🔎 invoiceNumber dari URL:", noresi);
    console.log("📦 invoiceData tersedia:", !!invoiceData);

    if (!noresi || !invoiceData) {
      console.log("⛔ Syarat tidak terpenuhi - noresi atau invoiceData belum ada");
      console.groupEnd();
      return;
    }

    const invoiceNumberFromData = invoiceData?.data?.invoice?.invoice_number;
    console.log("🔢 invoice_number dari data:", invoiceNumberFromData);

    if (invoiceNumberFromData) {
      console.log("🚀 Memulai WebSocket untuk invoice:", invoiceNumberFromData);
      connectWebSocket(invoiceNumberFromData);
    } else {
      console.error("❌ [WS EFFECT] invoice_number not found in data");
    }

    console.groupEnd();

    return () => {
      console.log("🧹 [WS EFFECT CLEANUP] Membersihkan WebSocket connection");
      cleanupConnections();
    };
  }, [invoiceNumber, invoiceData, connectWebSocket, cleanupConnections]);

  // Monitor WebSocket status
  useEffect(() => {
    console.log("📡 [WS MONITOR] Starting WebSocket monitor");
    
    const interval = setInterval(() => {
      const ws = wsRef.current;
      if (ws) {
        console.log("📡 [WS STATUS]", {
          readyState: ws.readyState,
          state: {
            0: 'CONNECTING',
            1: 'OPEN',
            2: 'CLOSING',
            3: 'CLOSED'
          }[ws.readyState],
          url: ws.url,
          bufferedAmount: ws.bufferedAmount
        });
      } else {
        console.log("📡 [WS STATUS] No WebSocket instance");
      }
    }, 2000);

    return () => {
      console.log("📡 [WS MONITOR] Stopping WebSocket monitor");
      clearInterval(interval);
    };
  }, []);

  // Fetch invoice data on mount
  useEffect(() => {
    console.log("📥 [INIT] Fetching invoice data on mount");
    if (invoiceNumber) {
      fetchInvoiceData();
    } else {
      console.error("❌ [INIT] No invoice number in URL");
    }
  }, [invoiceNumber, fetchInvoiceData]);

  // Debug: log state changes
  useEffect(() => {
    console.log("🔄 [STATE] invoiceData updated:", invoiceData ? "YES" : "NO");
  }, [invoiceData]);

  // Loading state
  if (loading) {
    console.log("⏳ [UI] Showing loading state");
    return <LoadingState />;
  }

  // Error state
  if (!invoiceData || !invoiceData.data) {
    console.log("❌ [UI] Showing error state - no invoice data");
    return (
      <ErrorState
        invoiceNumber={invoiceNumber}
        onRetry={fetchInvoiceData}
        onNavigateHome={handleNavigateHome}
      />
    );
  }

  const invoice = invoiceData.data.invoice;
  const laundry = invoice.laundry;
  const isPaid = invoice.payment_status === 'LUNAS';

  console.log("✅ [UI] Rendering invoice page for:", invoice.invoice_number);
  console.log("💰 Payment status:", invoice.payment_status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-600 hover:text-blue-600 transition"
                aria-label="Kembali"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invoice Laundry</h1>
                <p className="text-sm text-gray-600">Detail transaksi dan pembayaran</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <FaSync 
                onClick={fetchInvoiceData} 
                className="cursor-pointer hover:text-blue-600 transition"
                title="Refresh data"
                aria-label="Refresh data"
              />
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
              <p className="text-blue-100">
                Nomor: <span className="font-mono font-bold">{invoice.invoice_number}</span>
              </p>
              <p className="text-blue-100 text-sm mt-1">Tanggal: {invoice.created_at}</p>
              <p className="text-blue-100 text-sm">
                Jumlah Item: {invoice.items.length} jenis layanan
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-3xl font-bold mb-2">{formatCurrency(invoice.total)}</div>
                <div className="flex items-center justify-end">
                  {getPaymentStatusBadge(invoice.payment_status)}
                  <span className="ml-3 text-sm bg-white/20 px-3 py-1 rounded-full">
                    {invoice.pickup_status}
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
                    <p className="font-medium">{invoice.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium flex items-center">
                      <FaPhone className="mr-2 text-gray-400" />
                      {invoice.customer_phone}
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
                    <p className="font-medium">{laundry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alamat</p>
                    <p className="font-medium flex items-start">
                      <FaMapMarkerAlt className="mr-2 text-gray-400 mt-1 flex-shrink-0" />
                      {laundry.address}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Telepon</p>
                    <p className="font-medium">{laundry.phone}</p>
                  </div>

                  {/* WhatsApp Button */}
                  <div className="mt-4">
                    <WhatsAppButton
                      phone={laundry.phone}
                      invoiceNumber={invoice.invoice_number}
                      laundryName={laundry.name}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  Detail Pesanan ({invoice.items.length} Items)
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
                    {invoice.items.map((item) => (
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
                              <div className="text-xs text-gray-500 mt-1">
                                {item.work_status_progress}% selesai
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.service_name}</span>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="mr-2" />
                      <span>Jatuh Tempo: {invoice.due_date}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      <span>
                        Status: {invoice.payment_status === 'LUNAS' ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <FaBox className="mr-2" />
                      <span>Jumlah Item: {invoice.items.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Button atau Status LUNAS */}
              <div className="w-full mt-6">
                {isPaid ? (
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

            {/* Real-time Status Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <FaBell className="mr-2" />
                Status Real-time
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Sistem akan memberi notifikasi otomatis ketika pembayaran berhasil diverifikasi.
              </p>
              <div className="flex items-center text-sm">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  wsRef.current?.readyState === WebSocket.OPEN 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-gray-400'
                }`} />
                <span className="text-blue-600">
                  {wsRef.current?.readyState === WebSocket.OPEN 
                    ? 'Terhubung ke server pembayaran' 
                    : 'Menghubungkan...'}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            {!isPaid && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-semibold text-yellow-800 mb-3">Pembayaran via CleanCloud</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  Semua pembayaran diproses melalui sistem payment gateway CleanCloud yang aman dan terpercaya.
                </p>
                <div className="text-xs text-yellow-600">
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

            {/* Important Notes */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Catatan Penting</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Pembayaran akan meng-cover semua item dalam invoice</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Untuk pertanyaan, hubungi: {laundry.phone}</span>
                </li>
                <li className="flex items-start">
                  <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                  <span>Simpan invoice ini sebagai bukti transaksi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentProcessingModal
          invoiceNumber={invoice.invoice_number}
          onClose={handlePaymentModalClose}
        />
      )}
      {success.show && (
        <SuccessModal
          success={success}
          onClose={handleSuccessClose}
          onRefresh={handleSuccessRefresh}
        />
      )}
      {error.show && (
        <ErrorModal
          error={error}
          onClose={handleErrorClose}
          onRetry={handleErrorRetry}
        />
      )}

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} {laundry.name}. All rights reserved.
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
                href={`tel:${laundry.phone}`}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Butuh Bantuan? Hubungi: {laundry.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;