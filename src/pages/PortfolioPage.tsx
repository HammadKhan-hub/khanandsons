import React from 'react';
import { Gallery3DSection } from '../components/Gallery3DSection';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, Sparkles, ArrowRight, Layers, ShieldCheck, Printer } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();

  const waUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl("Assalam-o-Alaikum! I am viewing your 3D Packaging Gallery and would like to discuss custom manufacturing for my brand.")
    : 'https://wa.me/923108216304';

  return (
    <div className="min-h-screen bg-[#FAF7F2] w-full max-w-full overflow-hidden">
      {/* Page Introduction Banner */}
      <div className="bg-[#181512] text-[#FAF7F2] py-14 border-b border-[#2C2723]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#25201B] border border-[#3A332C] text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37] mb-3 rounded-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Interactive 3D Portfolio</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-white">
            Packaging Design & Production Showcase
          </h1>
          <p className="text-xs sm:text-sm text-[#A89F91] mt-3 leading-relaxed font-light">
            Switch between 3D Coverflow, 3D Stack, and Perspective Grid layouts below to inspect our custom box structures, retail bags, and commercial printing finishes.
          </p>
        </div>
      </div>

      {/* Interactive 3D Gallery Section with Layout Switcher */}
      <Gallery3DSection />

      {/* Production Standards Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs shadow-xs">
            <Layers className="w-5 h-5 text-[#8C6D3B] mb-3" />
            <h3 className="font-serif text-base font-semibold text-[#1E1B18] mb-1">
              Bespoke Structural Prototyping
            </h3>
            <p className="text-xs text-[#6B6357] leading-relaxed">
              Every package is precision-engineered using custom die-cutting dies matching your exact bottle, pastry, or merchandise geometry.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs shadow-xs">
            <Printer className="w-5 h-5 text-[#8C6D3B] mb-3" />
            <h3 className="font-serif text-base font-semibold text-[#1E1B18] mb-1">
              Commercial Color Integrity
            </h3>
            <p className="text-xs text-[#6B6357] leading-relaxed">
              Multi-color Heidelberg offset printing with tight registration and Pantone spot ink formulation for uncompromised brand consistency.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8E2D8] rounded-xs shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#8C6D3B] mb-3" />
            <h3 className="font-serif text-base font-semibold text-[#1E1B18] mb-1">
              Rigorous Quality Checking
            </h3>
            <p className="text-xs text-[#6B6357] leading-relaxed">
              Every batch undergoes burst-testing, fold endurance tests, and coating quality verification before nationwide dispatch from Multan.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 bg-[#1E1B18] text-[#FAF7F2] border border-[#3A332C] text-center space-y-4 rounded-xs">
          <h3 className="font-serif text-2xl font-semibold">
            Have a custom design concept in mind?
          </h3>
          <p className="text-xs sm:text-sm text-[#C5BDB2] max-w-xl mx-auto font-light leading-relaxed">
            Send us your reference images, dieline sketches, or dimensional criteria directly on WhatsApp.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-full">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex flex-wrap items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors shadow-lg text-center"
            >
              <MessageCircle className="w-4 h-4 fill-white shrink-0" />
              <span className="text-center break-words">Discuss Project on WhatsApp (0310 8216304 / 0318 1718476)</span>
            </a>
            <Link
              to="/custom-packaging"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent hover:bg-white text-white hover:text-[#1E1B18] text-xs font-semibold uppercase tracking-wider rounded-xs border border-white/40 transition-colors text-center"
            >
              <span>Submit Custom Form</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
