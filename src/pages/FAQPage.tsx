import React from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const { buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();

  const waUrl = isWhatsAppConfigured
    ? buildWhatsAppUrl("Assalam-o-Alaikum! I have a question regarding packaging orders and pricing.")
    : '#';

  const faqs = [
    {
      q: "Can I order custom-sized packaging?",
      a: "Yes. Every brand and product is unique. We produce custom die-lines and bespoke dimensions for cake boxes, rigid gift boxes, pizza boxes, and shipping cartons according to your product's exact millimeter measurements.",
    },
    {
      q: "Can I add my company logo and branding artwork?",
      a: "Yes, absolutely. We provide multi-color CMYK offset printing, Pantone spot color matching, metallic thermal foil stamping (gold, silver, rose-gold, copper), embossing/debossing, and spot UV finishing.",
    },
    {
      q: "How can I get an accurate price quotation?",
      a: "Because custom packaging costs depend on box dimensions, board type and grammage (GSM), number of print colors, and order quantity, we provide personalized quotes. Please contact us directly on WhatsApp with your specifications for a fast quote in PKR.",
    },
    {
      q: "What information should I provide when contacting you?",
      a: "To help us quote quickly, please share: 1) Your product type (e.g. bakery, mango, cosmetics), 2) Estimated dimensions (Length x Width x Height), 3) Estimated order quantity, 4) Whether you need custom logo printing or plain boxes, and 5) Your destination city in Pakistan.",
    },
    {
      q: "Do you accept bulk commercial order inquiries?",
      a: "Yes. Our facility in Multan regularly manufactures large commercial production runs for bakeries, agricultural fruit exporters, apparel retail boutiques, and corporate gifting houses.",
    },
    {
      q: "How do I place an order?",
      a: "All orders and technical specifications are finalized directly through WhatsApp with our team. We do not use an automated website checkout because packaging requires proof verification and custom pricing.",
    },
    {
      q: "How are production timelines and deliveries handled?",
      a: "Production lead times depend on your order size and surface finishes. Current schedules and delivery logistics to your city (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, etc.) are agreed upon via WhatsApp prior to initiating production.",
    },
    {
      q: "What is your Minimum Order Quantity (MOQ)?",
      a: "Standard MOQs typically range from 300 to 1,000 pieces depending on whether the packaging is a complex rigid box, a folding paperboard carton, or a corrugated shipper. Please inquire on WhatsApp for the specific MOQ of your required design.",
    },
    {
      q: "Can I see a sample or digital proof before mass production?",
      a: "Yes. Once an order is confirmed, we provide digital flat die-line proofs for artwork approval. Physical sample mockups can also be arranged upon request.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-[#1E1B18]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E1B18] font-semibold">FAQ</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D3B] block mb-2">
            Frequently Asked Questions
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1E1B18]">
            Orders, Sizing & Printing Guidance
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6357] mt-3 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about commissioning custom packaging with Khan & Son's Printer & Packages.
          </p>
        </div>

        {/* Questions Accordion / List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 bg-white border border-[#E8E2D8] hover:border-[#8C6D3B] transition-all rounded-sm shadow-xs"
            >
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#1E1B18] flex items-start gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-[#8C6D3B] shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#5A534A] leading-relaxed pl-8">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Support Banner */}
        <div className="mt-12 p-8 bg-[#1E1B18] text-[#FAF7F2] border border-[#3A332C] text-center space-y-4 rounded-sm">
          <h3 className="font-serif text-2xl font-semibold">
            Need immediate answers for your order?
          </h3>
          <p className="text-xs sm:text-sm text-[#C5BDB2] max-w-lg mx-auto font-light leading-relaxed">
            Our WhatsApp channel is active for consultations, price estimations, and technical packaging recommendations.
          </p>
          <div className="pt-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider shadow"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ask Our Team on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
