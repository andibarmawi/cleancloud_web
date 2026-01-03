import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  FaBuilding, 
  FaUsers, 
  FaMoneyBillWave, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaCalendarAlt,
  FaSync,
  FaUser,
  FaHome,
  FaReceipt,
  FaExternalLinkAlt,
  FaLock,
  FaExpand,
  FaCompress,
  FaDesktop,
  FaMobileAlt,
  FaTimes,
  FaBell,
  FaSpinner
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { buildApiUrl } from "../apiConfig";

// Constants untuk WebSocket
const WS_URL = "wss://api.cleancloud.cloud/ws";
const WS_RECONNECT_DELAY = 5000;

// Component untuk Payment Modal yang besar
const PaymentModal = ({ paymentUrl, description, onClose }) => {
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
                <h3 className="text-xl font-bold text-gray-900">Pembayaran Pelanggan</h3>
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
              
              {/* Instructions */}
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center bg-green-50 p-3 rounded-lg">
                    <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-green-800">Aman & Terenkripsi</div>
                      <div className="text-green-600 text-xs">Transaksi 100% aman</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-blue-50 p-3 rounded-lg">
                    <FaBell className="text-blue-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-blue-800">Notifikasi Otomatis</div>
                      <div className="text-blue-600 text-xs">Status update real-time</div>
                    </div>
                  </div>
                  <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
                    <FaCalendarAlt className="text-yellow-500 mr-2 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-yellow-800">Selesaikan Sekarang</div>
                      <div className="text-yellow-600 text-xs">Proses cepat 2-3 menit</div>
                    </div>
                  </div>
                </div>
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

const CustomersPage = () => {
  const { kosanId } = useParams();
  const [customersData, setCustomersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // WebSocket Refs
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const fetchCustomersDataRef = useRef(null);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch customers data
  const fetchCustomersData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl(`/public/kosan/${kosanId}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API returned unsuccessful response');
      }
      
      setCustomersData(data);
      console.log("✅ [Customers] Data loaded for kosan:", kosanId);
    } catch (error) {
      console.error('❌ [Customers] Error fetching data:', error);
      setError(error.message || 'Gagal memuat data pelanggan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [kosanId]);

  // Update ref ketika fungsi berubah
  useEffect(() => {
    fetchCustomersDataRef.current = fetchCustomersData;
  }, [fetchCustomersData]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    console.log("🔌 [WebSocket] Connecting to:", WS_URL);
    console.log("🏢 [WebSocket] For kosan:", kosanId);
    
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
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ [WebSocket] Connected successfully");
        
        // Register kosan to WebSocket
        if (kosanId) {
          const registerMessage = JSON.stringify({
            event: "REGISTER_KOSAN",
            data: { kosan_id: kosanId }
          });
          console.log("📤 [WebSocket] Registering kosan:", kosanId);
          ws.send(registerMessage);
        }
      };

      ws.onmessage = (event) => {
        console.log("📩 [WebSocket] Raw message received:", event.data);
        try {
          const msg = JSON.parse(event.data);
          console.log("📩 [WebSocket] Parsed message:", msg);

          // Handle payment success updates
          if (msg.event === "REGISTRATION_ACCEPTED" && msg.data?.noresi) {
            console.log("🎉 [WebSocket] Payment SUCCESS detected for invoice:", msg.data.noresi);
            
            // Show success notification
            setPaymentSuccess(true);
            
            // Refresh data with debounce
            if (fetchCustomersDataRef.current) {
              console.log("🔄 [WebSocket] Scheduling data refresh...");
              
              // Clear existing timeout
              if (window.refreshCustomersTimeout) {
                clearTimeout(window.refreshCustomersTimeout);
              }
              
              // Debounce refresh untuk menghindari multiple calls
              window.refreshCustomersTimeout = setTimeout(() => {
                console.log("🔄 [WebSocket] Executing data refresh...");
                fetchCustomersDataRef.current();
              }, 2000); // Tunggu 2 detik
            }
            
            // Show alert to user
            setTimeout(() => {
              alert(`✅ Pembayaran untuk pelanggan berhasil! Data telah diperbarui.`);
            }, 500);
          }
          
          // Handle customer registration confirmation
          else if (msg.event === "REGISTRATION_ACCEPTED" && msg.data?.kosan_id) {
            console.log("✅ [WebSocket] Kosan registration confirmed");
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
            connectWebSocket();
          }, WS_RECONNECT_DELAY);
        }
      };
      
      return ws;
    } catch (error) {
      console.error("❌ [WebSocket] Connection error:", error);
      return null;
    }
  }, [kosanId]);

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
    
    // Clear global refresh timeout
    if (window.refreshCustomersTimeout) {
      clearTimeout(window.refreshCustomersTimeout);
      window.refreshCustomersTimeout = null;
    }
  }, []);

  // Initialize WebSocket when component mounts
  useEffect(() => {
    console.log("🚀 [CustomersPage] Component mounted");
    
    if (kosanId) {
      console.log("🔌 [WebSocket] Initializing WebSocket for kosan:", kosanId);
      connectWebSocket();
    } else {
      console.error("❌ [WebSocket] No kosanId available");
    }
    
    return () => {
      console.log("🧹 [CustomersPage] Component unmounting, cleaning up...");
      cleanupWebSocket();
    };
  }, [kosanId, connectWebSocket, cleanupWebSocket]);

  // Monitor WebSocket status
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
    }, 30000); // Check setiap 30 detik
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (kosanId) {
      fetchCustomersData();
    }
  }, [kosanId, fetchCustomersData]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-()]+/g, '')
      .replace(/--+/g, '-');
  };

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  const getStatusBadge = useCallback((status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium";
    
    switch(status) {
      case 'PAID':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <FaCheckCircle className="mr-1" /> LUNAS
          </span>
        );
      case 'UNPAID':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <FaExclamationCircle className="mr-1" /> BELUM LUNAS
          </span>
        );
      case 'PARTIAL':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <FaMoneyBillWave className="mr-1" /> SEBAGIAN
          </span>
        );
      default:
        return null;
    }
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!customersData?.data?.customers) return [];
    
    return customersData.data.customers
      .filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             customer.room.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'ALL' || customer.status === filterStatus;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch(sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'room':
            return a.room.localeCompare(b.room);
          case 'total_unpaid':
            return b.total_unpaid - a.total_unpaid;
          case 'status':
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });
  }, [customersData, searchTerm, filterStatus, sortBy]);

  const handlePayment = async (customer) => {
    try {
      setPaymentLoading(true);
      setPaymentError(null);
      setCurrentCustomer(customer);
      
      const paymentData = {
        order: {
          invoice_number: `BULK-${Date.now()}-${customer.id}`,
          amount: customer.total_unpaid,
          currency: `IDR`,
        },
        customer: {
          id: `USER-${customer.id}`,
          name: customer.name,
          email: `andibarmawi@gmail.com`,
          phone: customer.phone || '08123456789'
        },
        additional_info: {
          override_notification_url: "https://api.cleancloud.cloud/payment/notify",
          payment_type: "bulkpayment"
        },
        payment: {
          payment_due_date: 60
        }
      };

      console.log('🔄 [Payment] Sending payment data for customer:', customer.name);
      
      const response = await fetch(buildApiUrl('/doku/payment'), {
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
        throw new Error(result.message || `Server error: ${response.status} ${response.statusText}`);
      }

      if (result.success || (result.response?.payment?.url) || result.data?.payment_url) {
        let paymentUrlFromResponse = result.response?.payment?.url || result.data?.payment_url || result.data?.url || result.payment_url || result.url;
        
        if (paymentUrlFromResponse) {
          console.log('🔗 [Payment] Payment URL received:', paymentUrlFromResponse);
          setPaymentUrl(paymentUrlFromResponse);
          
          // Register customer to WebSocket untuk real-time updates
          if (wsRef.current?.readyState === WebSocket.OPEN && customer.id) {
            const customerMessage = JSON.stringify({
              event: "REGISTER_CUSTOMER",
              data: { customer_id: customer.id }
            });
            wsRef.current.send(customerMessage);
            console.log("📤 [WebSocket] Registered customer for updates:", customer.id);
          }
        } else {
          throw new Error('URL pembayaran tidak ditemukan dalam response server');
        }
      } else {
        throw new Error(result.message || result.response?.message?.[0] || 'Pembayaran gagal dibuat');
      }
    } catch (error) {
      console.error('❌ [PAYMENT] Error:', error);
      setPaymentError(error.message);
      alert(`Error pembayaran: ${error.message}`);
    } finally {
      setPaymentLoading(false);
      
      // Fallback refresh jika WebSocket tidak bekerja
      setTimeout(() => {
        console.log('🔄 [Payment] Fallback: Refreshing data...');
        fetchCustomersData();
      }, 10000); // Fallback setelah 10 detik
    }
  };

  const handlePaymentModalClose = () => {
    setPaymentUrl(null);
    setCurrentCustomer(null);
    // Refresh data setelah modal ditutup
    fetchCustomersData();
  };

  // Success Modal untuk WebSocket notifications
  const SuccessModal = () => {
    if (!paymentSuccess) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-sm">
          <div className="text-green-500 text-4xl mb-4 text-center">
            <FaCheckCircle className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-center mb-2">Pembayaran Berhasil!</h3>
          <p className="text-gray-600 text-center mb-4">
            Status pelanggan telah diperbarui secara real-time.
          </p>
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <div className="flex items-center">
              <FaBell className="text-green-500 mr-2" />
              <p className="text-sm text-green-700">
                Data akan diperbarui otomatis dalam beberapa detik.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setPaymentSuccess(false);
              fetchCustomersData(); // Force refresh
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Tutup & Refresh
          </button>
        </div>
      </div>
    );
  };

  // Mobile Customer Card Component
  const MobileCustomerCard = ({ customer }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaUser className="text-blue-600 text-xl" />
          </div>
          <div className="ml-3">
            <h4 className="font-semibold text-gray-900">{customer.name}</h4>
            <p className="text-sm text-gray-500">{customer.phone || 'N/A'}</p>
          </div>
        </div>
        {getStatusBadge(customer.status)}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center text-sm">
          <FaHome className="text-gray-400 mr-2" />
          <span className="font-medium">Kamar {customer.room}</span>
        </div>
        <div className="flex items-center text-sm">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <span>{customer.last_transaction || 'N/A'}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center border-t pt-3">
        <div>
          <p className="text-sm text-gray-600">Tunggakan</p>
          <p className={`text-lg font-bold ${customer.total_unpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(customer.total_unpaid)}
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/customer/${customer.id}-${slugify(customer.name)}`}
            className="px-3 py-2 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition"
          >
            Detail
          </Link>
          <button 
            onClick={() => handlePayment(customer)}
            disabled={customer.total_unpaid === 0 || paymentLoading}
            className={`px-3 py-2 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition ${
              (customer.total_unpaid === 0 || paymentLoading) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {paymentLoading && currentCustomer?.id === customer.id ? (
              <>
                <FaSpinner className="animate-spin inline mr-1" />
                Proses...
              </>
            ) : 'Bayar'}
          </button>
        </div>
      </div>
    </div>
  );

  // WebSocket Status Indicator
  const WebSocketStatus = () => {
    const ws = wsRef.current;
    const isConnected = ws?.readyState === WebSocket.OPEN;
    
    return (
      <div className="fixed bottom-4 right-4 z-40">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <div className="text-red-500 text-5xl mb-4">
              <FaExclamationCircle className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={fetchCustomersData}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Coba Lagi
              </button>
              <Link
                to="/"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition font-medium text-center"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* WebSocket Status Indicator */}
      <WebSocketStatus />

      {/* Payment Modal */}
      {paymentUrl && currentCustomer && (
        <PaymentModal
          customerName={currentCustomer.name}
          paymentUrl={paymentUrl}
          isBulkPayment={true}
          description={`Bayar tunggakan ${currentCustomer.name} - Kamar ${currentCustomer.room}`}
          onClose={handlePaymentModalClose}
          onPaymentSuccess={() => {
            setPaymentUrl(null);
            setPaymentSuccess(true);
          }}
        />
      )}

      {/* Success Modal */}
      <SuccessModal />

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link 
                to="/" 
                className="mr-3 text-gray-600 hover:text-blue-600 transition p-2 -ml-2"
              >
                <FaArrowLeft className="text-xl" />
              </Link>
              <div className="max-w-[200px] md:max-w-none">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {customersData.data.kosan.name}
                </h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <FaBuilding className="mr-2 text-sm" />
                  <span className="text-xs md:text-sm truncate">
                    {customersData.data.laundry.name}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchCustomersData}
                disabled={loading}
                className={`p-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Refresh data"
              >
                <FaSync className={`${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <a 
                href={`/kosan-owner/login`} 
                className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <span className="hidden md:inline">Login</span>
                <FaUser className="md:hidden" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pelanggan atau nomor kamar..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
            </button>
            
            {!isMobileView && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PAID">Lunas</option>
                    <option value="UNPAID">Belum Lunas</option>
                    <option value="PARTIAL">Sebagian</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <FaSortAmountDown className="mr-2 text-gray-500" />
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Nama A-Z</option>
                    <option value="room">Nomor Kamar</option>
                    <option value="total_unpaid">Total Tunggakan</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Filters */}
          {showFilters && isMobileView && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PAID">Lunas</option>
                    <option value="UNPAID">Belum Lunas</option>
                    <option value="PARTIAL">Sebagian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutkan
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Nama A-Z</option>
                    <option value="room">Nomor Kamar</option>
                    <option value="total_unpaid">Total Tunggakan</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Kosan Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-2 md:mb-0">
                <h3 className="font-semibold text-blue-900 text-sm md:text-base">
                  <FaBuilding className="inline mr-2" />
                  {customersData.data.kosan.name}
                </h3>
                <p className="text-blue-700 text-xs md:text-sm mt-1">
                  {customersData.data.kosan.address}
                </p>
              </div>
              <div className="text-xs md:text-sm text-blue-600">
                <span>Pelanggan: <strong>{customersData.data.summary.total_customers || 0}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-lg">
                Daftar Pelanggan ({filteredCustomers.length})
              </h3>
              <div className="text-sm text-gray-600 mt-1 md:mt-0">
                Total Tunggakan: <span className="font-bold text-red-600">
                  {formatCurrency(customersData.data.summary.total_unpaid || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-0">
            {isMobileView ? (
              // Mobile View - Cards
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <MobileCustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            ) : (
              // Desktop View - Table
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pelanggan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kamar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tunggakan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaksi Terakhir
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FaUser className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.phone || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">
                            {customer.room}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(customer.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-semibold ${customer.total_unpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(customer.total_unpaid)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-gray-900">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            <span>{customer.last_transaction || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <Link
                              to={`/customer/${customer.id}-${slugify(customer.name)}`}
                              className="px-3 py-1 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm"
                            >
                              Detail
                            </Link>
                            <button 
                              onClick={() => handlePayment(customer)}
                              disabled={customer.total_unpaid === 0 || paymentLoading}
                              className={`px-3 py-1 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition text-sm ${
                                (customer.total_unpaid === 0 || paymentLoading) ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {paymentLoading && currentCustomer?.id === customer.id ? (
                                <>
                                  <FaSpinner className="animate-spin inline mr-1" />
                                  Proses...
                                </>
                              ) : 'Bayar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600 mb-2 md:mb-0">
                Menampilkan <span className="font-medium">{filteredCustomers.length}</span> pelanggan
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <span className="text-sm text-gray-700">Halaman 1</span>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;