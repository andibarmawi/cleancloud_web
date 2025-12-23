import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaLinkedin, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="ml-3 text-2xl font-bold">CleanCloud</span>
            </div>
            <p className="text-gray-400 mb-6">
              Platform manajemen laundry terdepan di Indonesia, membantu ribuan bisnis laundry tumbuh lebih cepat.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Tautan Cepat</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-400 hover:text-white transition">Fitur</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-white transition">Harga</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-white transition">Tentang Kami</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition">Kontak</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-6">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Syarat & Ketentuan</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Kebijakan Privasi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">GDPR</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Kontak</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <FaMapMarkerAlt className="mr-3" />
                <span>Jl. Teknologi No. 123, Jakarta</span>
              </li>
              <li className="flex items-center text-gray-400">
                <FaPhone className="mr-3" />
                <span>+62 812 3456 7890</span>
              </li>
              <li className="flex items-center text-gray-400">
                <FaEnvelope className="mr-3" />
                <span>hello@cleancloud.cloud</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} CleanCloud. All rights reserved. 
            PT. CleanCloud Teknologi Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;