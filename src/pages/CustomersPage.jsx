import { useState, useEffect, useMemo, useCallback } from 'react';
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
  FaEllipsisV,
  FaUser,
  FaHome,
  FaReceipt
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { buildApiUrl } from "../apiConfig";

const CustomersPage = () => {
  const { kosanId } = useParams();
  const [customersData, setCustomersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (kosanId) {
      fetchCustomersData();
      loadDokuScript();
    }
  }, [kosanId]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-()]+/g, '')
      .replace(/--+/g, '-');
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
    } catch (error) {
      console.error('Error fetching customers data:', error);
      setError(error.message || 'Gagal memuat data pelanggan. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [kosanId]);

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
          override_notification_url: "https://api.cleancloud.click/payment/notify",
          payment_type: "bulkpayment"
        },
        payment: {
          payment_due_date: 60
        }
      };

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
        let paymentUrl = result.response?.payment?.url || result.data?.payment_url || result.data?.url || result.payment_url || result.url;
        
        if (paymentUrl) {
          if (window.loadJokulCheckout) {
            window.loadJokulCheckout(paymentUrl);
            setPaymentSuccess(true);
          } else {
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
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
    } finally {
      setPaymentLoading(false);
      
      setTimeout(() => {
        fetchCustomersData();
      }, 5000);
    }
  };

  const PaymentModal = () => {
    useEffect(() => {
      if (!paymentSuccess && currentCustomer) {
        const timer = setTimeout(() => {
          fetchCustomersData();
          setCurrentCustomer(null);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [paymentSuccess, currentCustomer]);

    if (paymentSuccess) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="text-green-500 text-4xl mb-4 text-center">
              <FaCheckCircle className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Membuka Pembayaran...</h3>
            <p className="text-gray-600 text-center mb-4">
              Halaman pembayaran DOKU sedang dibuka untuk {currentCustomer?.name}
            </p>
            <button
              onClick={() => setPaymentSuccess(false)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Tutup Pesan Ini
            </button>
          </div>
        </div>
      );
    }

    if (paymentError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="text-red-500 text-4xl mb-4 text-center">
              <FaExclamationCircle className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Gagal Memproses</h3>
            <p className="text-gray-600 text-center mb-4">{paymentError}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setPaymentError(null);
                  setCurrentCustomer(null);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setPaymentError(null);
                  if (currentCustomer) {
                    handlePayment(currentCustomer);
                  }
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
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
            {paymentLoading && currentCustomer?.id === customer.id ? 'Proses...' : 'Bayar'}
          </button>
        </div>
      </div>
    </div>
  );

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
                              {paymentLoading && currentCustomer?.id === customer.id ? 'Memproses...' : 'Bayar'}
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

      {/* Payment Modal */}
      <PaymentModal />
    </div>
  );
};

export default CustomersPage;