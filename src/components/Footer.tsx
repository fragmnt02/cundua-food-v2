import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com/tabascomiendo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
              aria-label="Síguenos en Facebook"
            >
              <FaFacebook className="text-lg sm:text-xl" />
            </a>
            <a
              href="https://instagram.com/tabascomiendo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
              aria-label="Síguenos en Instagram"
            >
              <FaInstagram className="text-lg sm:text-xl" />
            </a>
            <a
              href="https://tiktok.com/@tabascomiendo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
              aria-label="Síguenos en TikTok"
            >
              <FaTiktok className="text-lg sm:text-xl" />
            </a>
          </div>

          <div className="text-xs sm:text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Tabascomiendo. Todos los derechos
            reservados.
          </div>

          <Link
            href="/contact"
            className="text-xs sm:text-sm text-gray-600 hover:text-[#ffb400] transition-colors"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </footer>
  );
};
