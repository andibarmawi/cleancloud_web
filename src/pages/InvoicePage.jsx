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
  FaBath,
  FaBox,
  FaFire,
  FaBell,
  FaCaretDown,
  FaCaretUp,
  FaTimes,
  FaPlug,
  FaWifi
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildApiUrl } from '../apiConfig';

// Constants untuk WebSocket
const WS_CONFIG = {
  URL: 'wss://api.cleancloud.click/ws',
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  PING_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 10000
};

// Event types untuk WebSocket
const WS_EVENTS = {
  REGISTRATION_ACCEPTED: 'REGISTRATION_ACCEPTED',
  CONNECTION_ESTABLISHED: 'CONNECTION_ESTABLISHED',
  ERROR: 'ERROR'
};

const InvoicePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const invoiceNumber = searchParams.get('invoice') || 'INV-202501-0042';
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // eslint-disable-next-line no-empty-pattern
  const [] = useState({});
  
  // State untuk WebSocket
  const [wsStatus, setWsStatus] = useState({
    connected: false,
    connecting: false,
    reconnectionAttempts: 0,
    lastMessage: null
  });
  
  // State untuk modals
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: '',
    message: '',
    details: ''
  });

  const [successModal, setSuccessModal] = useState({
    show: false,
    title: '',
    message: ''
  });

  // Refs untuk WebSocket dan intervals
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const pingTimerRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // 🔧 WebSocket Connection Management
  const connectWebSocket = useCallback(() => {
    if (!invoiceNumber || !isMountedRef.current) return;
    
    // Cek apakah sudah connected atau sedang connecting
    if (wsRef.current?.readyState === WebSocket.OPEN || wsStatus.connecting) {
      console.log('🔌 WebSocket already connected or connecting');
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear any existing timers
    clearTimeout(connectionTimeoutRef.current);
    clearInterval(pingTimerRef.current);

    console.log('🔌 [WebSocket] Connecting to:', WS_CONFIG.URL);
    setWsStatus(prev => ({ ...prev, connecting: true }));

    try {
      const ws = new WebSocket(WS_CONFIG.URL);
      wsRef.current = ws;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('⚠️ [WebSocket] Connection timeout');
          ws.close();
          handleReconnect();
        }
      }, WS_CONFIG.CONNECTION_TIMEOUT);

      ws.onopen = () => {
        console.log('✅ [WebSocket] Connected successfully');
        clearTimeout(connectionTimeoutRef.current);
        
        setWsStatus({
          connected: true,
          connecting: false,
          reconnectionAttempts: 0,
          lastMessage: new Date().toISOString()
        });

        // Setup ping interval untuk menjaga koneksi tetap hidup
        pingTimerRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
          }
        }, WS_CONFIG.PING_INTERVAL);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📩 [WebSocket] Message received:', message);
          
          // Update last message timestamp
          setWsStatus(prev => ({ ...prev, lastMessage: new Date().toISOString() }));

          // Handle different message types
          handleWebSocketMessage(message);
          
        } catch (error) {
          console.error('❌ [WebSocket] Message parsing error:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ [WebSocket] Error:', error);
        setWsStatus(prev => ({ ...prev, connecting: false }));
      };

      ws.onclose = (event) => {
        console.log(`🔌 [WebSocket] Closed. Code: ${event.code}, Reason: ${event.reason}`);
        
        clearInterval(pingTimerRef.current);
        clearTimeout(connectionTimeoutRef.current);
        
        setWsStatus(prev => ({
          ...prev,
          connected: false,
          connecting: false
        }));

        // Handle reconnect jika bukan karena cleanup
        if (isMountedRef.current && event.code !== 1000) {
          handleReconnect();
        }
      };

    } catch (error) {
      console.error('❌ [WebSocket] Connection error:', error);
      setWsStatus(prev => ({ ...prev, connecting: false }));
      handleReconnect();
    }
  }, [invoiceNumber, wsStatus.connecting]);

  const handleReconnect = useCallback(() => {
    if (!isMountedRef.current) return;

    clearTimeout(reconnectTimerRef.current);

    if (wsStatus.reconnectionAttempts >= WS_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.warn('⚠️ [WebSocket] Max reconnection attempts reached');
      return;
    }

    console.log(`🔄 [WebSocket] Reconnecting in ${WS_CONFIG.RECONNECT_INTERVAL}ms (Attempt ${wsStatus.reconnectionAttempts + 1})`);
    
    setWsStatus(prev => ({
      ...prev,
      reconnectionAttempts: prev.reconnectionAttempts + 1
    }));

    reconnectTimerRef.current = setTimeout(() => {
      if (isMountedRef.current && invoiceNumber) {
        connectWebSocket();
      }
    }, WS_CONFIG.RECONNECT_INTERVAL);
  }, [wsStatus.reconnectionAttempts, invoiceNumber, connectWebSocket]);

  const handleWebSocketMessage = useCallback((message) => {
    const { event, data } = message;

    switch (event) {
      case WS_EVENTS.REGISTRATION_ACCEPTED:
        if (data?.noresi === invoiceNumber) {
          console.log('🎉 [WebSocket] Payment SUCCESS for invoice:', invoiceNumber);
          
          // Update UI dan state
          setShowPaymentModal(false);
          setSuccessModal({
            show: true,
            title: 'Pembayaran Berhasil',
            message: `Invoice ${invoiceNumber} sudah lunas dan terkonfirmasi oleh sistem.`
          });

          // Refresh data invoice
          fetchInvoiceData();
          
          // Optional: Send acknowledgment to server
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'ACKNOWLEDGMENT',
              invoice: invoiceNumber,
              timestamp: Date.now()
            }));
          }
        }
        break;

      case WS_EVENTS.CONNECTION_ESTABLISHED:
        console.log('🔗 [WebSocket] Connection established with server');
        break;

      case WS_EVENTS.ERROR:
        console.error('❌ [WebSocket] Server error:', data);
        break;

      default:
        console.log('📨 [WebSocket] Unknown event:', event);
    }
  }, [invoiceNumber]);

  const disconnectWebSocket = useCallback(() => {
    console.log('🔌 [WebSocket] Disconnecting...');
    
    // Clear all timers
    clearTimeout(reconnectTimerRef.current);
    clearInterval(pingTimerRef.current);
    clearTimeout(connectionTimeoutRef.current);
    
    // Close WebSocket dengan kode normal
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounting');
      wsRef.current = null;
    }
    
    setWsStatus({
      connected: false,
      connecting: false,
      reconnectionAttempts: 0,
      lastMessage: null
    });
  }, []);

  // 🔄 Main Effects
  useEffect(() => {
    isMountedRef.current = true;
    
    // Fetch data invoice pertama kali
    fetchInvoiceData();
    
    // Load DOKU script
    loadDokuScript();
    
    return () => {
      isMountedRef.current = false;
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    // Connect WebSocket ketika invoice number tersedia
    if (invoiceNumber && invoiceData?.data?.invoice?.invoice_number) {
      connectWebSocket();
    }
    
    return () => {
      // Cleanup WebSocket jika invoice number berubah
      disconnectWebSocket();
    };
  }, [invoiceNumber, invoiceData?.data?.invoice?.invoice_number, connectWebSocket, disconnectWebSocket]);

  // 🔧 Helper Functions
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
      
      setErrorModal({
        show: true,
        title: 'Gagal Memuat Data Invoice',
        message: 'Terjadi kesalahan saat mengambil data invoice dari server.',
        details: error.message
      });
      
      setInvoiceData(null);
    } finally {
      setLoading(false);
    }
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
        
        setErrorModal({
          show: true,
          title: 'Gagal Memproses Pembayaran',
          message: result.message || `Terjadi kesalahan saat memproses pembayaran.`,
          details: response.statusText || 'Tidak ada detail tambahan'
        });
        
        throw new Error(result.message || `Server error: ${response.status} ${response.statusText}`);
      }

      let paymentUrl = null;
      
      if (result.response?.payment?.url) {
        paymentUrl = result.response.payment.url;
      } else if (result.payment_url) {
        paymentUrl = result.payment_url;
      } else if (result.url) {
        paymentUrl = result.url;
      } else if (result.data?.payment_url) {
        paymentUrl = result.data.payment_url;
      } else if (result.data?.url) {
        paymentUrl = result.data.url;
      }

      if (paymentUrl) {
        console.log('🔗 [INVOICE PAYMENT] Payment URL received:', paymentUrl);
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!window.loadJokulCheckout) {
          console.log('📦 [INVOICE PAYMENT] DOKU script not loaded, loading now...');
          await loadDokuScript();
        }
        
        if (window.loadJokulCheckout) {
          console.log('🚀 [INVOICE PAYMENT] Launching DOKU Checkout...');
          window.loadJokulCheckout(paymentUrl);
          
          setShowPaymentModal(false);
          
        } else {
          console.warn('⚠️ [INVOICE PAYMENT] DOKU Checkout function not available');
          window.open(paymentUrl, '_blank', 'noopener,noreferrer');
          setShowPaymentModal(false);
        }
        
      } else {
        console.warn('⚠️ [INVOICE PAYMENT] No payment URL found in response');
        
        setErrorModal({
          show: true,
          title: 'URL Pembayaran Tidak Ditemukan',
          message: 'Sistem tidak dapat menemukan URL pembayaran dari server.',
          details: 'Response server tidak mengandung URL pembayaran yang valid.'
        });
      }
    } catch (error) {
      console.error('❌ [INVOICE PAYMENT] Error:', error);
      
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
      
      setTimeout(() => {
        fetchInvoiceData();
      }, 3000);
    }
  };

  const loadDokuScript = () => {
    if (window.loadJokulCheckout || document.querySelector('script[src*="jokul-checkout"]')) {
      console.log('✅ DOKU Checkout script already loaded');
      return;
    }

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

  // 🎨 UI Components
  const PaymentSuccessModal = () => {
    const handleClose = () => {
      setSuccessModal({ show: false, title: '', message: '' });
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">{successModal.title}</h3>
              <p className="text-gray-600">{successModal.message}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-600 mr-2" />
                <p className="text-sm text-green-700">
                  Status pembayaran akan diperbarui secara otomatis
                </p>
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

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

  // WebSocket Status Indicator (opsional)
  const WebSocketStatus = () => {
    if (!invoiceNumber) return null;

    return (
      <div className="fixed bottom-4 right-4 z-40">
        <div className={`flex items-center px-3 py-2 rounded-lg shadow-lg text-sm ${
          wsStatus.connected 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : wsStatus.connecting 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
        }`}>
          {wsStatus.connected ? (
            <>
              <FaWifi className="mr-2 animate-pulse" />
              <span>Real-time connected</span>
            </>
          ) : wsStatus.connecting ? (
            <>
              <FaPlug className="mr-2 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <FaPlug className="mr-2" />
              <span>Disconnected</span>
            </>
          )}
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

  const isPaid = invoiceData.data.invoice.payment_status === 'LUNAS';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* WebSocket Status Indicator */}
      <WebSocketStatus />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-600 hover:text-blue-600 transition"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Invoice Laundry</h1>
                <p className="text-sm text-gray-600">Detail transaksi dan pembayaran</p>
              </div>
            </div>
            
            {/* Payment Status Badge */}
            <div className="flex items-center space-x-2">
              {getPaymentStatusBadge(invoiceData.data.invoice.payment_status)}
              {wsStatus.connected && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Live Updates
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - SAMA DENGAN SEBELUMNYA */}
      {/* ... kode JSX utama tetap sama ... */}

      {/* Modals */}
      {showPaymentModal && <PaymentSuccessModal />}
      {errorModal.show && <ErrorModal />}
      {successModal.show && <PaymentSuccessModal />}

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