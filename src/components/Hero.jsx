import { FaArrowRight, FaShieldAlt, FaChartLine } from 'react-icons/fa';

const Hero = ({ data }) => {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Konten Kiri */}
        <div>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6">
            <FaShieldAlt className="mr-2" />
            <span className="font-semibold">Trusted by 5,000+ Laundry Businesses</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Kelola Laundry Anda dengan
            <span className="text-blue-600 block">Lebih Cerdas</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {data?.description || "Platform all-in-one untuk mengoptimalkan operasional laundry dengan manajemen pelanggan, transaksi otomatis, dan laporan keuangan real-time."}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">99%</div>
              <div className="text-gray-600">Kepuasan Pelanggan</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">40%</div>
              <div className="text-gray-600">Peningkatan Efisiensi</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-gray-600">Dukungan Operasional</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href={data?.cta?.login || '#'}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition duration-300 shadow-lg hover:shadow-xl"
            >
              Mulai Gratis 14 Hari
              <FaArrowRight className="ml-2" />
            </a>
            <a 
              href={data?.cta?.whatsapp || '#'}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition duration-300"
            >
              Konsultasi Gratis
            </a>
          </div>
        </div>
        
        {/* Ilustrasi Kanan */}
        <div className="relative">
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
              <div className="text-center p-8">
                <FaChartLine className="text-6xl text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Real-time</h3>
                <p className="text-gray-600">Pantau semua transaksi dan performa bisnis dari satu dashboard</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full"></div>
          <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-green-500/10 rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;