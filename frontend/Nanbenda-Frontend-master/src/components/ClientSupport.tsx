import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, BASE_URL } from '../api/api';
import { 
  Search, Truck, Terminal, CreditCard, ShieldCheck, 
  Phone, ChevronRight, HelpCircle, Loader2, X, Mail, MessageSquare, MapPin
} from 'lucide-react';

export default function ClientSupport() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHelps = async () => {
      if (searchQuery.trim().length > 2) {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL}/helps?q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();
          setResults(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching helps:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    };

    const debounceTimer = setTimeout(fetchHelps, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleCategoryClick = async (category: string) => {
    setSearchQuery(category);
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/helps?category=${encodeURIComponent(category)}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching helps by category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28">
      {/* Title Header */}
      <section className="mb-6">
        <h2 className="text-xl font-black text-slate-900 mb-4 leading-tight">How can we help?</h2>
      </section>

      {/* Grid of Support Categories */}
      <section className="mb-6">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Browse Categories</h3>
        <div className="grid grid-cols-2 gap-3.5">
          {[
            { label: 'Booking & Repairs', icon: Truck, desc: 'Doorstep booking help' },
            { label: 'Orders & Shopping', icon: Terminal, desc: 'Mart & Delivery info' },
            { label: 'Payments & Pricing', icon: CreditCard, desc: 'Billing & No-Fix-No-Fee' },
            { label: 'Warranty & Support', icon: ShieldCheck, desc: '90-Day cover details' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.label}
                onClick={() => handleCategoryClick(item.label)}
                className={`bg-white border ${searchQuery === item.label ? 'border-[#004c4c] bg-teal-50/30' : 'border-slate-200'} hover:border-[#004c4c] rounded-xl p-5 flex flex-col items-center text-center cursor-pointer transition-colors group active:scale-98 shadow-xs`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6 text-[#004c4c]" />
                </div>
                <span className="text-xs font-black text-slate-800">{item.label}</span>
                <span className="text-[10px] text-slate-400 mt-1 leading-none font-medium">{item.desc}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for help, repairs, or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-12 bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 text-sm transition-all shadow-xs"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* Results Section */}
      {searchQuery.trim().length > 0 && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {loading ? 'Searching...' : `Results for "${searchQuery}"`}
            </h3>
            {!loading && results.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400">{results.length} found</span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-xs font-medium">Scanning knowledge base...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs transition-all"
                >
                  <div 
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">
                        <HelpCircle className="h-4 w-4 text-[#004c4c]" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{item.question}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`} />
                  </div>
                  
                  {expandedId === item.id && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {item.solution}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#004c4c] bg-[#E9F6F6] px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : searchQuery.trim().length > 2 ? (
            <div className="bg-slate-50 rounded-xl p-8 text-center">
              <p className="text-sm font-bold text-slate-500">No results found</p>
              <p className="text-xs text-slate-400 mt-1">Try different keywords or browse categories below.</p>
            </div>
          ) : null}
        </section>
      )}

      {/* Call Support bar */}
      <section className="mb-6">
        <a 
          href="tel:+15551234" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/customer/alert?message=' + encodeURIComponent("Simulating support call to +1 (555) 762-2981. Representatives are available Mon-Fri, 9am - 6pm.") + '&type=info');
          }}
          className="border border-slate-200 bg-white hover:bg-slate-50 rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-xs"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-[#004c4c]">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-none">Call Support</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-none font-medium">Mon-Fri, 9am - 6pm</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </a>
      </section>

      {/* Additional Support Channels */}
      <section className="mb-6 space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">More Support Channels</h3>
        
        {/* Email Support */}
        <div 
          onClick={() => navigate('/customer/alert?message=' + encodeURIComponent("Send your query to support@displayfixgo.com. Our support team typically replies within 2 hours.") + '&type=success')}
          className="border border-slate-200 bg-white hover:bg-slate-50 rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-xs"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-none">Email Support</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-none font-medium">support@displayfixgo.com</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>

        {/* Live Chat Support */}
        <div 
          onClick={() => navigate('/customer/alert?message=' + encodeURIComponent("Live chat feature starting soon! Representatives will connect shortly.") + '&type=info')}
          className="border border-slate-200 bg-white hover:bg-slate-50 rounded-xl p-4 flex items-center justify-between cursor-pointer active:scale-98 transition-all shadow-xs"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-none">WhatsApp / Chat Support</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-none font-medium">Instant reply (9am - 9pm)</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </section>

      {/* Trust & Guarantees */}
      <section className="mb-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide mb-4">Our Service Assurances</h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">90-Day Warranty Coverage</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-bold">
                All repaired electronics are covered by a hassle-free 90-day warranty on the replaced spare parts.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-3.5 border-t border-slate-100">
            <CreditCard className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">No-Fix, No-Fee Guarantee</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-bold">
                If our technician cannot successfully diagnose or repair your device, you pay zero service charges.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-3.5 border-t border-slate-100">
            <Truck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-tight">Doorstep Convenience</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-bold">
                No need to carry bulky electronics. Our certified technician visits your home/office to repair on site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Office Location */}
      <section className="mb-6">
        <div className="border border-slate-200 bg-white rounded-xl p-4 flex gap-4 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-none">Display Fix Go Corporate Office</h4>
            <p className="text-[10px] text-slate-600 mt-2 font-bold leading-normal">
              12, Main Road, Near Old Bus Stand,<br />
              Salem, Tamil Nadu, Pin Code: 636001
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

