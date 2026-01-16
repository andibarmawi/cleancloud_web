// src/pages/MitraLandingPage.jsx
import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../apiConfig';
import { Link } from 'react-router-dom';
import {
  FaBuilding,
  FaUsers,
  FaChartLine,
  FaMoneyBillWave,
  FaShieldAlt,
  FaHandshake,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaStar,
  FaQuoteLeft,
  FaMobileAlt,
  FaCogs,
  FaUserPlus,
  FaTachometerAlt,
  FaPlayCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGlobe,
  FaWhatsapp
} from 'react-icons/fa';
import MitraRegistrationForm from '../components/MitraRegistrationForm';
import mitraLandingImage from '../assets/images/mitra_landing_page.png';

// Dynamic icon mapping
const iconMap = {
  FaBuilding: FaBuilding,
  FaUsers: FaUsers,
  FaChartLine: FaChartLine,
  FaMoneyBillWave: FaMoneyBillWave,
  FaShieldAlt: FaShieldAlt,
  FaHandshake: FaHandshake,
  FaClock: FaClock,
  FaCheckCircle: FaCheckCircle,
  FaArrowRight: FaArrowRight,
  FaStar: FaStar,
  FaQuoteLeft: FaQuoteLeft,
  FaMobileAlt: FaMobileAlt,
  FaCogs: FaCogs,
  FaUserPlus: FaUserPlus,
  FaTachometerAlt: FaTachometerAlt,
  FaPlayCircle: FaPlayCircle,
  FaEnvelope: FaEnvelope,
  FaMapMarkerAlt: FaMapMarkerAlt,
  FaGlobe: FaGlobe,
  FaWhatsapp: FaWhatsapp
};

