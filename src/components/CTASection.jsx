import { FaWhatsapp, FaPhone, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';

const CTASection = ({ cta = {} }) => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden">
          <div className="px-8 py-12 md:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Konten Kiri */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Siap Transformasi Bisnis Laundry Anda?
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Bergabung dengan ribuan pemilik laundry yang sudah meningkatkan pendapatan dan efisiensi operasional dengan CleanCloud.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Uji coba gratis 14 hari</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Dukungan pelatihan gratis</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span>Tidak perlu kontrak jangka panjang</span>
                  </div>
                </div>
              </div>
              
              {/* Konten Kanan - CTA Buttons */}
              <div className="space-y-6">
                <a
                  href={cta.whatsapp || 'https://wa.me/628xxxxxxxxxx'}
                  className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition duration-300 text-lg"
                >
                  <FaWhatsapp className="mr-3 text-xl" />
                  Chat via WhatsApp Sekarang
                </a>
                
                <div className="text-center text-gray-400">ATAU</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="tel:+628xxxxxxxxxx"
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 text-white py-4 px-4 rounded-xl transition duration-300"
                  >
                    <FaPhone className="mb-2" />
                    <span className="text-sm font-medium">Telepon Kami</span>
                  </a>
                  
                  <a
                    href="mailto:sales@cleancloud.cloud"
                    className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 text-white py-4 px-4 rounded-xl transition duration-300"
                  >
                    <FaEnvelope className="mb-2" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                  
                  <a
                    href={cta.login || 'https://cleancloud.cloud/login'}
                    className="col-span-2 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-xl transition duration-300"
                  >
                    <FaCalendarAlt className="mb-2" />
                    <span className="text-sm font-medium">Mulai Uji Coba Gratis</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;