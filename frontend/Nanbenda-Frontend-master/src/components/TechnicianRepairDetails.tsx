import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, Package, Check, X, Loader2, Phone, ArrowLeft, Gift } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, API_URL } from '../api/api';

declare const google: any;

interface TechnicianRepairDetailsProps {
  token: string;
}

export default function TechnicianRepairDetails({ token }: TechnicianRepairDetailsProps) {
  const { repairId } = useParams();
  const navigate = useNavigate();
  const [repair, setRepair] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.hasOwnProperty('google') && (window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }

    // Set up global callback
    (window as any).initGoogleMap = () => {
      setMapsLoaded(true);
    };

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMap&loading=async`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error("Failed to load Google Maps script.");
      };
      document.head.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(interval);
          setMapsLoaded(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      delete (window as any).initGoogleMap;
    };
  }, []);

  const fetchRepairDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/repairs/${repairId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRepair(data.data);
      } else {
        setError(data.message || 'Failed to fetch repair details');
      }
    } catch (e) {
      console.error(e);
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairDetails();
  }, [repairId, token]);

  // Google map drawing for details view
  useEffect(() => {
    if (!mapsLoaded || !repair || !mapRef.current || mapInstance.current) return;

    const lat = parseFloat(repair.user_lat || '11.6643');
    const lng = parseFloat(repair.user_lng || '78.1460');
    const center = { lat, lng };

    // Clean Map Styling matching darker theme
    const darkMapStyles = [
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8796a5" }]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{ "visibility": "off" }]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{ "color": "#0f172a" }] // slate-900
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#1e293b" }] // slate-800
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#1e293b" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#334155" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#020617" }] // slate-950
      }
    ];

    try {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom: 14,
        styles: darkMapStyles,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      });

      mapInstance.current = map;

      const marker = new google.maps.Marker({
        position: center,
        map,
        title: repair.customer_name || 'Customer Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#f59e0b', // Amber-500 matching the technician layout accent
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 9
        }
      });
      markerRef.current = marker;
    } catch (e) {
      console.warn("Details map error:", e);
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstance.current = null;
    };
  }, [repair, mapsLoaded]);

  const handleAccept = async () => {
    if (!repairId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/repairs/${repairId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Navigate to the fullscreen map tracking page
        navigate('/technician/map');
      } else {
        alert(data.message || 'Failed to accept job');
      }
    } catch (e) {
      console.error(e);
      alert('Error accepting job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading details...</p>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-sm font-black uppercase">{error || 'Job Not Found'}</h3>
        <button
          onClick={() => navigate('/technician/home')}
          className="px-6 py-3 bg-amber-500 text-slate-900 font-black rounded-2xl text-xs uppercase"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12 flex flex-col animate-fadeIn">
      {/* Top Banner with Accept Button */}
      <div className="bg-slate-900 border-b border-white/10 p-4 sticky top-0 z-50 flex items-center justify-between">
        <button
          onClick={() => navigate('/technician/home')}
          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 transition-colors active:scale-95 flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Ticket Details</h3>
        <button
          onClick={handleAccept}
          disabled={submitting}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <Check className="h-3.5 w-3.5" /> Accept Job
            </>
          )}
        </button>
      </div>

      <div className="p-4 space-y-6 max-w-md mx-auto w-full">
        {/* Basic Header */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/30">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">REP-{repair.id}</span>
              <h4 className="text-white font-black text-base mt-0.5">{repair.device_brand} {repair.device_model}</h4>
              <p className="text-amber-500 text-[10px] font-black uppercase tracking-wider mt-0.5">{repair.problem_type}</p>
            </div>
          </div>
        </div>

        {/* Map View */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Location Map</label>
          <div
            ref={mapRef}
            className="w-full h-56 rounded-3xl border border-white/10 overflow-hidden shadow-inner z-0"
          />
        </div>

        {/* Price & Earnings */}
        <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Earnings</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">₹{repair.price}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
            <p className="text-xs font-bold text-white mt-0.5">COD / Online</p>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="space-y-3">
          <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Address</p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">
                  {repair.address_line1}, {repair.city} {repair.pincode ? `– ${repair.pincode}` : ''}
                </p>
              </div>
            </div>
          </div>

          {repair.problem_description && (
            <div className="bg-white/5 p-4 rounded-2xl space-y-1 border border-white/5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Problem Description</p>
              <p className="text-xs font-medium text-slate-300 italic">
                "{repair.problem_description}"
              </p>
            </div>
          )}

          {repair.reward && (
            <div className="bg-emerald-500/10 p-4 rounded-2xl space-y-1 border border-emerald-500/20 relative overflow-hidden">
              <Gift className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-500/10" />
              <div className="flex items-center gap-2 mb-1">
                <Gift className="h-4 w-4 text-emerald-400 relative z-10" />
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest relative z-10">Customer Reward Applied</p>
              </div>
              <p className="text-xs font-bold text-emerald-100 relative z-10">
                {repair.reward}
              </p>
            </div>
          )}

          <div className="bg-white/5 p-4 rounded-2xl space-y-1 border border-white/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Details</p>
            <p className="text-xs font-bold text-slate-200">
              {repair.customer_name || 'Anonymous Customer'}
            </p>
            {repair.mobile_number && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span className="text-xs text-slate-400 font-bold">{repair.mobile_number}</span>
                <a
                  href={`tel:${repair.mobile_number}`}
                  className="p-2 bg-emerald-500 text-slate-950 rounded-lg active:scale-90 transition-all flex items-center justify-center"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
