import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, MapPin, Shield, Smartphone, 
  Phone, AlertCircle, Loader2, Calendar, ClipboardList, Navigation, Radio, X, Gift
} from 'lucide-react';
import TechnicianTracker from './TechnicianTracker';
import { API_URL, BASE_URL } from '../api/api';
import ReviewModal from './ReviewModal';

interface ClientRepairDetailsProps {
  token: string;
}

export default function ClientRepairDetails({ token }: ClientRepairDetailsProps) {
  const { repairId } = useParams<{ repairId: string }>();
  const navigate = useNavigate();
  const [repair, setRepair] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTracker, setShowTracker] = useState(false);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [distanceText, setDistanceText] = useState<string | null>(null);

  // Location toggle state
  const [useLiveLocation, setUseLiveLocation] = useState(false);
  const [hasInitializedToggle, setHasInitializedToggle] = useState(false);
  const [liveCustomerLat, setLiveCustomerLat] = useState<number | null>(null);
  const [liveCustomerLng, setLiveCustomerLng] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const getETA = (distStr: string | null) => {
    if (!distStr) return "Estimating ETA...";
    const cleanStr = distStr.toLowerCase().replace(/,/g, '').trim();
    let distanceKm = 0;
    if (cleanStr.includes('km')) {
      distanceKm = parseFloat(cleanStr);
    } else if (cleanStr.includes('m')) {
      distanceKm = parseFloat(cleanStr) / 1000;
    } else {
      distanceKm = parseFloat(cleanStr);
    }
    if (isNaN(distanceKm) || distanceKm <= 0) return "Estimating ETA...";
    if (distanceKm < 0.05) return "Reached Location!";
    if (distanceKm < 0.2) return "Arrived!";
    const mins = Math.ceil(distanceKm * 2.4);
    return `${mins} mins`;
  };

  useEffect(() => {
    fetchRepairDetails();
    const interval = setInterval(fetchRepairDetails, 3000);
    return () => clearInterval(interval);
  }, [repairId]);

  // Clean up geo-watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Start / stop watchPosition based on toggle
  useEffect(() => {
    if (useLiveLocation) {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser.');
        setUseLiveLocation(false);
        return;
      }
      setLocationError(null);
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLiveCustomerLat(lat);
          setLiveCustomerLng(lng);
          // Push to backend so technician map also updates
          if (repairId) {
            fetch(`${API_URL}/repairs/${repairId}/customer-location`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ lat, lng })
            }).catch(() => {});
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setLocationError('Could not get your location. Please enable GPS.');
          setUseLiveLocation(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setLiveCustomerLat(null);
      setLiveCustomerLng(null);
    }
  }, [useLiveLocation, repairId, token]);

  const handleToggleLiveLocation = async () => {
    const nextState = !useLiveLocation;
    try {
      const response = await fetch(`${API_URL}/repairs/${repairId}/live-location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nextState })
      });
      const data = await response.json();
      if (data.success) {
        setUseLiveLocation(nextState);
      }
    } catch (error) {
      console.error('Error toggling live location:', error);
    }
  };

  const fetchRepairDetails = async () => {
    try {
      // Check mock storage first
      const storedStr = localStorage.getItem('mock_repairs');
      if (storedStr) {
        const storedRepairs = JSON.parse(storedStr);
        const found = storedRepairs.find((r: any) => String(r.id) === String(repairId));
        if (found) {
          setRepair(found);
          if (!hasInitializedToggle) {
            setUseLiveLocation(!!found.live_location_enabled);
            setHasInitializedToggle(true);
          }
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`${API_URL}/repairs/${repairId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setRepair(data.data);
        if (!hasInitializedToggle) {
          setUseLiveLocation(!!data.data.live_location_enabled);
          setHasInitializedToggle(true);
        }
      }
    } catch (error) {
      console.error('Error fetching repair details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Status mapping
  const statusLabels: Record<string, string> = {
    'pending': 'Pending',
    'technician_assigned': 'Assigned',
    'on_the_way': 'On the Way',
    'reached': 'At Location',
    'repaired': 'Repaired',
    'payment_done': 'Payment Done',
    'completed': 'Completed'
  };

  const statusIndexes: Record<string, number> = {
    'pending': 0,
    'technician_assigned': 1,
    'on_the_way': 2,
    'reached': 3,
    'repaired': 4,
    'payment_done': 5,
    'completed': 6
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-[#f9f9fc]">
        <Loader2 className="h-10 w-10 text-[#004c4c] animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing details...</p>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen bg-[#f9f9fc] p-5">
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200 w-full">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-sm font-black text-slate-800">Repair not found</h3>
          <button 
            onClick={() => navigate('/customer/repairs')}
            className="mt-4 px-6 py-2 bg-[#004c4c] text-white rounded-xl font-bold text-xs"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isFullscreenMap && repair) {
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-900 flex flex-col animate-fadeIn">
        <div className="relative flex-1 w-full h-full">
          <TechnicianTracker
            repairId={repair.id}
            customerLat={parseFloat(repair.user_lat || '11.6643')}
            customerLng={parseFloat(repair.user_lng || '78.1460')}
            token={token}
            heightClass="h-full"
            fullscreen={true}
            useLiveCustomerLocation={useLiveLocation}
            liveCustomerLat={liveCustomerLat}
            liveCustomerLng={liveCustomerLng}
            onDistanceUpdate={setDistanceText}
          />

          {/* Floating Header */}
          <div className="absolute top-4 left-4 right-4 z-[999999] flex items-center justify-between pointer-events-none">
            <button
              onClick={() => setIsFullscreenMap(false)}
              className="p-3 bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl font-black text-xs uppercase border border-slate-200 shadow-lg flex items-center gap-1.5 pointer-events-auto active:scale-95 transition-all"
            >
              <X className="h-4 w-4" /> Exit Map
            </button>
            <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg text-white pointer-events-auto flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-teal-400 animate-pulse">REP-{repair.id}</span>
              <span className="text-xs font-bold">{repair.device_brand} {repair.device_model}</span>
            </div>
          </div>

          {/* Floating Location Toggle */}
          <div className="absolute top-20 left-4 right-4 z-[999999] bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-lg pointer-events-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${useLiveLocation ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                {useLiveLocation ? <Radio className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 leading-tight">
                  {useLiveLocation ? 'Live GPS Location' : 'Saved Address'}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                  {useLiveLocation ? 'GPS Broadcast Active' : 'Using Address'}
                </p>
              </div>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={handleToggleLiveLocation}
              className={`relative w-11 h-5.5 rounded-full transition-all duration-300 ${useLiveLocation ? 'bg-blue-500' : 'bg-slate-200'}`}
              aria-label="Toggle live location"
            >
              <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-300 ${useLiveLocation ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Floating Bottom Panel containing Zomato/Swiggy style details */}
          <div className="absolute bottom-4 left-4 right-4 z-[999999] bg-white/95 backdrop-blur-md p-5 rounded-[2.5rem] border border-slate-150 shadow-2xl space-y-4">
            
            {/* Top ETA & Live Status */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-md shadow-teal-500/20 animate-pulse">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="6" cy="18" r="2" fill="white" />
                    <circle cx="18" cy="18" r="2" fill="white" />
                    <path d="M6 18h6l2-7H7" />
                    <path d="M14 11h4l2 7" />
                    <path d="M17 7l-2-4h-2" />
                    <rect x="5" y="8" width="6" height="6" rx="1" fill="white" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {getETA(distanceText)}
                  </h3>
                  <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping" />
                    {statusLabels[repair.status] || repair.status.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400">Distance</p>
                <p className="text-sm font-black text-slate-900">{distanceText || "..."}</p>
              </div>
            </div>

            {/* Technician Info Panel */}
            {repair.technician_name && (
              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3">
                  {repair.technician_photo ? (
                    <img
                      src={repair.technician_photo.startsWith('http') ? repair.technician_photo : `${BASE_URL}${repair.technician_photo}`}
                      alt={repair.technician_name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#004c4c] text-white flex items-center justify-center font-black text-xs">
                      {repair.technician_name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-black text-slate-800 leading-tight">{repair.technician_name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Your Doorstep Repair Expert</p>
                  </div>
                </div>
                <a
                  href={`tel:${repair.technician_mobile ? repair.technician_mobile.replace(/[^0-9+]/g, '') : ''}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-3 bg-teal-600 text-white rounded-2xl active:scale-90 transition-all shadow-md shadow-teal-600/10 flex items-center justify-center"
                >
                  <Phone className="h-4.5 w-4.5" />
                </a>
              </div>
            )}

            {/* Progress Bar Timeline */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between gap-1.5">
                {['pending', 'on_the_way', 'reached', 'repaired', 'completed'].map((stKey, idx) => {
                  const curIdx = ['pending', 'technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done', 'completed'].indexOf(repair.status);
                  const stepIdx = ['pending', 'technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done', 'completed'].indexOf(stKey);
                  const isDone = curIdx >= stepIdx;
                  
                  return (
                    <div key={stKey} className="flex-1 flex flex-col items-center">
                      <div className={`h-2 w-full rounded-full transition-all ${isDone ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      <span className={`text-[8px] font-black uppercase mt-1.5 ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                        {stKey === 'on_the_way' ? 'Way' : stKey === 'reached' ? 'Reached' : stKey === 'repaired' ? 'Fixed' : stKey}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  }

  const canTrack = repair.status !== 'pending' && repair.status !== 'completed';

  return (
    <div className="flex-grow p-5 bg-[#f9f9fc] animate-fadeIn select-none pb-28 min-h-screen">
      <header className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/customer/repairs')}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[#004c4c]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-lg font-black text-slate-900 leading-tight">Repair Details</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">REP-#{repair.id}</p>
        </div>
      </header>

      <div className="space-y-6">
        {/* Review feedback CTA banner */}
        {['payment_done', 'completed'].includes(repair.status) && !repair.is_reviewed && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white flex flex-col gap-3 shadow-md animate-fadeIn">
            <div>
              <h4 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <CheckCircle className="h-4.5 w-4.5 text-white" /> Rate Your Repair Service!
              </h4>
              <p className="text-[11px] font-bold text-white/90 leading-normal mt-1">
                Your repair was completed successfully. Please take 10 seconds to share your review.
              </p>
            </div>
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full py-3 bg-white text-orange-600 rounded-2xl text-xs font-black active:scale-95 transition-all shadow-md"
            >
              Write a Review
            </button>
          </div>
        )}

        {/* Main Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-[#004c4c]">{repair.device_brand} {repair.device_model}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-teal-50 text-[#004c4c] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-teal-100">
                  {repair.problem_type}
                </span>
                <span className="bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg text-[10px] font-black border border-slate-200">
                  ₹{Number(repair.price || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#004c4c] border border-teal-100">
              <Smartphone className="h-8 w-8" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Appointment</p>
                <p className="text-sm font-bold text-slate-800">
                  {repair.preferred_date ? new Date(repair.preferred_date).toLocaleDateString() : 'Immediate Service'}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Time: {repair.preferred_time || 'Standard'}</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service Location</p>
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {repair.address_line1}, {repair.city} - {repair.pincode}
                </p>
              </div>
            </div>

            {repair.problem_description && (
              <div className="flex gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-50">
                <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1">Your Note</p>
                  <p className="text-xs font-medium text-slate-700 italic">"{repair.problem_description}"</p>
                </div>
              </div>
            )}

            {repair.reward && (
              <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden animate-fadeIn">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Gift className="w-24 h-24 text-emerald-500" />
                </div>
                <Gift className="h-5 w-5 text-emerald-500 mt-0.5 relative z-10" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Claimed Reward Applied</p>
                  <p className="text-xs font-bold text-emerald-800">{repair.reward}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Diagnostic Images */}
        {repair.image_url && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Uploaded Images</h4>
            <div className="flex gap-3 overflow-x-auto py-2">
              {repair.image_url.split(',').map((imgUrl: string, idx: number) => {
                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`;
                return (
                  <img
                    key={idx}
                    src={fullUrl}
                    alt="Diagnostic"
                    onClick={() => setSelectedImage(fullUrl)}
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Track Technician */}
        {canTrack && (
          <div className="animate-bounceIn">
            {!showTracker ? (
              <button 
                onClick={() => setShowTracker(true)}
                className="w-full py-4 bg-[#004c4c] text-white rounded-3xl font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-teal-900/20 active:scale-95 transition-all"
              >
                <Navigation className="h-5 w-5" />
                Track Technician Live
              </button>
            ) : (
              <div className="space-y-3">
                {/* Location Toggle */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${useLiveLocation ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                        {useLiveLocation ? <Radio className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          {useLiveLocation ? 'Live GPS Location' : 'Saved Address'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          {useLiveLocation ? 'Your GPS as technician destination' : 'Using your saved address'}
                        </p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      onClick={handleToggleLiveLocation}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${useLiveLocation ? 'bg-blue-500' : 'bg-slate-200'}`}
                      aria-label="Toggle live location"
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${useLiveLocation ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                  {locationError && (
                    <div className="px-4 pb-3">
                      <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {locationError}
                      </p>
                    </div>
                  )}
                  {useLiveLocation && liveCustomerLat && (
                    <div className="px-4 pb-3">
                      <p className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
                        <Radio className="h-3 w-3 animate-pulse" /> Broadcasting your live location
                      </p>
                    </div>
                  )}
                </div>

                {/* Map */}
                <TechnicianTracker 
                  repairId={repair.id} 
                  customerLat={parseFloat(repair.user_lat || '11.6643')} 
                  customerLng={parseFloat(repair.user_lng || '78.1460')} 
                  token={token}
                  useLiveCustomerLocation={useLiveLocation}
                  liveCustomerLat={liveCustomerLat}
                  liveCustomerLng={liveCustomerLng}
                  onMapClick={() => setIsFullscreenMap(true)}
                  onDistanceUpdate={setDistanceText}
                />
              </div>
            )}
          </div>
        )}

        {/* Journey Timeline */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Service Journey</h4>
          
          <div className="space-y-8 relative">
            <div className="absolute top-2 bottom-2 left-[11px] w-[2px] bg-slate-100" />

            {[
              { key: 'pending', label: 'Repair Logged', sub: 'Repair request logged' },
              { key: 'technician_assigned', label: 'Technician Assigned', sub: 'Assigned to nearest expert' },
              { key: 'on_the_way', label: 'On the Way', sub: 'Technician is travelling' },
              { key: 'reached', label: 'At Destination', sub: 'Repair started at doorstep' },
              { key: 'repaired', label: 'Repaired Successful', sub: 'Quality testing complete' },
              { key: 'payment_done', label: 'Payment Done', sub: 'Payment received' },
              { key: 'completed', label: 'Service Completed', sub: 'Service closed successfully' }
            ].map((item, idx) => {
              const currentIdx = statusIndexes[repair.status] || 0;
              const isDone = currentIdx >= idx;
              const isCurrent = currentIdx === idx;
              
              return (
                <div key={item.key} className="flex gap-6 relative pl-7">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-sm transition-all ${
                    isDone ? 'bg-[#004c4c] scale-110' : 'bg-slate-200'
                  }`}>
                    {isDone && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <h5 className={`text-xs font-black transition-colors ${
                      isDone ? 'text-slate-900' : 'text-slate-400'
                    } ${isCurrent ? 'text-[#004c4c] flex items-center gap-2' : ''}`}>
                      {item.label}
                      {isCurrent && <span className="w-2 h-2 rounded-full bg-[#004c4c] animate-ping" />}
                    </h5>
                    <p className={`text-[10px] font-bold transition-colors ${
                      isDone ? 'text-slate-500' : 'text-slate-350'
                    }`}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technician Info (Optional) */}
        {repair.technician_name && (
          <div className="bg-slate-900 p-6 rounded-3xl shadow-lg">
            <h4 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-4">Assigned Expert</h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10">
                <Shield className="h-6 w-6" />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-black text-white">{repair.technician_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-3 w-3 text-teal-400" />
                  <p className="text-xs font-medium text-teal-400">{repair.technician_mobile}</p>
                </div>
              </div>
              <a 
                href={`tel:${repair.technician_mobile}`}
                className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-400 active:scale-95 transition-all shadow-lg shadow-teal-500/20"
              >
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        )}

        {/* Support Link */}
        <div className="bg-[#004c4c]/5 border border-[#004c4c]/10 p-6 rounded-3xl text-center">
          <p className="text-xs font-bold text-[#004c4c] mb-3">Need help with this repair?</p>
          <button 
            onClick={() => navigate('/customer/support')}
            className="text-xs font-black text-white bg-[#004c4c] px-6 py-2.5 rounded-xl uppercase tracking-widest hover:bg-[#004c4c]/90 transition-all active:scale-95"
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-full max-h-[80vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white active:scale-90 transition-transform"
            >
              <X className="h-6 w-6" />
            </button>
            <img src={selectedImage} alt="Fullscreen View" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl animate-scaleIn" />
          </div>
        </div>
      )}

      {showReviewModal && (
        <ReviewModal
          token={token}
          repairId={repair.id}
          technicianId={repair.technician_id}
          deviceName={`${repair.device_brand} ${repair.device_model}`}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            fetchRepairDetails();
          }}
        />
      )}
    </div>
  );
}
