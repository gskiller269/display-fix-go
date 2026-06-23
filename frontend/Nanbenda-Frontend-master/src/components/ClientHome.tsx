import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, MessageSquare, Calendar, ChevronRight, HelpCircle, Star, Phone, CheckCircle, Watch, Laptop as LaptopIcon, ShieldCheck, Zap, Home, Clock, Award, ThumbsUp, BadgeCheck, HeartHandshake, MapPin } from 'lucide-react';
import { fetchBanners } from '../api/deviceApi';
import { API_URL, BASE_URL } from '../api/api';

export default function ClientHome() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchBanners().then(data => {
      setBanners(data);
    });
    // Mock reviews
    setReviews([
      { username: 'Arun K.', profile_image_url: null, comment: 'Technician arrived within 45 minutes and fixed my iPhone screen perfectly. Amazing service!', rating: 5, device_brand: 'Apple', device_model: 'iPhone 14' },
      { username: 'Priya S.', profile_image_url: null, comment: 'No Fix No Fee policy gave me confidence. My laptop motherboard was repaired at my home itself.', rating: 5, device_brand: 'Dell', device_model: 'XPS 15' },
      { username: 'Karthik R.', profile_image_url: null, comment: 'Very professional. 90-day warranty on the repair. Will definitely use Display Fix Go again!', rating: 4, device_brand: 'Samsung', device_model: 'S24' }
    ]);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % banners.length;
        if (containerRef.current) {
          const container = containerRef.current;
          const element = container.children[nextIndex] as HTMLElement;
          if (element) {
            container.scrollTo({
              left: element.offsetLeft - container.offsetLeft,
              behavior: 'smooth'
            });
          }
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [banners]);

  const handleScroll = () => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollLeft = container.scrollLeft;
      const width = container.clientWidth;
      if (width > 0) {
        const newIndex = Math.round(scrollLeft / width);
        setActiveIndex((prev) => {
          if (newIndex >= 0 && newIndex < banners.length && newIndex !== prev) {
            return newIndex;
          }
          return prev;
        });
      }
    }
  };

  const handleStartBooking = (category?: string) => {
    navigate('/customer/book/wizard', { state: { category } });
  };

  return (
    <div className="flex-grow pb-16 animate-fadeIn bg-white select-none">
      {/* Local Announcement Banners from DB */}
      <section className="px-5 py-5">
        {banners.length > 0 ? (
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x hide-scrollbar"
          >
            {banners.map((b) => (
              <div key={b.id} style={{ boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)" }} className="snap-center shrink-0 w-full rounded-2xl flex relative overflow-hidden h-52 shadow-sm border border-slate-200">
                {b.image_url && (
                  <img
                    alt={b.title || 'Offer Banner'}
                    className="absolute inset-0 h-full w-full object-cover z-0"
                    referrerPolicy="no-referrer"
                    src={b.image_url.startsWith('http') ? b.image_url : `${BASE_URL}${b.image_url}`}
                  />
                )}
                <div className="relative z-20 p-6 flex flex-col justify-between w-full h-full text-white">
                  {b.link_url && b.link_url !== 'none' && b.link_url !== 'No Redirect' && b.link_url !== '' && (
                    <button
                      onClick={() => navigate(b.link_url)}
                      className="bg-[#004c4c] text-xs font-black px-4.5 py-2.5 rounded-lg active:scale-95 transition-all self-start shadow-md hover:bg-teal-700"
                    >
                      Book Offer Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback Banner */
          <div className="snap-center shrink-0 w-full rounded-2xl flex relative overflow-hidden h-52 shadow-sm border border-slate-200">
            <img
              alt="Technician Expert"
              className="absolute inset-0 h-full w-full object-cover z-0"
              referrerPolicy="no-referrer"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeLe-rZrgRfKMJBH87xlUZ_NGKUenRXOzbLbEybiM9RrTLE3dQbnrMzBRe6CB32AVTTmtOURgCqEIXgWkmuqZP8V1Ip8qphrLv5UR1ynW-LrHxF6wAabn_6Bk_TPEsDk2YXlg1aOeAJHJmNgO5mh6ZQ_vOr6nA5_w84ayQaGWRH_NE47RATegqX5WOJOc8T3-EsH6jwhfyFTXmOT4ZemrGYXIqWBI-D8pjNuE6njjTdamnlA5uoEh77r71NYW9lZQeuyRzYubZ8dEE"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent z-10"></div>
            <div className="relative z-20 p-6 flex flex-col justify-between w-full h-full text-white">
              <div>
                <p className="text-emerald-400 text-sm font-black uppercase tracking-wider mb-1.5">
                  Your Repair Partner in Salem!
                </p>
                <h2 className="text-base font-extrabold leading-tight mb-2 max-w-[75%]">
                  Get your device fixed at your doorstep.
                </h2>
              </div>
              <button
                onClick={() => handleStartBooking()}
                className="bg-[#004c4c] text-xs font-black px-4.5 py-2.5 rounded-lg active:scale-95 transition-all self-start shadow-md hover:bg-teal-700"
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Booking Quick Flow Indicators */}
      <section className="px-5 py-3 grid grid-cols-4 gap-1.5 text-center bg-slate-50/50 mx-5 rounded-2xl border border-slate-100 p-4">
        <div
          onClick={() => handleStartBooking()}
          className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center"
        >
          <div className="bg-white rounded-xl p-3 mb-2 flex justify-center border border-slate-200 hover:border-[#004c4c] transition-colors w-12 h-12 items-center shadow-xs">
            <Smartphone className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-xs font-black text-slate-700 leading-tight">Select Device</p>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="absolute -left-1.5 top-4.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            onClick={() => handleStartBooking()}
            className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center"
          >
            <div className="bg-white rounded-xl p-3 mb-2 flex justify-center border border-slate-200 hover:border-[#004c4c] transition-colors w-12 h-12 items-center shadow-xs">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-xs font-black text-slate-700 leading-tight">Describe Problem</p>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="absolute -left-1.5 top-4.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            onClick={() => handleStartBooking()}
            className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center"
          >
            <div className="bg-white rounded-xl p-3 mb-2 flex justify-center border border-slate-200 hover:border-[#004c4c] transition-colors w-12 h-12 items-center shadow-xs">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <p className="text-xs font-black text-slate-700 leading-tight">Give Details</p>
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="absolute -left-1.5 top-4.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div
            onClick={() => handleStartBooking()}
            className="cursor-pointer hover:scale-105 transition-transform flex flex-col items-center"
          >
            <div className="bg-white rounded-xl p-3 mb-2 flex justify-center border border-slate-200 hover:border-[#004c4c] transition-colors w-12 h-12 items-center shadow-xs">
              <CheckCircle className="h-6 w-6 text-teal-600" />
            </div>
            <p className="text-xs font-black text-slate-700 leading-tight">Booked</p>
          </div>
        </div>
      </section>

      {/* Repair Categories */}
      <section className="px-5 py-5">
        <div className="grid grid-cols-3 gap-3.5">
          {/* Smartphone Card */}
          <div className="bg-gradient-to-b from-[#EEF9F4] to-white rounded-2xl p-4 flex flex-col items-center justify-between text-center border border-emerald-100 shadow-xs hover:shadow-sm hover:border-emerald-300 transition-all duration-300">
            <div className="w-14 h-14 mb-3 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
              <Smartphone className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-3 tracking-wide">Smartphone Repair</h3>
            <button
              onClick={() => handleStartBooking('Smartphone')}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/10 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>

          {/* Laptop Card */}
          <div className="bg-gradient-to-b from-[#EBF5FF] to-white rounded-2xl p-4 flex flex-col items-center justify-between text-center border border-blue-100 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all duration-300">
            <div className="w-14 h-14 mb-3 text-blue-600 rounded-2xl flex items-center justify-center shadow-xs">
              <LaptopIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-3 tracking-wide">Laptop Repair</h3>
            <button
              onClick={() => handleStartBooking('Laptop')}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/10 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>

          {/* Watch Card */}
          <div className="bg-gradient-to-b from-[#FFF8E7] to-white rounded-2xl p-4 flex flex-col items-center justify-between text-center border border-amber-100 shadow-xs hover:shadow-sm hover:border-amber-300 transition-all duration-300">
            <div className="w-14 h-14 mb-3 text-amber-600 rounded-2xl flex items-center justify-center shadow-xs">
              <Watch className="w-7 h-7" />
            </div>
            <h3 className="text-xs font-black text-slate-800 mb-3 tracking-wide">Watch Repair</h3>
            <button
              onClick={() => handleStartBooking('Smartwatch')}
              className="w-full py-2.5 bg-amber-500 text-slate-900 rounded-xl text-xs font-black shadow-md shadow-amber-500/15 hover:bg-amber-600 active:scale-95 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-5 py-5">
        <h2 className="text-base font-extrabold text-[#004c4c] uppercase tracking-wider mb-5">
          Why Choose Display Fix Go?
        </h2>
        <div className="grid grid-cols-3 gap-2.5 text-center bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 mb-2 bg-[#EEF9F4] rounded-full flex items-center justify-center text-emerald-600 shadow-xs border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 leading-tight">Certified Technicians</p>
          </div>

          <div className="flex flex-col items-center border-l border-r border-slate-200/60 px-2">
            <div className="w-14 h-14 mb-2 bg-[#EBF5FF] rounded-full flex items-center justify-center text-blue-600 shadow-xs border border-blue-100">
              <Zap className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 leading-tight">Fast Service</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-14 h-14 mb-2 bg-[#FFF8E7] rounded-full flex items-center justify-center text-amber-600 shadow-xs border border-amber-100">
              <Home className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 leading-tight">Doorstep Convenience</p>
          </div>
        </div>
      </section>

      {/* How Doorstep Repair Works */}
      <section className="px-5 py-5">
        <h2 className="text-base font-extrabold text-[#004c4c] uppercase tracking-wider mb-5">
          How Doorstep Repair Works
        </h2>
        <div className="space-y-4">
          {[
            { step: '01', icon: Smartphone, title: 'Select Your Device', desc: 'Choose your device type, brand, and model from our catalog.', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { step: '02', icon: MessageSquare, title: 'Describe the Issue', desc: 'Tell us what\'s wrong — cracked screen, battery drain, or any other issue.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { step: '03', icon: MapPin, title: 'Schedule & Location', desc: 'Pick a date, time, and your doorstep address. We\'ll come to you.', color: 'bg-orange-50 text-orange-600 border-orange-100' },
            { step: '04', icon: CheckCircle, title: 'Expert Repair Done', desc: 'Our certified technician arrives, repairs on spot, and you pay only if fixed.', color: 'bg-teal-50 text-[#004c4c] border-teal-100' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="flex items-start gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Step {item.step}</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="px-5 py-5">
        <h2 className="text-base font-extrabold text-[#004c4c] uppercase tracking-wider mb-5">
          What Our Customers Say
        </h2>
        <div className="space-y-3.5">
          {reviews.map((review, idx) => (
            <div key={review.id || idx} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {review.profile_image_url ? (
                    <img
                      src={review.profile_image_url.startsWith('http') ? review.profile_image_url : `${BASE_URL}${review.profile_image_url}`}
                      alt={review.username}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004c4c] to-teal-600 flex items-center justify-center text-white text-xs font-black">
                      {(review.username || 'CU').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-[15px] font-black text-slate-900">{review.username || 'Customer'}</p>
                    <p className="text-[12px] text-slate-400 font-bold">
                      {review.device_brand ? `${review.device_brand} ${review.device_model || ''}` : 'Salem'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: review.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-[15px] text-slate-600 font-medium leading-relaxed italic">{review.comment || review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* No Fix No Fee Guarantee */}
      <section className="px-5 py-5">
        <div className="bg-gradient-to-br from-[#004c4c] to-teal-700 rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">No Fix, No Fee</h3>
                <p className="text-[10px] font-bold text-teal-200 uppercase tracking-wider">Our Promise to You</p>
              </div>
            </div>
            <p className="text-xs text-teal-100 font-medium leading-relaxed mb-4">
              If we can't repair your device, you don't pay a single rupee. Plus, every repair comes with a 90-day warranty for complete peace of mind.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStartBooking()}
                className="flex-1 py-3 bg-white text-[#004c4c] rounded-xl text-xs font-black active:scale-95 transition-all shadow-lg"
              >
                Book Free Diagnosis
              </button>
              <a
                href="tel:+919876543210"
                className="py-3 px-5 bg-white/15 border border-white/20 rounded-xl text-xs font-black active:scale-95 transition-all flex items-center gap-2"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-5 py-5 mb-6">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <div className="w-10 h-10 mx-auto mb-2 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-lg font-black text-slate-900">2K+</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repairs Done</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <div className="w-10 h-10 mx-auto mb-2 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-lg font-black text-slate-900">4.9</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Rating</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-lg font-black text-slate-900">45m</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Arrival</p>
          </div>
        </div>
      </section>
    </div>
  );
}
