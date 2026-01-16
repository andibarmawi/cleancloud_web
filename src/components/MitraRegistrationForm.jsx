// src/components/MitraRegistrationForm.jsx
import React, { useState } from 'react';
import { buildApiUrl } from '../apiConfig';
import { 
  FaUser, 
  FaBuilding, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaCity, 
  FaGlobe,
  FaCreditCard,
  FaFileAlt,
  FaCheckCircle,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';
//import { useNavigate } from 'react-router-dom';

const MitraRegistrationForm = ({ onClose }) => {
  //const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    laundry_id: 31, // Default laundry_id
    name: '',
    contact: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    mitra_type: 'usaha',
    fee_percentage: 0.0,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    npwp: ''
  });

  const provinces = [
    'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DKI Jakarta',
    'Banten', 'Bali', 'Sumatera Utara', 'Sumatera Barat',
    'Riau', 'Kalimantan Timur', 'Sulawesi Selatan', 'Papua'
  ];

  const cities = {
    'Jawa Barat': ['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cimahi', 'Tasikmalaya'],
    'Jawa Tengah': ['Semarang', 'Surakarta', 'Salatiga', 'Pekalongan', 'Tegal'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Mojokerto', 'Pasuruan'],
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat', 'Jakarta Utara']
  };

const bankOptions = [
  // ===== Bank Umum =====
  'BCA',
  'Mandiri',
  'BRI',
  'BNI',
  'CIMB Niaga',
  'OCBC NISP',
  'Panin Bank',
  'Danamon',
  'Maybank',
  'Bank Mega',
  'Bank Permata',
  'Bank Jago',
  'Bank Neo Commerce',

  // ===== Bank Syariah =====
  'Bank Syariah Indonesia (BSI)',
  'BNI Syariah',
  'Mandiri Syariah',
  'BRI Syariah',
  'BCA Syariah',
  'Bank Muamalat',

  // ===== Bank E-Money =====
  'Sakuku (BCA)',
  'Flazz (BCA)',
  'Brizzi (BRI)',
  'HasanahKu (BNI Syariah)',
  'Mandiri e-Money',
  'Mandiri e-Cash',

  // ===== E-Wallet / Fintech =====
  'GoPay',
  'OVO',
  'DANA',
  'ShopeePay',
  'LinkAja',
];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset error saat user mulai mengetik
    if (error) setError(null);
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push('Nama kosan harus diisi');
    if (!formData.contact.trim()) errors.push('Nomor kontak harus diisi');
    if (!formData.email.trim()) errors.push('Email harus diisi');
    if (!formData.address.trim()) errors.push('Alamat harus diisi');
    if (!formData.city.trim()) errors.push('Kota harus diisi');
    if (!formData.province.trim()) errors.push('Provinsi harus diisi');
    if (!formData.postal_code.trim()) errors.push('Kode pos harus diisi');
    if (!formData.bank_name.trim()) errors.push('Nama bank harus diisi');
    if (!formData.bank_account_number.trim()) errors.push('Nomor rekening harus diisi');
    if (!formData.bank_account_name.trim()) errors.push('Nama pemilik rekening harus diisi');
    
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Format email tidak valid');
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,13}$/;
    if (formData.contact && !phoneRegex.test(formData.contact.replace(/\D/g, ''))) {
      errors.push('Nomor telepon harus 10-13 digit');
    }

    // Validasi nomor rekening
    const accountRegex = /^[0-9]{8,16}$/;
    if (formData.bank_account_number && !accountRegex.test(formData.bank_account_number)) {
      errors.push('Nomor rekening harus 8-16 digit angka');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  const errors = validateForm();
  if (errors.length > 0) {
    setError(errors[0]);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Menggunakan API base URL yang sama
    //const apiUrl = import.meta.env.VITE_API_URL || 'https://api.cleancloud.cloud';
    //const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    //const endpoint = `${apiUrl}/public/pendaftaran-mitra`;
    const endpoint = await (
            buildApiUrl('/public/pendaftaran-mitra')
        );
    
    console.log('📡 Sending request to:', endpoint);
    console.log('📦 Request payload:', formData);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', [...response.headers.entries()]);
    
    // Baca response sebagai text dulu
    const responseText = await response.text();
    console.log('📥 Raw response text:', responseText);
    
    // Coba parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('❌ Response starts with:', responseText.substring(0, 200));
      
      // Tampilkan error yang lebih informatif
      throw new Error(`Server mengembalikan format tidak valid: ${responseText.substring(0, 100)}`);
    }

    console.log('✅ Parsed response:', result);

    if (result.success) {
      setSuccess(true);
      // Reset form setelah 3 detik
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 3000);
    } else {
      throw new Error(result.message || 'Gagal melakukan pendaftaran');
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Error message yang lebih user-friendly
    if (error.message.includes('Failed to fetch')) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    } else if (error.message.includes('Server mengembalikan format')) {
      setError('Terjadi kesalahan pada server. Silakan coba lagi nanti atau hubungi admin.');
    } else {
      setError(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
    }
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    if (onClose) onClose();
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Pendaftaran Berhasil!
        </h3>
        <p className="text-gray-600 mb-6">
          Terima kasih telah mendaftar sebagai mitra. Tim kami akan menghubungi Anda 
          dalam 1-2 hari kerja untuk proses verifikasi.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
          <p className="text-green-800 font-medium">
            Status: <span className="font-bold">Menunggu Persetujuan</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {['Data Kosan', 'Data Kontak', 'Data Bank', 'Review'].map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 font-medium ${
                index === 0 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 3 && (
                <div className="w-16 h-0.5 bg-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Data Kosan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <FaBuilding className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Data Kosan</h3>
              <p className="text-gray-600">Informasi dasar tentang kosan Anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Kosan *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaBuilding className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Kosan Mawar Indah"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Mitra *
              </label>
              <select
                name="mitra_type"
                value={formData.mitra_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="usaha">Usaha Kosan</option>
                <option value="perorangan">Perorangan</option>
                {/*<option value="corporate">Corporate</option>*/}
              </select>
            </div>
          </div>
        </div>

        {/* Data Kontak */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Data Kontak</h3>
              <p className="text-gray-600">Informasi kontak untuk komunikasi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: 081234567890"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: admin@kosananda.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provinsi *
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((province, index) => (
                  <option key={index} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kota *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!formData.province}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                required
              >
                <option value="">Pilih Kota</option>
                {formData.province && cities[formData.province]?.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Lengkap *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400 mt-1" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Jl. Sangkuriang No. 123, RT 01/RW 02"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Pos *
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contoh: 40135"
                required
              />
            </div>
          </div>
        </div>

        {/* Data Bank */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <FaCreditCard className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Data Rekening Bank</h3>
              <p className="text-gray-600">Untuk pembayaran komisi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Bank *
              </label>
              <select
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Pilih Bank</option>
                {bankOptions.map((bank, index) => (
                  <option key={index} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Rekening *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCreditCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: 1234567890"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Pemilik Rekening *
              </label>
              <input
                type="text"
                name="bank_account_name"
                value={formData.bank_account_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Harus sama dengan nama di buku tabungan"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NPWP (Opsional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaFileAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="npwp"
                  value={formData.npwp}
                  onChange={handleChange}
                  className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: 12.345.678.9-012.345"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Diisi jika kosan memiliki NPWP untuk keperluan pembukuan
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaTimes className="text-red-500 mr-3" />
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 mr-3"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              Saya menyetujui <a href="#" className="text-blue-600 hover:text-blue-800">Syarat & Ketentuan</a> dan <a href="#" className="text-blue-600 hover:text-blue-800">Kebijakan Privasi</a> yang berlaku. Saya memahami bahwa data yang saya berikan akan digunakan untuk keperluan verifikasi dan sistem partnership.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Batalkan
          </button>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                // Reset form
                setFormData({
                  laundry_id: 31,
                  name: '',
                  contact: '',
                  email: '',
                  address: '',
                  city: '',
                  province: '',
                  postal_code: '',
                  mitra_type: 'usaha',
                  fee_percentage: 0.0,
                  bank_name: '',
                  bank_account_number: '',
                  bank_account_name: '',
                  npwp: ''
                });
                setError(null);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                'Kirim Pendaftaran'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MitraRegistrationForm;