const MitraLandingPage = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
    const response = await fetch(
        buildApiUrl('/public/mitra/landingpage')
    );

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Debug log untuk melihat struktur response
      console.log('API Response:', result);
      
      if (result.success) {
        setPageData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching page data:', err);
      setError(err.message);
      // Fallback to default data
      setPageData(getDefaultData());
    } finally {
      setLoading(false);
    }
  };

  // Default fallback data
  const getDefaultData = () => ({
    stats: {
      total_partners: 1250,
      total_transactions: 58420,
      average_commission: "Rp 2.5jt",
      satisfaction_rate: 98.5
    },
    benefits: [
      {
        id: 1,
        icon: "FaMoneyBillWave",
        title: "Pendapatan Pasif",
        description: "Dapatkan komisi 10% dari setiap transaksi laundry penghuni kosan",
        order: 1,
        is_active: true
      },
      {
        id: 2,
        icon: "FaUsers",
        title: "Nilai Tambah Layanan",
        description: "Tingkatkan kepuasan penghuni dengan layanan laundry yang mudah",
        order: 2,
        is_active: true
      },
      {
        id: 3,
        icon: "FaChartLine",
        title: "Laporan Real-time",
        description: "Pantau semua transaksi melalui dashboard mitra yang lengkap",
        order: 3,
        is_active: true
      },
      {
        id: 4,
        icon: "FaShieldAlt",
        title: "Sistem Terpercaya",
        description: "Transaksi aman dengan sistem pencatatan yang transparan",
        order: 4,
        is_active: true
      }
    ],
    how_it_works: [
      {
        id: 1,
        step: 1,
        title: "Daftar sebagai Mitra",
        description: "Isi formulir pendaftaran dengan data lengkap kosan Anda",
        icon: "FaUserPlus",
        order: 1,
        is_active: true
      },
      {
        id: 2,
        step: 2,
        title: "Verifikasi Admin",
        description: "Tim kami akan memverifikasi data dalam 1-2 hari kerja",
        icon: "FaCheckCircle",
        order: 2,
        is_active: true
      },
      {
        id: 3,
        step: 3,
        title: "Akses Dashboard",
        description: "Dapatkan akses ke dashboard mitra dengan kredensial unik",
        icon: "FaTachometerAlt",
        order: 3,
        is_active: true
      },
      {
        id: 4,
        step: 4,
        title: "Mulai Beroperasi",
        description: "Penghuni bisa mulai menggunakan layanan laundry melalui platform",
        icon: "FaPlayCircle",
        order: 4,
        is_active: true
      }
    ],
    testimonials: [],
    faqs: [
      {
        id: 1,
        question: "Berapa komisi yang didapatkan mitra?",
        answer: "Mitra mendapatkan komisi 10% dari setiap transaksi laundry yang dilakukan oleh penghuni kosan.",
        category: "commission",
        order: 1,
        is_active: true
      },
      {
        id: 2,
        question: "Apakah ada biaya pendaftaran atau bulanan?",
        answer: "Tidak ada biaya pendaftaran, tidak ada biaya bulanan. Gratis sepenuhnya untuk bergabung.",
        category: "fees",
        order: 2,
        is_active: true
      },
      {
        id: 3,
        question: "Berapa lama proses verifikasi?",
        answer: "Proses verifikasi biasanya memakan waktu 1-2 hari kerja setelah pengisian formulir lengkap.",
        category: "verification",
        order: 3,
        is_active: true
      },
      {
        id: 4,
        question: "Bagaimana cara pencairan komisi?",
        answer: "Komisi akan dicairkan setiap akhir bulan melalui transfer bank ke rekening yang terdaftar.",
        category: "payout",
        order: 4,
        is_active: true
      }
    ],
    contact_info: {
      company_name: "CleanCloud Partner",
      phone: "+62 812 3456 7890",
      email: "support@cleancloud.cloud",
      whatsapp: "+6281234567890",
      address: "Jl. Teknologi No. 123, Jakarta Selatan, Indonesia",
      website: "https://cleancloud.cloud",
      support_links: [
        {
          name: "Pusat Bantuan",
          url: "/help-center"
        },
        {
          name: "Syarat & Ketentuan",
          url: "/terms"
        },
        {
          name: "Kebijakan Privasi",
          url: "/privacy"
        }
      ]
    },
    business_hours: [
      {
        day: "Senin - Jumat",
        hours: "08:00 - 17:00",
        is_open: true
      },
      {
        day: "Sabtu",
        hours: "08:00 - 12:00",
        is_open: true
      },
      {
        day: "Minggu",
        hours: "Tutup",
        is_open: false
      }
    ],
    cta: {
      title: "Siap Mengembangkan Bisnis Kosan Anda?",
      subtitle: "Bergabung dengan ratusan mitra yang telah merasakan manfaat partnership dengan CleanCloud. Gratis pendaftaran tanpa biaya bulanan.",
      button_text: "Daftar Sekarang Gratis",
      approval_time: "Persetujuan dalam 1-2 hari kerja"
    },
    meta: {
      page_title: "Mitra Landing Page - CleanCloud Partner",
      page_description: "Jadilah Partner Kami - Tingkatkan Nilai Kosan Anda",
      keywords: ["mitra laundry", "partner kosan", "pendapatan tambahan"],
      last_updated: new Date().toISOString(),
      version: "1.0.0"
    }
  });

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="text-2xl" /> : <FaCogs className="text-2xl" />;
  };

  // Filter active items
  const getActiveItems = (items) => {
    if (!items) return [];
    return items.filter(item => item.is_active).sort((a, b) => a.order - b.order);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error && !pageData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
            <FaCogs className="text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchPageData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const data = pageData || getDefaultData();
  
  // Debug log untuk memastikan data diterima dengan benar
  console.log('Current data:', data);
  
  // Pastikan semua data ada dengan nilai default jika undefined
  const stats = data.stats || getDefaultData().stats;
  const benefits = data.benefits || getDefaultData().benefits;
  const howItWorks = data.how_it_works || getDefaultData().how_it_works;
  const testimonials = data.testimonials || getDefaultData().testimonials;
  const faqs = data.faqs || getDefaultData().faqs;
  const contactInfo = data.contact_info || getDefaultData().contact_info;
  const businessHours = data.business_hours || getDefaultData().business_hours;
  const cta = data.cta || getDefaultData().cta;
  const meta = data.meta || getDefaultData().meta;

  const activeBenefits = getActiveItems(benefits);
  const activeHowItWorks = getActiveItems(howItWorks);
  const activeTestimonials = getActiveItems(testimonials);
  const activeFaqs = getActiveItems(faqs);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Set page metadata */}
      <head>
        <title>{meta?.page_title || "Mitra Landing Page - CleanCloud Partner"}</title>
        <meta name="description" content={meta?.page_description || ""} />
        <meta name="keywords" content={meta?.keywords?.join(', ') || ""} />
      </head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FaBuilding className="text-2xl text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">
                {contactInfo?.company_name || "CleanCloud Partner"}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-blue-600 transition"
              >
                Home
              </Link>
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-md"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Stats */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text Content */}
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Jadilah <span className="text-blue-600">Partner</span> Kami
                <br />
                <span className="text-3xl md:text-5xl">Tingkatkan Nilai Kosan Anda</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Dapatkan pendapatan tambahan dengan menyediakan layanan laundry premium 
                untuk penghuni kosan. Sistem kami yang terintegrasi memudahkan pengelolaan 
                dan meningkatkan kepuasan penghuni.
              </p>
              
              {/* Stats Section */}
             {stats && (
                <div className="bg-white p-4 rounded-xl shadow-lg mb-10 overflow-hidden relative 
            border-0 border-blue-500">


                    {/* Background glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-green-100/20 to-purple-100/20 blur-xl"></div>
                    
                    <div className="flex items-center gap-10 animate-marquee whitespace-nowrap relative z-10">
                    
                    {/* Mitra Aktif */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                        <span className="text-blue-600 font-bold text-2xl relative z-10 tracking-wide">
                            {stats.total_partners
                            ? stats.total_partners.toLocaleString('id-ID')
                            : '0'}
                        </span>
                        {/* 3D Shadow Effect */}
                        <span className="absolute top-[2px] left-[2px] text-blue-800/30 font-bold text-2xl tracking-wide">
                            {stats.total_partners
                            ? stats.total_partners.toLocaleString('id-ID')
                            : '0'}
                        </span>
                        </div>
                        <span className="text-gray-700 text-sm font-medium ml-1">Mitra Aktif</span>
                    </div>

                    {/* Separator */}
                    <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                    {/* Transaksi */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                        <span className="text-green-600 font-bold text-2xl relative z-10 tracking-wide">
                            {stats.total_transactions
                            ? stats.total_transactions.toLocaleString('id-ID')
                            : '0'}
                        </span>
                        {/* 3D Shadow Effect */}
                        <span className="absolute top-[2px] left-[2px] text-green-800/30 font-bold text-2xl tracking-wide">
                            {stats.total_transactions
                            ? stats.total_transactions.toLocaleString('id-ID')
                            : '0'}
                        </span>
                        </div>
                        <span className="text-gray-700 text-sm font-medium ml-1">Transaksi</span>
                    </div>

                    {/* Separator */}
                    <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                    {/* Rata-rata Komisi */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                        <span className="text-purple-600 font-bold text-2xl relative z-10 tracking-wide">
                            {stats.average_commission || 'Rp 0'}
                        </span>
                        {/* 3D Shadow Effect */}
                        <span className="absolute top-[2px] left-[2px] text-purple-800/30 font-bold text-2xl tracking-wide">
                            {stats.average_commission || 'Rp 0'}
                        </span>
                        </div>
                        <span className="text-gray-700 text-sm font-medium ml-1">Rata-rata Komisi / Bulan</span>
                    </div>

                    {/* Separator */}
                    <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                    {/* Kepuasan Mitra */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                        <span className="text-yellow-600 font-bold text-2xl relative z-10 tracking-wide">
                            {stats.satisfaction_rate
                            ? `${stats.satisfaction_rate}%`
                            : '0%'}
                        </span>
                        {/* 3D Shadow Effect */}
                        <span className="absolute top-[2px] left-[2px] text-yellow-800/30 font-bold text-2xl tracking-wide">
                            {stats.satisfaction_rate
                            ? `${stats.satisfaction_rate}%`
                            : '0%'}
                        </span>
                        </div>
                        <span className="text-gray-700 text-sm font-medium ml-1">Kepuasan Mitra</span>
                    </div>

                    </div>
                </div>
                )}

              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg flex items-center justify-center"
                >
                  {cta?.button_text || "Daftar Sekarang"} <FaArrowRight className="ml-2" />
                </button>
                <a 
                  href="#how-it-works"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition text-center"
                >
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>
            
            {/* Image Content */}
            <div className="lg:w-1/2">
              <div className="relative">
                <img 
                  src={mitraLandingImage} 
                  alt="Dashboard mitra CleanCloud - Manajemen laundry kosan"
                  className="rounded-2xl shadow-2xl transform hover:scale-[1.02] transition duration-500"
                />
                {/* Efek dekoratif */}
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-20 -z-10"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400 rounded-full opacity-20 -z-10"></div>
              </div>
              
              {cta?.approval_time && (
                <div className="mt-6 bg-white rounded-lg p-4 shadow-md flex items-center">
                  <FaClock className="text-blue-600 mr-3" />
                  <span className="text-gray-700">{cta.approval_time}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Keuntungan Menjadi Mitra
            </h2>
            <p className="text-xl text-gray-600">
              Bergabung dengan CleanCloud membawa banyak manfaat untuk bisnis kosan Anda
            </p>
          </div>
          
          {activeBenefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeBenefits.map((benefit) => (
                <div 
                  key={benefit.id} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                    {getIconComponent(benefit.icon)}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Data keuntungan tidak tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cara Bergabung
            </h2>
            <p className="text-xl text-gray-600">
              Proses bergabung yang sederhana dan cepat
            </p>
          </div>
          
          {activeHowItWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeHowItWorks.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {index < activeHowItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                      <FaArrowRight className="text-2xl text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Data cara bergabung tidak tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {activeTestimonials && activeTestimonials.length > 0 ? (
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Testimoni Mitra
              </h2>
              <p className="text-xl text-gray-600">
                Dengar langsung dari mitra yang telah bergabung
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeTestimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    <FaQuoteLeft className="text-2xl text-blue-600 mr-3" />
                    <div className="flex">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    {testimonial.avatar_url ? (
                      <img 
                        src={testimonial.avatar_url} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                        {testimonial.name?.charAt(0) || 'M'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name || 'Mitra'}</div>
                      <div className="text-gray-600">{testimonial.role || 'Pengelola Kosan'}</div>
                      {testimonial.join_date && (
                        <div className="text-sm text-gray-500 mt-1">
                          Bergabung sejak {new Date(testimonial.join_date).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaHandshake className="text-5xl text-white mb-6 mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {cta?.title || "Siap Mengembangkan Bisnis Kosan Anda?"}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {cta?.subtitle || "Bergabung dengan ratusan mitra yang telah merasakan manfaat partnership dengan CleanCloud."}
          </p>
          <button
            onClick={() => setShowRegistration(true)}
            className="bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition shadow-xl"
          >
            {cta?.button_text || "Daftar Sekarang Gratis"}
          </button>
          {cta?.approval_time && (
            <p className="text-blue-200 mt-4">
              {cta.approval_time}
            </p>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan Umum
            </h2>
          </div>
          
          {activeFaqs.length > 0 ? (
            <div className="space-y-6">
              {activeFaqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition">
                  <div className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Data FAQ tidak tersedia</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <FaBuilding className="text-2xl text-blue-400 mr-2" />
                <span className="text-xl font-bold">
                  {contactInfo?.company_name || "CleanCloud Partner"}
                </span>
              </div>
              <p className="text-gray-400">
                Platform partnership laundry untuk pengelola kosan terpercaya.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              {contactInfo?.phone && (
                <p className="text-gray-400 mb-2">
                  <FaMobileAlt className="inline mr-2" />
                  {contactInfo.phone}
                </p>
              )}
              {contactInfo?.whatsapp && (
                <p className="text-gray-400 mb-2">
                  <FaWhatsapp className="inline mr-2" />
                  {contactInfo.whatsapp}
                </p>
              )}
              {contactInfo?.email && (
                <p className="text-gray-400 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  {contactInfo.email}
                </p>
              )}
              {contactInfo?.address && (
                <p className="text-gray-400">
                  <FaMapMarkerAlt className="inline mr-2" />
                  {contactInfo.address}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                {(contactInfo?.support_links || []).map((link, index) => (
                  <li key={index}>
                    <a href={link.url} className="hover:text-white transition">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Jam Operasional</h4>
              {(businessHours || []).map((hours, index) => (
                <p key={index} className={`text-gray-400 ${index < (businessHours?.length || 0) - 1 ? 'mb-2' : ''}`}>
                  <FaClock className="inline mr-2" />
                  <span className={!hours.is_open ? 'line-through' : ''}>
                    {hours.day}: {hours.hours}
                  </span>
                </p>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {contactInfo?.company_name || "CleanCloud Partner"}. All rights reserved.</p>
            {meta?.last_updated && (
              <p className="text-sm mt-2">
                Terakhir diperbarui: {new Date(meta.last_updated).toLocaleDateString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </footer>

      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Formulir Pendaftaran Mitra
                </h2>
                <button
                  onClick={() => setShowRegistration(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
              <MitraRegistrationForm onClose={() => setShowRegistration(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MitraLandingPage;