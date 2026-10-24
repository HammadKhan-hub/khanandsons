import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { X, MessageCircle, Phone, Mail } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings, buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (!settings.announcementEnabled || dismissed || !settings.announcementText) {
    return null;
  }

  const defaultMsg = "Assalam-o-Alaikum! I am reaching out from your website to inquire about custom packaging and printing.";
  const waUrl1 = isWhatsAppConfigured ? buildWhatsAppUrl(defaultMsg, false) : '#';
  const waUrl2 = isWhatsAppConfigured ? buildWhatsAppUrl(defaultMsg, true) : '#';

  return (
    <div className="w-full bg-[#181512] text-[#F5F0E8] text-[11px] sm:text-xs font-sans tracking-wide py-2 px-3 sm:px-4 border-b border-[#2C2723] relative transition-all overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        <div className="flex-1 text-center font-normal flex items-center justify-center gap-2 sm:gap-3 flex-wrap min-w-0 max-w-full">
          <span className="text-[#E8E2D8] font-medium break-normal">{settings.announcementText}</span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[#D4AF37] min-w-0">
            <a
              href={waUrl1}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#E5C158] font-medium underline underline-offset-4 transition-colors shrink-0"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span>WhatsApp: 0310 8216304</span>
            </a>
            <span className="text-[#6B6357] hidden md:inline">•</span>
            <a
              href={waUrl2}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#E5C158] font-medium underline underline-offset-4 transition-colors hidden md:inline-flex shrink-0"
            >
              <span>0318 1718476</span>
            </a>
            <span className="text-[#6B6357] hidden lg:inline">•</span>
            <a
              href={`mailto:${settings.email || 'nasirkhanprinting@gmail.com'}`}
              className="inline-flex items-center gap-1 hover:text-white transition-colors text-[#A89F91] hidden lg:inline-flex truncate max-w-[200px]"
            >
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">{settings.email || 'nasirkhanprinting@gmail.com'}</span>
            </a>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-[#9E978E] hover:text-white p-0.5 rounded-xs transition-colors shrink-0"
          title="Dismiss announcement"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
