import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, X, ChevronUp, Phone } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (!isWhatsAppConfigured) return null;

  const defaultMsg = "Assalam-o-Alaikum! I am visiting KHAN&SON'S PRINTER & PACKAGES website and would like to inquire about packaging solutions.";
  const waUrl1 = buildWhatsAppUrl(defaultMsg, false);
  const waUrl2 = buildWhatsAppUrl(defaultMsg, true);

  return (
    <aside
      aria-label="WhatsApp customer assistance"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end max-w-[calc(100vw-2rem)]"
    >
      {/* Dual Number Popup Card */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-72 max-w-xs bg-[#181512] text-[#F5F0E8] border border-[#3A332C] p-4 rounded-sm shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between border-b border-[#2C2723] pb-2 mb-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                Direct WhatsApp Lines
              </span>
              <h4 className="font-serif text-sm font-semibold text-white">
                Khan & Son's Support
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#9E978E] hover:text-white p-1"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-[#A89F91] mb-3 leading-relaxed">
            Chat directly with our packaging team in Multan:
          </p>

          <div className="space-y-2">
            <a
              href={waUrl1}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 bg-[#25201B] hover:bg-[#25D366] text-white hover:text-white rounded-xs border border-[#3A332C] hover:border-[#25D366] transition-all group"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                <div>
                  <span className="text-xs font-semibold block">0310 8216304</span>
                  <span className="text-[10px] text-[#A89F91] group-hover:text-white/90">Primary Line</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-semibold text-[#D4AF37] group-hover:text-white tracking-wider">
                Chat
              </span>
            </a>

            <a
              href={waUrl2}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 bg-[#25201B] hover:bg-[#25D366] text-white hover:text-white rounded-xs border border-[#3A332C] hover:border-[#25D366] transition-all group"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                <div>
                  <span className="text-xs font-semibold block">0318 1718476</span>
                  <span className="text-[10px] text-[#A89F91] group-hover:text-white/90">Secondary Line</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-semibold text-[#D4AF37] group-hover:text-white tracking-wider">
                Chat
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
        aria-label="Open WhatsApp direct chat"
        title="Direct WhatsApp Inquiries: 0310 8216304 / 0318 1718476"
      >
        <MessageCircle className="w-7 h-7 fill-white text-[#25D366]" />
      </button>
    </aside>
  );
};
