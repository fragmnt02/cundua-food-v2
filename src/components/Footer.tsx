import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-6">
            <a
              href="https://facebook.com/tabascomiendo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
              aria-label="Síguenos en Facebook"
            >
              <FaFacebook className="text-2xl" />
            </a>
            <a
              href="https://instagram.com/tabascomiendo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
              aria-label="Síguenos en Instagram"
            >
              <FaInstagram className="text-2xl" />
            </a>
            <a
              href="https://tiktok.com/@tabascomiendo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
              aria-label="Síguenos en TikTok"
            >
              <FaTiktok className="text-2xl" />
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/contact"
              className="text-gray-600 hover:text-[#ffb400] transition-colors"
            >
              Contáctanos
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Tabascomiendo. Todos los derechos
            reservados.
          </div>
        </div>
      </div>
    </footer>
  );
};
