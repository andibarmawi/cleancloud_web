import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaUser, 
  FaHome, 
  FaBuilding, 
  FaFileInvoice, 
  FaCalendarAlt,
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaClock,
  FaExclamationCircle,
  FaCreditCard,
  FaHistory,
  FaArrowLeft,
  FaPhone,
  FaSpinner,
  FaFilter,
  FaSortAmountDown,
  FaPrint,
  FaBell,
  FaTshirt,
  FaMoneyCheck,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaLock,
  FaExpand,
  FaCompress,
  FaDesktop,
  FaMobileAlt,
  FaTimes,
  FaExclamationTriangle,
  FaArrowRight
} from 'react-icons/fa';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { buildApiUrl } from "../apiConfig";

// Constants untuk status WebSocket
const WS_URL = "wss://api.cleancloud.cloud/ws";
const WS_RECONNECT_DELAY = 5000;
const WS_HEARTBEAT_INTERVAL = 30000; // 30 detik
const WS_CONNECTION_TIMEOUT = 10000; // 10 detik
const MAX_RECONNECT_ATTEMPTS = 5;

// Component untuk Mobile Redirect Dialog
const MobileRedirectDialog = ({ paymentUrl, description, onClose, onRedirect }) => {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Handle redirect dengan useEffect terpisah
  const handleRedirect = useCallback(() => {
    setIsRedirecting(true);
    if (paymentUrl) {
      // Simpan informasi untuk kembali ke halaman ini setelah pembayaran
      sessionStorage.setItem('returnAfterPayment', 'true');
      sessionStorage.setItem('paymentDescription', description);
      
      // Redirect ke halaman DOKU
      window.location.href = paymentUrl;
    }
    onRedirect();
  }, [paymentUrl, description, onRedirect]);

  // Effect untuk countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Set flag untuk melakukan redirect
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldRedirect(true);
    }
  }, [countdown]);

  // Effect untuk melakukan redirect ketika flag di-set
  useEffect(() => {
    if (shouldRedirect && !isRedirecting) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleRedirect();
    }
  }, [shouldRedirect, isRedirecting, handleRedirect]);

  const handleCancel = () => {
    onClose();
  };

  const handleOpenInNewTab = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Menuju Pembayaran DOKU</h3>
              <p className="text-sm text-gray-600 mt-1">Untuk pengalaman pembayaran yang optimal</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <FaExclamationCircle className="text-blue-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Perhatian untuk Pengguna Mobile</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Halaman pembayaran DOKU lebih optimal jika dibuka langsung di browser.
                    Anda akan diarahkan ke halaman pembayaran DOKU.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-semibold">Pembayaran:</span> {description}
              </p>
              <p className="text-xs text-gray-500">
                Setelah selesai pembayaran, Anda akan dikembalikan ke halaman ini.
              </p>
            </div>

            {countdown > 0 ? (
              <div className="text-center">
                <p className="text-gray-600 mb-2">
                  Redirect otomatis dalam:
                </p>
                <div className="text-3xl font-bold text-blue-600">
                  {countdown}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Mengarahkan ke DOKU...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setShouldRedirect(true)}
              disabled={isRedirecting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center disabled:opacity-50"
            >
              {isRedirecting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Mengarahkan...
                </>
              ) : (
                <>
                  <FaArrowRight className="mr-2" />
                  Lanjut ke DOKU Sekarang
                </>
              )}
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
            >
              <FaExternalLinkAlt className="mr-2" />
              Buka di Tab Baru
            </button>

            <button
              onClick={handleCancel}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-3 px-4 rounded-lg transition"
            >
              Batalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component untuk Payment Modal (untuk desktop)
const PaymentModal = ({ paymentUrl, isBulkPayment, description, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAlternateOption, setShowAlternateOption] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('desktop');
  const iframeRef = useRef(null);

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('✅ [PaymentModal] Iframe loaded successfully');
  };

  const handleIframeError = () => {
    console.error('❌ [PaymentModal] Iframe failed to load');
    setError('Gagal memuat halaman pembayaran. Silakan coba metode lain.');
    setIsLoading(false);
    setShowAlternateOption(true);
  };

  const handleOpenInNewTab = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  const handleCopyPaymentUrl = () => {
    if (paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      alert('URL pembayaran telah disalin ke clipboard!');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop');
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${isFullscreen ? 'z-60' : ''}`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col ${
        isFullscreen ? 'h-[95vh] w-[95vw] max-w-none' : 'max-w-6xl h-[85vh]'
      }`}>
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FaLock className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isBulkPayment ? 'Pembayaran Bulk' : 'Pembayaran Invoice'}
                </h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <button
                onClick={toggleViewMode}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                title={viewMode === 'desktop' ? 'Switch to Mobile View' : 'Switch to Desktop View'}
              >
                {viewMode === 'desktop' ? <FaMobileAlt /> : <FaDesktop />}
              </button>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                aria-label="Tutup modal pembayaran"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>
          
          {/* Security Info */}
          <div className="mt-3 bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center justify-center">
              <FaLock className="text-blue-600 mr-2" />
              <span className="text-sm text-blue-700">
                Transaksi Anda aman dan terenkripsi melalui DOKU Payment Gateway
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          {/* Error State */}
          {error ? (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center max-w-md">
                <FaExclamationCircle className="text-5xl text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-900 mb-2">Gagal Memuat Pembayaran</h4>
                <p className="text-gray-600 mb-6">{error}</p>
                
                {showAlternateOption && (
                  <div className="space-y-3">
                    <button
                      onClick={handleOpenInNewTab}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
                    >
                      <FaExternalLinkAlt className="mr-2" />
                      Buka di Tab Baru
                    </button>
                    <button
                      onClick={handleCopyPaymentUrl}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition"
                    >
                      Salin Link Pembayaran
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col relative">
              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Memuat halaman pembayaran...</p>
                    <p className="text-sm text-gray-500 mt-2">Harap tunggu sebentar</p>
                  </div>
                </div>
              )}
              
              {/* Iframe Container */}
              <div className={`flex-1 relative overflow-hidden border border-gray-200 rounded-xl ${
                viewMode === 'mobile' ? 'max-w-md mx-auto w-full' : 'w-full'
              }`}>
                {/* View Mode Indicator */}
                <div className="absolute top-2 right-2 z-10">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    viewMode === 'mobile' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {viewMode === 'mobile' ? 'Mobile View' : 'Desktop View'}
                  </span>
                </div>
                
                {/* Iframe dengan responsive styling */}
                <iframe
                  ref={iframeRef}
                  src={paymentUrl}
                  title="Payment Gateway"
                  className={`absolute inset-0 w-full h-full border-0 ${
                    viewMode === 'mobile' ? 'max-w-md mx-auto' : ''
                  }`}
                  sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-modals"
                  allow="payment; fullscreen; autoplay; camera; microphone"
                  allowFullScreen
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  style={{
                    minHeight: '600px'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-3 sm:mb-0">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Tips:</span> Pastikan mengisi semua data dengan benar untuk proses yang lancar
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={toggleViewMode}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center text-sm"
              >
                {viewMode === 'desktop' ? <FaMobileAlt className="mr-2" /> : <FaDesktop className="mr-2" />}
                {viewMode === 'desktop' ? 'Mobile View' : 'Desktop View'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center text-sm"
              >
                {isFullscreen ? <FaCompress className="mr-2" /> : <FaExpand className="mr-2" />}
                {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
              </button>
              <button
                onClick={handleOpenInNewTab}
                className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center text-sm"
              >
                <FaExternalLinkAlt className="mr-2" />
                Buka di Tab Baru
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  
  // State utama
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // State untuk payment
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showMobileRedirectDialog, setShowMobileRedirectDialog] = useState(false);
  
  // State untuk melacak pembayaran terbaru
  const [recentPayments, setRecentPayments] = useState([]);
  
  // State untuk konfirmasi modal
  const [paymentConfirmModal, setPaymentConfirmModal] = useState({
    isOpen: false,
    invoice: null,
    isBulkPayment: false,
    invoiceNumber: '',
    amount: 0,
    description: '',
    unpaidCount: 0
  });

  // WebSocket Refs
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  
  // Ref untuk menyimpan fungsi terbaru
  const fetchCustomerDataRef = useRef(null);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      
      // Check if returning from payment
      if (isMobile && sessionStorage.getItem('returnAfterPayment') === 'true') {
        const paymentDescription = sessionStorage.getItem('paymentDescription');
        if (paymentDescription) {
          setPaymentSuccess(true);
          setTimeout(() => {
            alert(`✅ Pembayaran ${paymentDescription} berhasil diproses!`);
          }, 1000);
        }
        
        // Clear session storage
        sessionStorage.removeItem('returnAfterPayment');
        sessionStorage.removeItem('paymentDescription');
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fungsi untuk menambahkan invoice yang baru dibayar
  const addRecentPayment = useCallback((invoiceNumber) => {
    setRecentPayments(prev => [...prev, {
      invoiceNumber,
      timestamp: Date.now()
    }]);
    
    // Hapus dari list setelah 10 menit
    setTimeout(() => {
      setRecentPayments(prev => 
        prev.filter(p => p.invoiceNumber !== invoiceNumber)
      );
    }, 10 * 60 * 1000); // 10 menit
  }, []);

  // Fungsi untuk mengecek apakah ini pembayaran terbaru
  const checkIfRecentPayment = useCallback((invoiceNumber) => {
    return recentPayments.some(p => p.invoiceNumber === invoiceNumber);
  }, [recentPayments]);

  // Fetch customer data
  const fetchCustomerData = useCallback(async () => {
    console.group('[fetchCustomerData]');
    console.log('Customer ID:', customerId);

    try {
      setLoading(true);
      setError(null);
      console.log('Loading: true');

      const url = buildApiUrl(`/public/1/customers/${customerId}`);
      console.log('Request URL:', url);

      const response = await fetch(url);
      console.log('HTTP Status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API Response:', data);

      if (!data.success) {
        throw new Error(data.message || 'API Error');
      }

      // Validasi dan transformasi data
      console.log('Validating & transforming data...');
      const validatedData = validateAndTransformData(data);
      console.log('Validated Data:', validatedData);

      setCustomerData(validatedData);
      console.log('✅ [Customer] Data loaded successfully');

    } catch (error) {
      console.error('❌ [Customer] Fetch error:', error);
      console.error('Error message:', error.message);

      setError('Gagal memuat data pelanggan. Silakan coba lagi.');

      // Mock data untuk development
      console.warn('⚠️ [Customer] Using mock data');
      const mockData = createMockData();
      console.log('Mock Data:', mockData);

      setCustomerData(mockData);
    } finally {
      setLoading(false);
      console.log('Loading: false');
      console.groupEnd();
    }
  }, [customerId]);

  // Update ref ketika fungsi berubah
  useEffect(() => {
    fetchCustomerDataRef.current = fetchCustomerData;
  }, [fetchCustomerData]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    console.log("🔌 [WebSocket] Connecting to:", WS_URL);
    console.log("👤 [WebSocket] For customer ID:", customerId);
    
    // Clean up existing connection
    if (wsRef.current) {
      console.log("🗑️ [WebSocket] Closing existing connection");
      wsRef.current.close(1000, "Reconnecting");
      wsRef.current = null;
    }
    
    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ [WebSocket] Connected successfully");
        reconnectAttemptsRef.current = 0;
        
        // Clear connection timeout
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Register customer to WebSocket
        if (customerId) {
          const registerMessage = JSON.stringify({
            event: "REGISTER_CUSTOMER",
            data: { customer_id: customerId }
          });
          console.log("📤 [WebSocket] Registering customer:", customerId);
          ws.send(registerMessage);
        }
        
        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const pingMessage = JSON.stringify({
              event: "PING",
              timestamp: Date.now(),
              customer_id: customerId
            });
            ws.send(pingMessage);
            console.log("❤️ [WebSocket] Sending heartbeat");
          }
        }, WS_HEARTBEAT_INTERVAL);
      };

      ws.onmessage = (event) => {
        console.log("📩 [WebSocket] Raw message received:", event.data);
        try {
          const msg = JSON.parse(event.data);
          console.log("📩 [WebSocket] Parsed message:", msg);

          // HANDLER UTAMA: REGISTRATION_ACCEPTED (untuk semua update)
          if (msg.event === "REGISTRATION_ACCEPTED") {
            console.log("✅ [WebSocket] Registration accepted:", msg.data?.noresi || msg.data?.customer_id);
            
            // Jika ada noresi (invoice), refresh data
            if (msg.data?.noresi) {
              console.log("🔄 [WebSocket] Invoice update detected:", msg.data.noresi);
              
              // Tandai sebagai payment success
              setPaymentSuccess(true);
              
              // Refresh customer data dengan debounce
              if (fetchCustomerDataRef.current) {
                console.log("🔄 [WebSocket] Scheduling data refresh...");
                
                // Clear existing timeout
                if (window.refreshTimeout) {
                  clearTimeout(window.refreshTimeout);
                }
                
                // Debounce refresh untuk menghindari multiple calls
                window.refreshTimeout = setTimeout(() => {
                  console.log("🔄 [WebSocket] Executing data refresh...");
                  fetchCustomerDataRef.current();
                }, 1500); // Tunggu 1.5 detik
              }
              
              // Tampilkan notifikasi ke user
              setTimeout(() => {
                const invoiceNumber = msg.data.noresi;
                const isRecent = checkIfRecentPayment(invoiceNumber);
                
                if (isRecent) {
                  alert(`✅ Pembayaran untuk invoice ${invoiceNumber} berhasil! Data telah diperbarui.`);
                } else {
                  console.log(`🔄 [WebSocket] Invoice ${invoiceNumber} status updated`);
                }
              }, 600);
            }
            
            // Jika hanya customer registration, log saja
            else if (msg.data?.customer_id) {
              console.log("✅ [WebSocket] Customer registration confirmed");
            }
          }
          
          // Handler untuk PONG response
          if (msg.event === "PONG") {
            console.log("❤️ [WebSocket] Heartbeat response received");
          }
          
        } catch {
          console.error("❌ [WebSocket] Parse error, Raw:", event.data);
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
        
        // Cleanup intervals
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }
        
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
        
        // Attempt reconnect after delay if not normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 [WebSocket] Will reconnect in ${WS_RECONNECT_DELAY}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("🔄 [WebSocket] Attempting reconnect...");
            connectWebSocket();
          }, WS_RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.log("🚫 [WebSocket] Max reconnection attempts reached");
        }
      };
      
      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log("⏰ [WebSocket] Connection timeout");
          ws.close();
        }
      }, WS_CONNECTION_TIMEOUT);
      
      return ws;
    } catch (error) {
      console.error("❌ [WebSocket] Connection error:", error);
      return null;
    }
  }, [customerId, checkIfRecentPayment]);

  // Cleanup WebSocket connections
  const cleanupWebSocket = useCallback(() => {
    console.log("🧹 [WebSocket] Cleaning up connections...");
    
    if (wsRef.current) {
      wsRef.current.close(1000, "Component unmounting");
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    // Clear global refresh timeout
    if (window.refreshTimeout) {
      clearTimeout(window.refreshTimeout);
      window.refreshTimeout = null;
    }
    
    reconnectAttemptsRef.current = 0;
  }, []);

  // Initialize WebSocket when component mounts and customerId is available
  useEffect(() => {
    console.log("🚀 [CustomerDashboard] Component mounted");
    
    if (customerId) {
      console.log("🔌 [WebSocket] Initializing WebSocket for customer:", customerId);
      connectWebSocket();
    } else {
      console.error("❌ [WebSocket] No customerId available");
    }
    
    return () => {
      console.log("🧹 [CustomerDashboard] Component unmounting, cleaning up...");
      cleanupWebSocket();
    };
  }, [customerId, connectWebSocket, cleanupWebSocket]);

  // Monitor WebSocket status (optional, untuk debugging)
  useEffect(() => {
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
          url: ws.url
        });
      }
    }, 10000); // Check setiap 10 detik
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchCustomerData();
  }, [customerId, fetchCustomerData]);

  // Handle WebSocket reconnection when customerId changes
  useEffect(() => {
    if (customerId && wsRef.current) {
      console.log("🔄 [WebSocket] Customer ID changed, reconnecting...");
      cleanupWebSocket();
      setTimeout(() => connectWebSocket(), 100);
    }
  }, [customerId, connectWebSocket, cleanupWebSocket]);

  const getProcessingStatusBadge = useCallback((status) => {
    if (!status) return null;

    const statusConfig = {
      'SELESAI': { 
        color: 'bg-green-100 text-green-800', 
        icon: <FaCheckCircle className="mr-1" />,
        text: 'SELESAI'
      },
      'DALAM PROSES': { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <FaSpinner className="animate-spin mr-1" />,
        text: 'DALAM PROSES'
      },
      'MENUNGGU': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <FaClock className="mr-1" />,
        text: 'MENUNGGU'
      },
      'DIAMBIL': { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <FaTshirt className="mr-1" />,
        text: 'DIAMBIL'
      },
      'BATAL': { 
        color: 'bg-red-100 text-red-800', 
        icon: <FaExclamationCircle className="mr-1" />,
        text: 'BATAL'
      }
    };
    
    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FaClock className="mr-1" />,
      text: status 
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  }, []);

  const openWhatsApp = useCallback(() => {
    if (!customerData?.data?.laundry?.phone) {
      alert('Nomor telepon laundry tidak tersedia.');
      return;
    }

    // Format nomor telepon
    let phoneNumber = customerData.data.laundry.phone;
    
    // Hapus karakter non-digit
    phoneNumber = phoneNumber.replace(/\D/g, '');
    
    // Jika diawali dengan 0, ganti dengan 62
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '62' + phoneNumber.substring(1);
    }
    
    // Pastikan diawali dengan 62
    if (!phoneNumber.startsWith('62')) {
      phoneNumber = '62' + phoneNumber;
    }
    
    // Nama pelanggan
    const customerName = customerData.data.customer.name || 'Pelanggan';
    
    // Pesan default
    const message = `Halo ${customerData.data.laundry.name || 'Laundry'}! 👋\n\nSaya ${customerName}, ingin menanyakan tentang status laundry saya.\n\nTerima kasih.`;
    
    // Encode message untuk URL
    const encodedMessage = encodeURIComponent(message);
    
    // Buat URL WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Buka WhatsApp di tab baru
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, [customerData]);
  
  // Fungsi untuk kembali ke halaman sebelumnya
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1); // Kembali ke halaman sebelumnya
    } else {
      navigate('/'); // Fallback ke home jika tidak ada history
    }
  }, [navigate]);

  const validateAndTransformData = (data) => {
    if (!data || !data.data) {
      throw new Error('Data tidak valid');
    }

    const { data: apiData } = data;
    
    // Ensure customer exists
    if (!apiData.customer) {
      throw new Error('Data pelanggan tidak ditemukan');
    }

    // Ensure laundry exists
    if (!apiData.laundry) {
      apiData.laundry = {
        name: 'Laundry Tidak Tersedia',
        address: 'Alamat tidak tersedia',
        phone: 'Telepon tidak tersedia'
      };
    }

    // Ensure kosan exists (create fallback if not present)
    if (!apiData.kosan) {
      apiData.kosan = {
        name: 'Kosan Tidak Tersedia',
        address: apiData.customer.room || 'Alamat tidak tersedia'
      };
    }

    // Ensure invoices array exists
    if (!Array.isArray(apiData.invoices)) {
      apiData.invoices = [];
    }

    // Ensure summary exists with all required properties
    if (!apiData.summary) {
      apiData.summary = {
        total_transaction: apiData.invoices.length || 0,
        total_unpaid: calculateTotalUnpaid(apiData.invoices),
        total_paid: calculateTotalPaid(apiData.invoices),
        total_processing: 0,
        total_ready: 0,
        last_transaction: getLastTransactionDate(apiData.invoices)
      };
    } else {
      // Ensure all summary properties exist
      apiData.summary = {
        total_transaction: apiData.summary.total_transaction || apiData.invoices.length || 0,
        total_unpaid: apiData.summary.total_unpaid || calculateTotalUnpaid(apiData.invoices),
        total_paid: apiData.summary.total_paid || calculateTotalPaid(apiData.invoices),
        total_processing: apiData.summary.total_processing || 0,
        total_ready: apiData.summary.total_ready || 0,
        last_transaction: apiData.summary.last_transaction || getLastTransactionDate(apiData.invoices)
      };
    }

    return data;
  };

  const calculateTotalUnpaid = (invoices) => {
    if (!Array.isArray(invoices)) return 0;
    return invoices
      .filter(invoice => invoice.status === 'UNPAID')
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  };

  const calculateTotalPaid = (invoices) => {
    if (!Array.isArray(invoices)) return 0;
    return invoices
      .filter(invoice => invoice.status === 'PAID')
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
  };

  const getLastTransactionDate = (invoices) => {
    if (!Array.isArray(invoices) || invoices.length === 0) return new Date().toISOString();
    
    const sortedInvoices = [...invoices].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return sortedInvoices[0].date || new Date().toISOString();
  };

  const createMockData = () => {
    return {
      success: true,
      message: "Data pelanggan berhasil dimuat (Mock Data)",
      data: {
        status: true,
        customer: {
          id: parseInt(customerId) || 21,
          name: "Pelanggan Tidak Ditemukan",
          room: "-",
          phone: "-",
          email: "-",
          join_date: new Date().toISOString()
        },
        laundry: {
          id: 1,
          name: "Laundry Default",
          address: "Alamat default",
          phone: "(021) 0000000"
        },
        kosan: {
          id: 1,
          name: "Kosan Default",
          address: "Alamat kosan default"
        },
        invoices: [],
        summary: {
          total_transaction: 0,
          total_unpaid: 0,
          total_paid: 0,
          total_processing: 0,
          total_ready: 0,
          last_transaction: new Date().toISOString()
        }
      }
    };
  };

  const formatCurrency = useCallback((amount) => {
    if (!amount || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      if (!dateString) return 'Tanggal tidak tersedia';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Tanggal tidak valid';
      
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('id-ID', options);
    } catch {
      return 'Tanggal tidak tersedia';
    }
  }, []);

  const getStatusBadge = useCallback((status) => {
    if (!status) return null;

    const statusConfig = {
      'UNPAID': { 
        color: 'bg-red-100 text-red-800', 
        icon: <FaExclamationCircle className="mr-1" />,
        text: 'BELUM LUNAS'
      },
      'PAID': { 
        color: 'bg-green-100 text-green-800', 
        icon: <FaCheckCircle className="mr-1" />,
        text: 'LUNAS'
      },
      'PROCESSING': { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <FaSpinner className="animate-spin mr-1" />,
        text: 'SEDANG DIPROSES'
      },
      'READY': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <FaBell className="mr-1" />,
        text: 'SIAP DIAMBIL'
      }
    };
    
    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FaClock className="mr-1" />,
      text: status 
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  }, []);

  const getPickupStatusBadge = useCallback((status) => {
    if (!status) return null;

    const statusConfig = {
      'BELUM DIAMBIL': { 
        color: 'bg-red-100 text-red-800', 
        icon: <FaClock className="mr-1" />
      },
      'SUDAH DIAMBIL': { 
        color: 'bg-green-100 text-green-800', 
        icon: <FaCheckCircle className="mr-1" />
      },
      'SEDANG PROSES': { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <FaSpinner className="animate-spin mr-1" />
      },
      'SIAP DIAMBIL': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <FaBell className="mr-1" />
      }
    };
    
    const config = statusConfig[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: <FaClock className="mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {status}
      </span>
    );
  }, []);

  // Fungsi untuk membuka modal konfirmasi pembayaran
  const openPaymentConfirmation = useCallback((invoice = null, isBulkPayment = false) => {
    let invoiceNumber;
    let amount;
    let description;
    let unpaidCount = 0;

    if (isBulkPayment) {
      // Untuk pembayaran semua tagihan
      const unpaidInvoices = customerData?.data?.invoices?.filter(inv => inv.status === 'UNPAID') || [];
      invoiceNumber = `BULK-${Date.now()}-${customerData?.data?.customer?.id || 'CUSTOMER'}`;
      amount = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      unpaidCount = unpaidInvoices.length;
      description = `Bayar ${unpaidCount} tagihan sekaligus`;
    } else {
      // Untuk pembayaran single invoice
      invoiceNumber = `ONL-${invoice.invoice}`;
      amount = invoice.total || 0;
      description = `Bayar invoice ${invoice.invoice}`;
    }

    setPaymentConfirmModal({
      isOpen: true,
      invoice,
      isBulkPayment,
      invoiceNumber,
      amount,
      description,
      unpaidCount
    });
  }, [customerData]);

  const closePaymentConfirmation = useCallback(() => {
    setPaymentConfirmModal({
      isOpen: false,
      invoice: null,
      isBulkPayment: false,
      invoiceNumber: '',
      amount: 0,
      description: '',
      unpaidCount: 0
    });
  }, []);

  // Fungsi untuk mendaftarkan invoice ke WebSocket setelah pembayaran dibuat
  const registerInvoiceToWebSocket = useCallback((invoiceNumber) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && invoiceNumber) {
      // Register invoice untuk real-time updates
      const registerMessage = JSON.stringify({
        event: "REGISTER_INVOICE",
        data: { noresi: invoiceNumber }
      });
      console.log("📤 [WebSocket] Registering invoice for real-time updates:", invoiceNumber);
      wsRef.current.send(registerMessage);
      
      // Juga register customer untuk update umum
      if (customerId) {
        const customerMessage = JSON.stringify({
          event: "REGISTER_CUSTOMER",
          data: { customer_id: customerId }
        });
        wsRef.current.send(customerMessage);
        console.log("📤 [WebSocket] Also registering customer:", customerId);
      }
    } else {
      console.warn("⚠️ [WebSocket] Cannot register invoice - WebSocket not ready or no invoice number");
    }
  }, [customerId]);

  // Fungsi handlePayment untuk pembayaran
  const confirmPayment = useCallback(async () => {
    const { isBulkPayment, invoiceNumber, amount } = paymentConfirmModal;
    
    // TAMBAHKAN: Simpan invoice yang akan dibayar untuk tracking
    if (!isBulkPayment && paymentConfirmModal.invoice?.invoice) {
      addRecentPayment(paymentConfirmModal.invoice.invoice);
      console.log("📝 [Payment] Tracking invoice:", paymentConfirmModal.invoice.invoice);
    } else if (isBulkPayment) {
      // Untuk bulk payment, ambil semua invoice unpaid
      const unpaidInvoices = customerData?.data?.invoices
        ?.filter(inv => inv.status === 'UNPAID')
        .map(inv => inv.invoice) || [];
      
      unpaidInvoices.forEach(inv => {
        addRecentPayment(inv);
        console.log("📝 [Payment] Tracking bulk invoice:", inv);
      });
    }
    
    closePaymentConfirmation();
    
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      setPaymentSuccess(false);

      const customerName = customerData?.data?.customer?.name || 'Pelanggan';
      const customerEmail = `andibarmawi@gmail.com`;
      const customerPhone = '08123456789';
      const customerId = customerData?.data?.customer?.id || 'UNKNOWN';

      const paymentData = {
        order: {
          invoice_number: invoiceNumber,
          amount: amount,
          currency: "IDR",
        },
        customer: {
          id: `USER-${customerId}`,
          name: customerName,
          email: customerEmail,
          phone: customerPhone
        },
        additional_info: {
          override_notification_url: "https://api.cleancloud.cloud/payment/notify",
          payment_type: isBulkPayment ? "bulkpayment" : "singlepayment"
        },
        payment: {
          payment_due_date: 60
        }
      };

      console.log('🔄 [PAYMENT] Sending payment data:', paymentData);
      console.log('📋 [PAYMENT] Payment Type:', isBulkPayment ? 'BULK PAYMENT' : 'SINGLE PAYMENT');
      console.log('💰 [PAYMENT] Amount:', formatCurrency(amount));
      
      const endpointUrl = buildApiUrl('/doku/payment');

      console.log('🔗 [PAYMENT] Endpoint URL:', endpointUrl);

      const response = await fetch(endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      console.log('📡 [PAYMENT] Response Status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('📄 [PAYMENT] Raw Response Text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ [PAYMENT] Parsed Response:', result);
      } catch {
        console.error('❌ [PAYMENT] JSON Parse Error');
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('❌ [PAYMENT] Server Error Response:', result);
        throw new Error(result.message || `Server error: ${response.status} ${response.statusText}`);
      }

      if (result.success || (result.response && result.response.payment && result.response.payment.url)) {
        console.log('✅ [PAYMENT] Payment created successfully:', result);
        
        let paymentUrlFromResponse = null;
        
        if (result.response && result.response.payment && result.response.payment.url) {
          paymentUrlFromResponse = result.response.payment.url;
          console.log('🔗 [PAYMENT] Found payment URL in result.response.payment.url:', paymentUrlFromResponse);
        } else if (result.data && result.data.payment_url) {
          paymentUrlFromResponse = result.data.payment_url;
          console.log('🔗 [PAYMENT] Found payment URL in result.data.payment_url:', paymentUrlFromResponse);
        } else if (result.data && result.data.url) {
          paymentUrlFromResponse = result.data.url;
          console.log('🔗 [PAYMENT] Found payment URL in result.data.url:', paymentUrlFromResponse);
        } else if (result.payment_url) {
          paymentUrlFromResponse = result.payment_url;
          console.log('🔗 [PAYMENT] Found payment URL in result.payment_url:', paymentUrlFromResponse);
        } else if (result.url) {
          paymentUrlFromResponse = result.url;
          console.log('🔗 [PAYMENT] Found payment URL in result.url:', paymentUrlFromResponse);
        }

        if (paymentUrlFromResponse) {
          console.log('🔗 [PAYMENT] Payment URL received:', paymentUrlFromResponse);
          setPaymentUrl(paymentUrlFromResponse);
          
          // Check if mobile view, show redirect dialog
          if (isMobileView) {
            setShowMobileRedirectDialog(true);
          }
          // Desktop akan menampilkan iframe melalui PaymentModal
          
          // Register invoice to WebSocket for real-time updates
          if (!isBulkPayment && paymentConfirmModal.invoice?.invoice) {
            registerInvoiceToWebSocket(paymentConfirmModal.invoice.invoice);
          } else if (isBulkPayment) {
            // Untuk bulk payment, register customer saja
            if (customerId && wsRef.current?.readyState === WebSocket.OPEN) {
              const customerMessage = JSON.stringify({
                event: "REGISTER_CUSTOMER",
                data: { customer_id: customerId }
              });
              wsRef.current.send(customerMessage);
              console.log("📤 [WebSocket] Registered customer for bulk payment updates");
            }
          }
        } else {
          console.warn('⚠️ [PAYMENT] No payment URL found in response');
          throw new Error('URL pembayaran tidak ditemukan dalam response server');
        }
      } else {
        console.error('❌ [PAYMENT] API returned unsuccessful response:', result);
        throw new Error(result.message || result.response?.message?.[0] || 'Pembayaran gagal dibuat');
      }
      
    } catch (error) {
      console.error('❌ [PAYMENT] Error:', error);
      setPaymentError(error.message);
      // Tampilkan alert untuk error
      alert(`Error pembayaran: ${error.message}`);
    } finally {
      console.log('🏁 [PAYMENT] Process completed');
      setPaymentLoading(false);
      
      // Fallback refresh jika WebSocket tidak bekerja
      setTimeout(() => {
        console.log('🔄 [PAYMENT] Fallback: Refreshing customer data...');
        fetchCustomerData();
      }, 10000); // Fallback setelah 10 detik
    }
  }, [paymentConfirmModal, customerData, fetchCustomerData, formatCurrency, closePaymentConfirmation, registerInvoiceToWebSocket, addRecentPayment, isMobileView]);

  const handlePayNow = useCallback((invoice) => {
    if (!invoice || !invoice.invoice) {
      alert('Invoice tidak valid');
      return;
    }
    
    if (invoice.status !== 'UNPAID') {
      alert('Invoice ini sudah lunas atau tidak memerlukan pembayaran');
      return;
    }
    
    openPaymentConfirmation(invoice, false);
  }, [openPaymentConfirmation]);

  const handlePayAllUnpaid = useCallback(() => {
    const unpaidInvoices = customerData?.data?.invoices?.filter(inv => inv.status === 'UNPAID') || [];
    
    if (unpaidInvoices.length === 0) {
      alert('Tidak ada tagihan yang belum lunas.');
      return;
    }

    openPaymentConfirmation(null, true);
  }, [customerData, openPaymentConfirmation]);

  const handleMobileRedirectDialogClose = useCallback(() => {
    setShowMobileRedirectDialog(false);
    setPaymentUrl(null);
    fetchCustomerData();
  }, [fetchCustomerData]);

  const handlePaymentModalClose = useCallback(() => {
    setPaymentUrl(null);
    fetchCustomerData();
  }, [fetchCustomerData]);

  // Filter dan sort invoices
  const filteredInvoices = customerData?.data?.invoices
    ?.filter(invoice => {
      if (!invoice || !invoice.status) return false;
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'UNPAID') return invoice.status === 'UNPAID';
      if (filterStatus === 'NOT_PICKED') return invoice.pickup_status === 'BELUM DIAMBIL';
      if (filterStatus === 'SELESAI') return invoice.status_pengerjaan === 'SELESAI';
      if (filterStatus === 'DALAM PROSES') return invoice.status_pengerjaan === 'DALAM PROSES';
      if (filterStatus === 'MENUNGGU') return invoice.status_pengerjaan === 'MENUNGGU';
      return invoice.status === filterStatus;
    })
    ?.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'date':
          { const dateA = a.date ? new Date(a.date) : new Date(0);
          const dateB = b.date ? new Date(b.date) : new Date(0);
          comparison = dateB - dateA;
          break; }
        case 'total':
          { const totalA = a.total || 0;
          const totalB = b.total || 0;
          comparison = totalB - totalA;
          break; }
        case 'status':
          { const statusA = a.status || '';
          const statusB = b.status || '';
          comparison = statusA.localeCompare(statusB);
          break; }
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    }) || [];

  // Hitung jumlah tagihan yang belum lunas
  const unpaidInvoicesCount = customerData?.data?.invoices?.filter(inv => inv.status === 'UNPAID').length || 0;
  const unpaidTotalAmount = customerData?.data?.invoices
    ?.filter(inv => inv.status === 'UNPAID')
    ?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;

  // WebSocket Status Indicator Component
  const WebSocketStatus = () => {
    const ws = wsRef.current;
    const isConnected = ws?.readyState === WebSocket.OPEN;
    
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`flex items-center px-3 py-2 rounded-full shadow-lg ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
          }`} />
          <span className="text-sm font-medium">
            {isConnected ? 'Real-time Active' : 'Connecting...'}
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  if (error && (!customerData || !customerData.data)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCustomerData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaSpinner className="mr-2" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* WebSocket Status Indicator */}
      <WebSocketStatus />

      {/* Payment Modal untuk Desktop */}
      {!isMobileView && paymentUrl && (
        <PaymentModal
          invoiceNumber={paymentConfirmModal.invoiceNumber}
          paymentUrl={paymentUrl}
          isBulkPayment={paymentConfirmModal.isBulkPayment}
          description={paymentConfirmModal.description}
          onClose={handlePaymentModalClose}
          onPaymentSuccess={() => {
            setPaymentUrl(null);
            setPaymentSuccess(true);
            fetchCustomerData();
          }}
        />
      )}

      {/* Mobile Redirect Dialog */}
      {isMobileView && showMobileRedirectDialog && paymentUrl && (
        <MobileRedirectDialog
          paymentUrl={paymentUrl}
          description={paymentConfirmModal.description}
          onClose={handleMobileRedirectDialogClose}
          onRedirect={() => {
            console.log('Redirecting to DOKU payment page');
          }}
        />
      )}

      {/* Payment Confirmation Modal */}
      {paymentConfirmModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Konfirmasi Pembayaran
                </h3>
                <button
                  onClick={closePaymentConfirmation}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaCreditCard className="text-2xl text-blue-600" />
                  </div>
                </div>
                
                <p className="text-center text-gray-600 mb-2">
                  Anda akan melakukan pembayaran melalui DOKU Payment Gateway
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jenis Pembayaran:</span>
                      <span className="font-medium">
                        {paymentConfirmModal.isBulkPayment ? 'Bayar Semua Tagihan' : 'Bayar Single Invoice'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nomor Invoice:</span>
                      <span className="font-medium text-blue-600">
                        {paymentConfirmModal.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah Tagihan:</span>
                      <span className="font-medium">
                        {paymentConfirmModal.isBulkPayment 
                          ? `${paymentConfirmModal.unpaidCount} tagihan` 
                          : '1 tagihan'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pembayaran:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(paymentConfirmModal.amount)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <div className="flex">
                    <FaBell className="text-blue-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700">
                        <strong>Real-time Updates:</strong> Setelah pembayaran, status akan diperbarui otomatis melalui WebSocket.
                      </p>
                    </div>
                  </div>
                </div>
                
                {paymentConfirmModal.isBulkPayment && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <FaExclamationCircle className="text-yellow-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-700">
                          <strong>Perhatian:</strong> Pembayaran bulk akan menggabungkan {paymentConfirmModal.unpaidCount} tagihan menjadi satu transaksi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={closePaymentConfirmation}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={paymentLoading}
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl ${
                    paymentLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {paymentLoading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Memproses...
                    </>
                  ) : (
                    'Konfirmasi & Lanjutkan'
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Anda akan diarahkan ke halaman pembayaran DOKU yang aman
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Loading Overlay */}
      {paymentLoading && !paymentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Memproses Pembayaran</h3>
              <p className="text-gray-600">Sedang menghubungkan ke sistem pembayaran...</p>
              <p className="text-sm text-gray-500 mt-4">
                Setelah pembayaran, status akan otomatis diperbarui.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Error Alert */}
      {paymentError && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 shadow-lg">
            <div className="flex">
              <FaExclamationCircle className="text-red-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Gagal memproses pembayaran</p>
                <p className="text-sm text-red-700 mt-1">{paymentError}</p>
                <button
                  onClick={() => setPaymentError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Alert (from WebSocket) */}
      {paymentSuccess && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
          <div className="bg-green-50 border-l-4 border-green-400 p-4 shadow-lg">
            <div className="flex">
              <FaCheckCircle className="text-green-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Pembayaran Diproses</p>
                <p className="text-sm text-green-700 mt-1">
                  Status tagihan sedang diperbarui...
                </p>
                <button
                  onClick={() => setPaymentSuccess(false)}
                  className="mt-2 text-sm text-green-600 hover:text-green-800"
                >
                  Tutup
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
              <button 
                onClick={handleGoBack}
                className="mr-4 text-gray-600 hover:text-blue-600 transition flex items-center"
                aria-label="Kembali ke halaman sebelumnya"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Pelanggan</h1>
                <p className="text-sm text-gray-600">Riwayat dan status transaksi laundry</p>
              </div>
            </div>
            
            {/* Tombol Bayar Semua Tagihan di Header */}
            {unpaidInvoicesCount > 0 && (
              <button
                onClick={handlePayAllUnpaid}
                disabled={paymentLoading}
                className={`inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl ${
                  paymentLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-700'
                }`}
              >
                {paymentLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FaMoneyCheck className="mr-2" />
                    Bayar Semua Tagihan ({unpaidInvoicesCount})
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <FaExclamationCircle className="text-yellow-400 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-700">
                  {error} Data yang ditampilkan mungkin tidak lengkap.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile & Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Customer Info Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mr-6">
                <FaUser className="text-3xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {customerData?.data?.customer?.name || 'Pelanggan Tidak Diketahui'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <FaHome className="mr-2" />
                    <span>Kamar: {customerData?.data?.customer?.room || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="mr-2" />
                    <span>{customerData?.data?.customer?.phone || '-'}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    <span>
                      Member sejak: {formatDate(customerData?.data?.customer?.join_date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tombol Bayar Semua Tagihan di Info Card */}
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-sm opacity-90">Total Belum Lunas</div>
                <div className="text-3xl font-bold">
                  {formatCurrency(customerData?.data?.summary?.total_unpaid || 0)}
                </div>
                {unpaidInvoicesCount > 0 && (
                  <button
                    onClick={handlePayAllUnpaid}
                    disabled={paymentLoading}
                    className={`mt-3 inline-flex items-center px-4 py-2 bg-white text-green-600 font-bold rounded-lg transition ${
                      paymentLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50'
                    }`}
                  >
                    {paymentLoading ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <FaMoneyCheck className="mr-2" />
                        Bayar Semua ({unpaidInvoicesCount} tagihan)
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 mr-4">
                <FaFileInvoice className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerData?.data?.summary?.total_transaction || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Unpaid Total */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 mr-4">
                <FaExclamationCircle className="text-2xl text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Belum Lunas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(customerData?.data?.summary?.total_unpaid || 0)}
                </p>
                {unpaidInvoicesCount > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    {unpaidInvoicesCount} tagihan
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Paid Total */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 mr-4">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sudah Lunas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(customerData?.data?.summary?.total_paid || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Ready for Pickup */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 mr-4">
                <FaBell className="text-2xl text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Siap Diambil</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {customerData?.data?.summary?.total_ready || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Laundry & Kosan Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FaBuilding className="mr-2 text-blue-600" />
              Informasi Laundry
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama Laundry</p>
                <p className="font-medium">{customerData?.data?.laundry?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="font-medium">{customerData?.data?.laundry?.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telepon</p>
                <p className="font-medium">{customerData?.data?.laundry?.phone || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FaHome className="mr-2 text-green-600" />
              Informasi Kosan
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama Kosan</p>
                <p className="font-medium">{customerData?.data?.kosan?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="font-medium">{customerData?.data?.kosan?.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nomor Kamar</p>
                <p className="font-medium text-xl">{customerData?.data?.customer?.room || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters & Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FaHistory className="mr-2 text-blue-600" />
                Riwayat Transaksi ({filteredInvoices.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div className="flex items-center">
                <FaFilter className="mr-2 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="UNPAID">Belum Lunas</option>
                  <option value="NOT_PICKED">Belum Diambil</option>
                  <option value="SELESAI">Selesai Diproses</option>
                  <option value="DALAM PROSES">Dalam Proses</option>
                  <option value="MENUNGGU">Menunggu</option>
                  <option value="READY">Siap Diambil</option>
                  <option value="PROCESSING">Sedang Diproses</option>
                  <option value="PAID">Sudah Lunas</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center">
                <FaSortAmountDown className="mr-2 text-gray-500" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Tanggal Terbaru</option>
                  <option value="total">Total Tertinggi</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="ml-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-lg font-bold text-blue-600">
                {customerData?.data?.summary?.total_transaction || 0}
              </div>
              <div className="text-sm text-blue-700">Total Transaksi</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(customerData?.data?.summary?.total_unpaid || 0)}
              </div>
              <div className="text-sm text-red-700">Belum Lunas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">
                {customerData?.data?.summary?.total_processing || 0}
              </div>
              <div className="text-sm text-green-700">Sedang Diproses</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-bold text-yellow-600">
                {customerData?.data?.summary?.total_ready || 0}
              </div>
              <div className="text-sm text-yellow-700">Siap Diambil</div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-12">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FaFileInvoice className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada transaksi</h3>
              <p className="text-gray-600">Tidak ditemukan transaksi dengan filter yang dipilih.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    {/* Invoice Info */}
                    <div className="flex-1">
                      <div className="flex items-start mb-3">
                        <div className="p-3 bg-blue-50 rounded-lg mr-4">
                          <FaFileInvoice className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <h4 className="text-lg font-bold text-gray-900 mr-3">
                              {invoice.invoice || 'INVOICE-TIDAK-TERSEDIA'}
                            </h4>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-2" />
                              {invoice.date ? formatDate(invoice.date) : 'Tanggal tidak tersedia'}
                            </div>
                            <div className="flex items-center">
                              <FaMoneyBillWave className="mr-2" />
                              {formatCurrency(invoice.total || 0)}
                            </div>
                            <div className="flex items-center">
                              <FaTshirt className="mr-2" />
                              {invoice.items_count || 0} item
                            </div>
                            {invoice.estimated_completion && (
                              <div className="flex items-center">
                                <FaBell className="mr-2" />
                                Estimasi selesai: {formatDate(invoice.estimated_completion)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Status Details */}
                      <div className="ml-16">
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Status Pembayaran</span>
                            <span className={`text-sm font-medium ${
                              invoice.payment_status === 'LUNAS' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {invoice.payment_status || 'Tidak diketahui'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Status Pengambilan</span>
                            {getPickupStatusBadge(invoice.pickup_status)}
                          </div>
                          
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 mb-1">Status Pengerjaan</span>
                            {getProcessingStatusBadge(invoice.status_pengerjaan)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => navigate(`/invoice?invoice=${invoice.invoice}`)}
                          className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
                        >
                          <FaFileInvoice className="mr-2" />
                          Detail Invoice
                        </button>
                        
                        {invoice.status === 'UNPAID' && (
                          <button
                            onClick={() => handlePayNow(invoice)}
                            disabled={paymentLoading}
                            className={`inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg transition shadow-lg hover:shadow-xl ${
                              paymentLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-600 hover:to-green-700'
                            }`}
                          >
                            {paymentLoading ? (
                              <>
                                <FaSpinner className="animate-spin mr-2" />
                                Memproses...
                              </>
                            ) : (
                              <>
                                <FaCreditCard className="mr-2" />
                                Bayar Sekarang
                              </>
                            )}
                          </button>
                        )}
                        
                        {invoice.status === 'READY' && (
                          <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition">
                            <FaBell className="mr-2" />
                            Ambil Sekarang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Bayar Semua Tagihan */}
        <div className="mb-12">
          {unpaidInvoicesCount > 0 ? (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-xl p-8 text-white text-center">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-4">Bayar Semua Tagihan Sekaligus</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-3xl font-bold mb-1">{unpaidInvoicesCount}</div>
                    <div className="text-sm opacity-90">Tagihan Belum Lunas</div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(unpaidTotalAmount)}
                    </div>
                    <div className="text-sm opacity-90">Total yang Harus Dibayar</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg text-green-600">
                    <div className="text-2xl font-bold mb-1">HEMAT WAKTU</div>
                    <div className="text-sm">Bayar sekali untuk semua</div>
                  </div>
                </div>
                
                <button
                  onClick={handlePayAllUnpaid}
                  disabled={paymentLoading}
                  className={`inline-flex items-center px-6 py-4 bg-white text-green-600 font-bold text-xl rounded-lg transition shadow-2xl hover:shadow-3xl duration-300 ${
                    paymentLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50 transform hover:scale-105'
                  }`}
                >
                  {paymentLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-3 text-2xl" />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <FaMoneyCheck className="mr-3 text-2xl" />
                      Bayar Semua Tagihan Sekarang
                    </>
                  )}
                </button>
                
                <p className="text-sm opacity-90 mt-4">
                  Pembayaran aman melalui DOKU Payment Gateway
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-xl p-8 text-white text-center">
              <div className="max-w-2xl mx-auto">
                <FaCheckCircle className="text-5xl mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Semua Tagihan Sudah Lunas</h3>
                <p className="opacity-90 mb-4">Anda tidak memiliki tagihan yang belum dibayar saat ini.</p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-4 py-2 bg-white text-green-600 font-bold rounded-lg hover:bg-green-50 transition"
                >
                  <FaArrowLeft className="mr-2" />
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-800 text-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h4 className="font-semibold mb-2">Butuh Bantuan?</h4>
              <p className="text-gray-400 text-sm">
                Hubungi laundry untuk pertanyaan tentang transaksi atau status pengerjaan.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Tombol WhatsApp */}
                <button
                  onClick={openWhatsApp}
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition shadow-lg hover:shadow-xl"
                >
                  <FaWhatsapp className="mr-2 text-xl" />
                  Chat WhatsApp
                </button>
                
                {/* Tombol Telepon */}
                
                
                {/* Tombol Kembali ke Beranda */}
                <Link 
                  to="/"
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  <FaArrowLeft className="mr-2" />
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </div>
          
          {/* Informasi Kontak Tambahan */}
          {customerData?.data?.laundry?.phone && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <FaPhone className="mr-2" />
                  <span>Telepon: {customerData.data.laundry.phone}</span>
                </div>
                <div className="flex items-center">
                  <FaWhatsapp className="mr-2 text-green-400" />
                  <span>WhatsApp: {customerData.data.laundry.phone}</span>
                </div>
                <div className="flex items-center">
                  <FaBuilding className="mr-2" />
                  <span>{customerData.data.laundry.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;