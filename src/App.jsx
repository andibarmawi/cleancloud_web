import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSync, FaUsers } from 'react-icons/fa';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

import { fetchLandingPageData } from './services/api';

// ===============================
// Dashboard Quick Links Component
// ===============================
const DashboardQuickLinks = () => {
  return (
    <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Akses Cepat</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/customers"
          className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition"
        >
          <FaUsers className="text-2xl text-blue-600 mb-2" />
          <span className="font-medium text-blue-700">Pelanggan</span>
        </Link>

        {/* Tambahkan item lainnya di sini */}
      </div>
    </div>
  );
};

function App() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLandingPageData();
    setPageData(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSync className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">

      <Header appName={pageData?.data?.app_name || 'CleanCloud'} />

      <Hero data={pageData?.data} />

      {/* 🔥 Tambahkan Quick Links di sini */}
      <DashboardQuickLinks />

      <Features features={pageData?.data?.features} />

      <CTASection cta={pageData?.data?.cta} />

      <Footer />
    </div>
  );
}

export default App;
