import React from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, Phone, Mail, MapPin, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#181512] text-[#E8E2D8] border-t border-[#2C2723] pt-14 pb-10 font-sans w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-10 border-b border-[#2C2723] min-w-0">
          {/* Brand & Factory Overview */}
          <div className="space-y-3.5 min-w-0">
            <Link to="/" className="inline-block group">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white uppercase block group-hover:text-[#D4AF37] transition-colors">
                KHANANDSON'S
              </span>
              <span className="text-[10px] font-sans tracking-[0.25em] text-[#D4AF37] uppercase font-semibold">
                PRINTING & PACKAGES
              </span>
            </Link>
            <p className="text-xs text-[#A89F91] leading-relaxed">
              Industrial custom packaging and high-precision Heidelberg offset printing manufacturer based in Multan, serving businesses nationwide across Pakistan.
            </p>
            <div className="text-[11px] text-[#7A7266] pt-1">
              <span>Operating Mon – Sat: 9:00 AM – 8:00 PM PKT</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-xs tracking-widest uppercase text-white font-semibold mb-3.5 pb-2 border-b border-[#2C2723]">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#A89F91]">
              <li>
                <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#D4AF37] transition-colors">Packaging Catalog</Link>
              </li>
              <li>
                <Link to="/custom-packaging" className="hover:text-[#D4AF37] transition-colors">Custom Quote</Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-[#D4AF37] transition-colors">3D Gallery</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Packaging Types */}
          <div>
            <h4 className="font-serif text-xs tracking-widest uppercase text-white font-semibold mb-3.5 pb-2 border-b border-[#2C2723]">
              Packaging Types
            </h4>
            <ul className="space-y-2 text-xs text-[#A89F91]">
              <li>
                <Link to="/category/rigid-boxes" className="hover:text-[#D4AF37] transition-colors">
                  Rigid Luxury Boxes
                </Link>
              </li>
              <li>
                <Link to="/category/corrugated-boxes" className="hover:text-[#D4AF37] transition-colors">
                  Corrugated Shipping Cartons
                </Link>
              </li>
              <li>
                <Link to="/category/sweet-boxes" className="hover:text-[#D4AF37] transition-colors">
                  Sweet & Mithai Boxes
                </Link>
              </li>
              <li>
                <Link to="/category/food-packaging" className="hover:text-[#D4AF37] transition-colors">
                  Food & Burger Packaging
                </Link>
              </li>
              <li>
                <Link to="/category/apparel-boxes" className="hover:text-[#D4AF37] transition-colors">
                  Apparel & Garment Boxes
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Inquiries */}
          <div>
            <h4 className="font-serif text-xs tracking-widest uppercase text-white font-semibold mb-3.5 pb-2 border-b border-[#2C2723]">
              Factory Inquiries
            </h4>
            <ul className="space-y-2.5 text-xs text-[#A89F91]">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Printing Market, Near Railway Road, Multan, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href="tel:+923108216304" className="hover:text-white transition-colors">
                  0310 8216304 / 0318 1718476
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <a
                  href="https://wa.me/923108216304?text=Assalam-o-Alaikum!%20I%20would%20like%20to%20inquire%20about%20packaging."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors"
                >
                  WhatsApp: 0310 8216304
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <a href="mailto:nasirkhanprinting@gmail.com" className="hover:text-white transition-colors truncate">
                  nasirkhanprinting@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A7266] gap-3">
          <p>© {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
          <div className="flex items-center space-x-5">
            <Link to="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-[#D4AF37] transition-colors">Terms</Link>
            <Link to="/admin/login" className="hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-[#8C6D3B]">
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
