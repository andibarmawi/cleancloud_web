import { useState } from 'react';
import { FaBars, FaTimes, FaUserCircle, FaWhatsapp } from 'react-icons/fa';

const Header = ({ appName = 'CleanCloud' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">{appName}</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-primary font-medium transition">
              Fitur
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-primary font-medium transition">
              Harga
            </a>
            <a href="#about" className="text-gray-700 hover:text-primary font-medium transition">
              Tentang
            </a>
            <a href="#contact" className="text-gray-700 hover:text-primary font-medium transition">
              Kontak
            </a>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://cleancloud.cloud/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
              >
                <FaUserCircle className="mr-2" />
                Login
              </a>
              <a
                href="https://wa.me/628xxxxxxxxxx"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
              >
                <FaWhatsapp className="mr-2" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 hover:text-primary font-medium px-2 py-2">
                Fitur
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-primary font-medium px-2 py-2">
                Harga
              </a>
              <a href="#about" className="text-gray-700 hover:text-primary font-medium px-2 py-2">
                Tentang
              </a>
              <a href="#contact" className="text-gray-700 hover:text-primary font-medium px-2 py-2">
                Kontak
              </a>
              
              <div className="pt-4 space-y-3">
                <a
                  href="https://cleancloud.cloud/login"
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition"
                >
                  <FaUserCircle className="inline mr-2" />
                  Login
                </a>
                <a
                  href="https://wa.me/628xxxxxxxxxx"
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
                >
                  <FaWhatsapp className="inline mr-2" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;