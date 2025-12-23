import { 
  FaUsers, 
  FaExchangeAlt, 
  FaChartBar, 
  FaTachometerAlt, 
  FaCreditCard, 
  FaBuilding, 
  FaFileInvoice, 
  FaHistory 
} from 'react-icons/fa';

const Features = ({ features = [] }) => {
  const featureIcons = [
    <FaUsers className="text-blue-600 text-2xl" />,
    <FaExchangeAlt className="text-green-600 text-2xl" />,
    <FaChartBar className="text-purple-600 text-2xl" />,
    <FaTachometerAlt className="text-red-600 text-2xl" />,
    <FaCreditCard className="text-yellow-600 text-2xl" />,
    <FaBuilding className="text-indigo-600 text-2xl" />,
    <FaFileInvoice className="text-pink-600 text-2xl" />,
    <FaHistory className="text-teal-600 text-2xl" />
  ];

  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fitur Unggulan CleanCloud
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola bisnis laundry secara profesional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start mb-4">
                <div className="p-3 rounded-lg bg-gray-50 mr-4">
                  {featureIcons[index] || <FaUsers className="text-blue-600 text-2xl" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{feature}</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    Sistem terintegrasi untuk efisiensi operasional maksimal
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Semua Dalam Satu Platform</h3>
          <p className="text-lg mb-6">
            Tidak perlu menggunakan aplikasi berbeda untuk setiap kebutuhan. CleanCloud menyediakan semua fitur dalam satu dashboard yang mudah digunakan.
          </p>
          <a 
            href="#"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
          >
            Lihat Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default Features;