import { useState, useEffect } from 'react';
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
  FaSync  
} from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { buildApiUrl } from "../apiConfig";

const CustomersPage = () => {
  const { kosanId } = useParams(); // Ambil kosanId dari URL
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

  useEffect(() => {
    if (kosanId) {
      fetchCustomersData();
      loadDokuScript();
    }
  }, [kosanId]); // Tambahkan kosanId sebagai dependency

  const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-()]+/g, '') // ✅ izinkan ()
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

  const fetchCustomersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gunakan kosanId dari useParams
      //const response = await fetch(`http://localhost:8080/public/kosan/${kosanId}`);
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
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch(status) {
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
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaMoneyBillWave className="mr-1" /> SEBAGIAN
          </span>
        );
      default:
        return null;
    }
  };

  const filteredCustomers = customersData?.data?.customers
    ?.filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.room.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'ALL' || customer.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
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

      console.log('🔄 [PAYMENT] Sending payment data:', paymentData);
      
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
      } catch (parseError) {
        console.error('❌ [PAYMENT] JSON Parse Error:', parseError);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        console.error('❌ [PAYMENT] Server Error Response:', result);
        throw new Error(result.message || `Server error: ${response.status} ${response.statusText}`);
      }

      if (result.success || (result.response && result.response.payment && result.response.payment.url)) {
        console.log('✅ [PAYMENT] Payment created successfully:', result);
        
        let paymentUrl = null;
        
        if (result.response && result.response.payment && result.response.payment.url) {
          paymentUrl = result.response.payment.url;
          console.log('🔗 [PAYMENT] Found payment URL in result.response.payment.url:', paymentUrl);
        } else if (result.data && result.data.payment_url) {
          paymentUrl = result.data.payment_url;
          console.log('🔗 [PAYMENT] Found payment URL in result.data.payment_url:', paymentUrl);
        } else if (result.data && result.data.url) {
          paymentUrl = result.data.url;
          console.log('🔗 [PAYMENT] Found payment URL in result.data.url:', paymentUrl);
        } else if (result.payment_url) {
          paymentUrl = result.payment_url;
          console.log('🔗 [PAYMENT] Found payment URL in result.payment_url:', paymentUrl);
        } else if (result.url) {
          paymentUrl = result.url;
          console.log('🔗 [PAYMENT] Found payment URL in result.url:', paymentUrl);
        }
        
        if (paymentUrl) {
          console.log('🔗 [PAYMENT] Payment URL received:', paymentUrl);
          
          // Tunggu sedikit untuk memastikan UI tidak freeze
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Panggil loadJokulCheckout langsung - DOKU akan membuat modal sendiri
          if (window.loadJokulCheckout) {
            console.log('🚀 [PAYMENT] Launching DOKU Checkout...');
            window.loadJokulCheckout(paymentUrl);
            
            // Tampilkan loading feedback saja
            setPaymentSuccess(true);
            
          } else {
            console.error('❌ [PAYMENT] DOKU Checkout function not available');
            // Fallback: open in new tab
            window.open(paymentUrl, '_blank', 'noopener,noreferrer');
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
    } finally {
      console.log('🏁 [PAYMENT] Process completed');
      setPaymentLoading(false);
      
      // Refresh data setelah 5 detik (berikan waktu untuk proses pembayaran)
      setTimeout(() => {
        console.log('🔄 [PAYMENT] Refreshing customer data...');
        fetchCustomersData();
      }, 5000);
    }
  };

  const PaymentModal = () => {
    // Tambahkan useEffect untuk menangani refresh saat modal ditutup
    useEffect(() => {
      // Hanya jalankan ketika paymentSuccess berubah dari true ke false (modal ditutup)
      if (!paymentSuccess && currentCustomer) {
        console.log('🔄 [MODAL] Modal ditutup, melakukan refresh data...');
        
        // Delay sedikit agar UI smooth
        const timer = setTimeout(() => {
          fetchCustomersData();
          setCurrentCustomer(null); // Reset current customer
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }, [paymentSuccess, currentCustomer]); // Tambahkan dependencies

    if (paymentSuccess) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
            <div className="text-green-500 text-4xl mb-4 text-center">
              <FaCheckCircle className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Membuka Pembayaran...</h3>
            <p className="text-gray-600 text-center mb-4">
              Halaman pembayaran DOKU sedang dibuka untuk {currentCustomer?.name}
            </p>
            <div className="text-center text-sm text-gray-500 mb-4">
              Jika tidak muncul, periksa pop-up blocker di browser Anda.
            </div>
            <button
              onClick={() => {
                setPaymentSuccess(false);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Tutup Pesan Ini
            </button>
          </div>
        </div>
      );
    }

    if (paymentError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
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
                  // Refresh data saat menutup modal error
                  setTimeout(() => fetchCustomersData(), 300);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
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
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <div className="text-red-500 text-5xl mb-4">
              <FaExclamationCircle className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gagal Memuat Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={fetchCustomersData}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Coba Lagi
              </button>
              <Link
                to="/"
                className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
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
<div className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center py-6">
      <div className="flex items-center">
        <Link 
          to="/" 
          className="mr-4 text-gray-600 hover:text-blue-600 transition"
        >
          <FaArrowLeft className="text-xl" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customersData.data.kosan.name}</h1>
          <div className="flex items-center text-gray-600 mt-1">
            <FaBuilding className="mr-2" />
            <span className="text-sm">
              {customersData.data.laundry.name} • Kosan ID: {kosanId}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Tombol Refresh */}
        <button
          onClick={fetchCustomersData}
          disabled={loading}
          className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Refresh data"
        >
          <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
        
        <a 
          href={`/kosan-owner/login`} 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          Login
        </a>
      </div>
    </div>
  </div>
</div>
      {/* Controls and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari pelanggan atau nomor kamar..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
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
                  <option value="PAID">Lunas</option>
                  <option value="UNPAID">Belum Lunas</option>
                  <option value="PARTIAL">Sebagian</option>
                </select>
              </div>

              {/* Sort By */}
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
          </div>

          {/* Kosan Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  <FaBuilding className="inline mr-2" />
                  {customersData.data.kosan.name}
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  {customersData.data.kosan.address}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <span className="text-sm text-blue-600">
                  Laundry Partner: <strong>{customersData.data.laundry.name}</strong> | 
                  Total Pelanggan: <strong>{customersData.data.summary.total_customers || 0}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Daftar Pelanggan ({filteredCustomers?.length || 0})
              </h3>
              <div className="text-sm text-gray-600">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kamar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tunggakan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaksi Terakhir
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold">
                            {customer.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.phone || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {customer.room}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(customer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${customer.total_unpaid > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(customer.total_unpaid)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <FaCalendarAlt className="inline mr-2 text-gray-400" />
                        {customer.last_transaction || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/customer/${customer.id}-${slugify(customer.name)}`}
                          className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                        >
                          Detail
                        </Link>
                        <button 
                          onClick={() => handlePayment(customer)}
                          disabled={customer.total_unpaid === 0 || paymentLoading}
                          className={`text-green-600 hover:text-green-900 px-3 py-1 border border-green-200 rounded-lg hover:bg-green-50 transition ${
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

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan <span className="font-medium">{filteredCustomers?.length}</span> dari{' '}
                <span className="font-medium">{customersData.data.summary.total_customers || 0}</span> pelanggan
              </div>
              <div className="mt-2 md:mt-0">
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">Halaman 1 dari 1</span>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
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