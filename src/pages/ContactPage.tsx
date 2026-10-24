import React, { useState } from 'react';
import { Link } from '../router/Router';
import { useSettings } from '../context/SettingsContext';
import { submitInquiry } from '../services/dataService';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, buildWhatsAppUrl, isWhatsAppConfigured } = useSettings();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [subject, setSubject] = useState('Packaging Inquiries');
  const [preferredLine, setPreferredLine] = useState<'0310' | '0318'>('0310');
  const [message, setMessage] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const waUrl1 = isWhatsAppConfigured
    ? buildWhatsAppUrl(`Assalam-o-Alaikum! I am contacting KHAN&SON'S PRINTER & PACKAGES regarding ${subject}.`, false)
    : '#';
  const waUrl2 = isWhatsAppConfigured
    ? buildWhatsAppUrl(`Assalam-o-Alaikum! I am contacting KHAN&SON'S PRINTER & PACKAGES regarding ${subject}.`, true)
    : '#';

  const handleWhatsAppDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please provide your name, phone number, and inquiry message.');
      setStatus('error');
      return;
    }

    const fullMessage = [
      `Assalam-o-Alaikum! General Inquiry from Website:`,
      ``,
      `👤 Name: ${name.trim()}`,
      `📞 Phone: ${phone.trim()}`,
      `📍 City: ${city.trim() || 'Pakistan'}`,
      `📦 Topic: ${subject}`,
      ``,
      `💬 Message:`,
      message.trim(),
    ].join('\n');

    const url = buildWhatsAppUrl(fullMessage, preferredLine === '0318');
    if (isWhatsAppConfigured) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSaveContactInquiry = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please enter your name, contact phone, and message before saving.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      await submitInquiry({
        customerName: name.trim(),
        phone: phone.trim(),
        city: city.trim() || 'Pakistan',
        category: subject,
        quantity: 'Not specified',
        description: message.trim(),
      });
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Failed to save message. Please use direct WhatsApp instead.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Breadcrumb */}
        <nav className="text-xs text-[#7A7266] uppercase tracking-wider mb-6">
          <Link to="/" className="hover:text-[#1E1B18]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-[#1E1B18] font-semibold">Contact Us</span>
        </nav>

        {/* Header */}
        <div className="mb-12 border-b border-[#E8E2D8] pb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8C6D3B] block mb-2">
            Get In Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1E1B18]">
            Connect With Our Printing Team
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6357] mt-2 max-w-xl">
            Reach out via WhatsApp or phone for quotations, material samples, or delivery schedules across Pakistan.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary WhatsApp Card with Dual Numbers */}
            <div className="bg-[#181512] text-[#FAF7F2] p-6 sm:p-8 rounded-sm border border-[#3A332C] space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold block">
                    Fastest Response
                  </span>
                  <h3 className="font-serif text-xl font-bold">
                    Direct WhatsApp Lines
                  </h3>
                </div>
              </div>

              <p className="text-xs text-[#C5BDB2] leading-relaxed">
                Connect directly with our production specialists in Multan. Share reference artwork, box dimensions, and required quantities.
              </p>

              {/* Dual Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={waUrl1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-[#25201B] hover:bg-[#25D366] text-white hover:text-white text-xs font-semibold uppercase tracking-wider border border-[#3A332C] hover:border-[#25D366] transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                    <span>0310 8216304</span>
                  </div>
                  <span className="text-[11px] text-[#D4AF37] group-hover:text-white">Primary Line →</span>
                </a>

                <a
                  href={waUrl2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-[#25201B] hover:bg-[#25D366] text-white hover:text-white text-xs font-semibold uppercase tracking-wider border border-[#3A332C] hover:border-[#25D366] transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                    <span>0318 1718476</span>
                  </div>
                  <span className="text-[11px] text-[#D4AF37] group-hover:text-white">Secondary Line →</span>
                </a>
              </div>
            </div>

            {/* Business Contact Info Card */}
            <div className="bg-white border border-[#E8E2D8] p-6 sm:p-8 rounded-sm space-y-5 shadow-xs">
              <h3 className="font-serif text-lg font-semibold text-[#1E1B18] border-b border-[#F0ECE4] pb-2">
                Business & Facility Details
              </h3>

              <div className="space-y-4 text-xs text-[#5A534A]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1B18] block font-medium">Head Office & Production Unit</strong>
                    <span>Printing Market, Near Railway Road, Multan, Punjab, Pakistan</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1B18] block font-medium">Phone / Call Numbers</strong>
                    <div className="space-x-2">
                      <a href="tel:+923108216304" className="text-[#8C6D3B] hover:underline font-mono">
                        0310 8216304
                      </a>
                      <span>/</span>
                      <a href="tel:+923181718476" className="text-[#8C6D3B] hover:underline font-mono">
                        0318 1718476
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1B18] block font-medium">Official Gmail Address</strong>
                    <a href="mailto:nasirkhanprinting@gmail.com" className="text-[#8C6D3B] hover:underline">
                      nasirkhanprinting@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#8C6D3B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1E1B18] block font-medium">Consultation Hours</strong>
                    <span>Monday to Saturday: 9:00 AM – 8:00 PM (PKT)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Message & Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-[#E8E2D8] p-6 sm:p-8 rounded-sm shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-[#1E1B18] mb-2">
              Send a Direct Message
            </h3>
            <p className="text-xs text-[#6B6357] mb-6">
              Complete the message details below to send your query via WhatsApp or record it for sales follow-up.
            </p>

            {status === 'success' && (
              <div className="mb-6 p-4 bg-[#F2F7F2] border border-[#A3D9A5] text-xs text-[#205D25] flex items-center gap-2 rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Thank you! Your message has been saved for our sales department.</span>
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 rounded-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleWhatsAppDirect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    City in Pakistan
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Multan, Lahore, Islamabad"
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                    Topic / Packaging Category
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                  >
                    <option value="Cake & Bakery Boxes">Cake & Bakery Boxes</option>
                    <option value="Mango & Fruit Packaging">Mango & Fruit Packaging</option>
                    <option value="Pizza & Fast Food Boxes">Pizza & Fast Food Boxes</option>
                    <option value="Soap & Cosmetic Boxes">Soap & Cosmetic Boxes</option>
                    <option value="Shopping Bags & Handbags">Shopping Bags & Handbags</option>
                    <option value="Gift Boxes & Hampers">Gift Boxes & Hampers</option>
                    <option value="Wedding Cards & Invitation Boxes">Wedding Cards & Invitation Boxes</option>
                    <option value="Corrugated Shipping Cartons">Corrugated Shipping Cartons</option>
                    <option value="Corporate Gift Packaging">Corporate Gift Packaging</option>
                    <option value="General Printing & Inquiries">General Printing & Inquiries</option>
                  </select>
                </div>
              </div>

              {/* Preferred WhatsApp Line Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  Send to WhatsApp Line:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 border rounded-xs cursor-pointer text-xs transition-colors ${
                      preferredLine === '0310'
                        ? 'border-[#1E1B18] bg-[#1E1B18] text-white font-semibold'
                        : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#4A433A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="waLine"
                      checked={preferredLine === '0310'}
                      onChange={() => setPreferredLine('0310')}
                      className="sr-only"
                    />
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>0310 8216304 (Primary)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 border rounded-xs cursor-pointer text-xs transition-colors ${
                      preferredLine === '0318'
                        ? 'border-[#1E1B18] bg-[#1E1B18] text-white font-semibold'
                        : 'border-[#DDD6C9] bg-[#FAF7F2] text-[#4A433A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="waLine"
                      checked={preferredLine === '0318'}
                      onChange={() => setPreferredLine('0318')}
                      className="sr-only"
                    />
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>0318 1718476 (Secondary)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4A433A] mb-1.5">
                  Your Message or Question *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details regarding your required quantity, dimensions, or questions..."
                  className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#DDD6C9] focus:outline-none focus:border-[#8C6D3B] text-[#1E1B18]"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 flex flex-wrap items-center justify-center gap-2 py-3.5 px-3 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white shrink-0" />
                  <span className="break-words">Send via WhatsApp ({preferredLine === '0310' ? '0310 8216304' : '0318 1718476'})</span>
                </button>

                <button
                  type="button"
                  disabled={status === 'submitting'}
                  onClick={handleSaveContactInquiry}
                  className="py-3.5 px-4 bg-[#1E1B18] hover:bg-[#2C2723] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {status === 'submitting' ? 'Saving...' : 'Save for Follow-up'}
                </button>
              </div>

              <p className="text-[11px] text-[#7A7266] text-center pt-1">
                Your message is sent only after confirming and pressing send inside WhatsApp.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
