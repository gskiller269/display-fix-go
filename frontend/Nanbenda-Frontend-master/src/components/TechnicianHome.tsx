import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, MapPin, Navigation, Smartphone, Loader2,
  Phone, Clock, AlertCircle, Wrench, Package, Check, X,
  ChevronRight, Star, Zap, User, ArrowLeft, Gift
} from 'lucide-react';
import TechnicianTracker from './TechnicianTracker';
import { GOOGLE_MAPS_API_KEY, API_URL, BASE_URL, resolveAsset } from '../api/api';
import Stack from './Stack';

declare const google: any;

interface TechnicianHomeProps {
  token: string;
  fullscreenMap?: boolean;
}

const API = API_URL;

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TechnicianHome({ token, fullscreenMap = false }: TechnicianHomeProps) {
  const navigate = useNavigate();
  const [activeJob, setActiveJob]       = useState<any | null>(null);
  const [pendingOffers, setPendingOffers] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState<'accept' | 'reject' | null>(null);
  const [showTracker, setShowTracker]   = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState<string | null>(null);
  const activeJobIdRef                  = useRef<number | null>(null);

  const [techLocation, setTechLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [extendedRepairId, setExtendedRepairId] = useState<number | null>(null);
  const [extendedRepair, setExtendedRepair] = useState<any | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const extendedMapRef = useRef<HTMLDivElement>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [distanceText, setDistanceText] = useState<string | null>(null);

  // Load Google Maps script
  useEffect(() => {
    if (window.hasOwnProperty('google') && (window as any).google?.maps) {
      setMapsLoaded(true);
      return;
    }

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

  // Fetch extended details when selected
  useEffect(() => {
    if (!extendedRepairId) {
      setExtendedRepair(null);
      return;
    }
    const fetchExtendedDetails = async () => {
      try {
        const res = await fetch(`${API}/repairs/${extendedRepairId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setExtendedRepair(data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchExtendedDetails();
  }, [extendedRepairId, token]);

  // Google map drawing for extended card view
  useEffect(() => {
    let map: any = null;
    let techMarker: any = null;
    let custMarker: any = null;
    let polyline: any = null;

    if (mapsLoaded && extendedRepair && extendedMapRef.current) {
      const custLat = parseFloat(extendedRepair.user_lat || '11.6643');
      const custLng = parseFloat(extendedRepair.user_lng || '78.1460');

      const techLat = techLocation?.lat || 11.6643;
      const techLng = techLocation?.lng || 78.1460;

      const darkMapStyles = [
        {
          "featureType": "all",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#8796a5" }]
        },
        {
          "featureType": "all",
          "elementType": "labels.text.stroke",
          "stylers": [{ "visibility": "on" }, { "color": "#0f172a" }, { "weight": 2.5 }]
        },
        {
          "featureType": "landscape",
          "elementType": "geometry",
          "stylers": [{ "color": "#0f172a" }]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [{ "color": "#1e293b" }]
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
          "featureType": "road",
          "elementType": "labels",
          "stylers": [{ "visibility": "on" }]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#94a3b8" }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#020617" }]
        }
      ];

      const timer = setTimeout(() => {
        if (!extendedMapRef.current) return;
        try {
          map = new google.maps.Map(extendedMapRef.current, {
            center: { lat: (techLat + custLat) / 2, lng: (techLng + custLng) / 2 },
            zoom: 12,
            styles: darkMapStyles,
            disableDefaultUI: true,
            zoomControl: false
          });

          // Tech marker
          techMarker = new google.maps.Marker({
            position: { lat: techLat, lng: techLng },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#10b981',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 6
            },
            title: 'Me'
          });

          // Customer marker
          custMarker = new google.maps.Marker({
            position: { lat: custLat, lng: custLng },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#ffffff',
              fillOpacity: 0.9,
              strokeColor: '#000000',
              strokeWeight: 3,
              scale: 8
            },
            title: 'Customer'
          });

          // Fetch true driving route path with turns
          const fetchRoute = async () => {
            try {
              // Try OSRM first to avoid billing limits/errors
              const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${techLng},${techLat};${custLng},${custLat}?overview=full&geometries=geojson`);
              const routeData = await routeRes.json();
              if (routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
                const coords = routeData.routes[0].geometry.coordinates;
                const pathCoordinates = coords.map((c: [number, number]) => ({ lat: c[1], lng: c[0] }));
                if (map) {
                  polyline = new google.maps.Polyline({
                    path: pathCoordinates,
                    geodesic: true,
                    strokeColor: '#2563eb',
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                    map
                  });
                }
                return; // success, exit
              }
            } catch (e) {
              console.warn("OSRM routing failed on technician home, trying Google fallback:", e);
            }

            // Fallback to Google Directions Service
            try {
              const directionsService = new google.maps.DirectionsService();
              directionsService.route(
                {
                  origin: new google.maps.LatLng(techLat, techLng),
                  destination: new google.maps.LatLng(custLat, custLng),
                  travelMode: google.maps.TravelMode.DRIVING
                },
                async (result: any, status: any) => {
                  if (map && status === google.maps.DirectionsStatus.OK) {
                    polyline = new google.maps.Polyline({
                      path: result.routes[0].overview_path,
                      geodesic: true,
                      strokeColor: '#2563eb',
                      strokeOpacity: 0.8,
                      strokeWeight: 5,
                      map
                    });
                  } else {
                    if (map) {
                      polyline = new google.maps.Polyline({
                        path: [{ lat: techLat, lng: techLng }, { lat: custLat, lng: custLng }],
                        geodesic: true,
                        strokeColor: '#2563eb',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        map
                      });
                    }
                  }
                }
              );
            } catch {
              if (map) {
                polyline = new google.maps.Polyline({
                  path: [{ lat: techLat, lng: techLng }, { lat: custLat, lng: custLng }],
                  geodesic: true,
                  strokeColor: '#2563eb',
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  map
                });
              }
            }
          };
          fetchRoute();

          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: techLat, lng: techLng });
          bounds.extend({ lat: custLat, lng: custLng });
          map.fitBounds(bounds, { top: 30, bottom: 30, left: 30, right: 30 });
        } catch (e) {
          console.warn("Extended map error:", e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (techMarker) techMarker.setMap(null);
        if (custMarker) custMarker.setMap(null);
        if (polyline) polyline.setMap(null);
        map = null;
      };
    }
  }, [extendedRepair, techLocation, mapsLoaded]);



  /* ─── Fetch active (accepted) job ─── */
  const fetchActiveJob = async () => {
    try {
      const res  = await fetch(`${API}/repairs/technician`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const rows: any[] = data.data;
        const job = rows.find(
          r => r.status !== 'completed'
        ) || null;
        const done = rows.filter(
          r => r.status === 'completed'
        );
        setActiveJob(job);
        setCompletedJobs(done);
        activeJobIdRef.current = job ? job.id : null;
      }
    } catch (e) {
      console.error('fetchActiveJob', e);
    }
  };

  /* ─── Fetch pending offers from backend ─── */
  const fetchPendingOffers = async () => {
    try {
      const res  = await fetch(`${API}/repairs/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setPendingOffers(data.data || []);
      }
    } catch (e) {
      console.error('fetchPendingOffers', e);
    }
  };

  /* ─── Initial + polling load ─── */
  const loadAll = async () => {
    await Promise.all([fetchActiveJob(), fetchPendingOffers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 6000);
    return () => clearInterval(interval);
  }, [token]);



  /* ─── GPS broadcast ─── */
  useEffect(() => {
    let watchId: number;

    const startWatching = (highAccuracy: boolean) => {
      if (!navigator.geolocation) return;
      watchId = navigator.geolocation.watchPosition(
        async ({ coords: { latitude, longitude } }) => {
          try {
            setTechLocation({ lat: latitude, lng: longitude });
            const body: any = { lat: latitude, lng: longitude };
            if (activeJobIdRef.current) {
              body.tracking_type = 'repair';
              body.target_id     = activeJobIdRef.current;
            }
            await fetch(`${API}/location`, {
              method:  'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body:    JSON.stringify(body),
            });
          } catch {}
        },
        err => {
          if (err.code === 3 && highAccuracy) {
            console.warn("GPS high-accuracy timeout, falling back to standard accuracy.");
            if (watchId) navigator.geolocation.clearWatch(watchId);
            startWatching(false);
          } else {
            console.warn("Geolocation watch error:", err.message);
          }
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: highAccuracy ? 8000 : 15000, 
          maximumAge: 10000 
        }
      );
    };

    startWatching(true);

    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [token]);

  /* ─── Accept ─── */
  const handleAccept = async (offerId: number) => {
    setSubmitting('accept');
    try {
      const res  = await fetch(`${API}/repairs/${offerId}/accept`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await loadAll();
      } else {
        alert(data.message || 'Failed to accept job');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(null);
    }
  };

  /* ─── Reject ─── */
  const handleReject = async (offerId: number) => {
    setSubmitting('reject');
    try {
      const res  = await fetch(`${API}/repairs/${offerId}/reject`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        await fetchPendingOffers();
      } else {
        alert(data.message || 'Failed to reject');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(null);
    }
  };

  /* ─── Status update for active job ─── */
  const handleUpdateStatus = async (status: string) => {
    if (!activeJob) return;
    setStatusSubmitting(status);
    try {
      const res  = await fetch(`${API}/repairs/${activeJob.id}/status`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) await fetchActiveJob();
    } catch (e) {
      console.error(e);
    } finally {
      setStatusSubmitting(null);
    }
  };

  /* ─── Loading spinner ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-screen">
        <Loader2 className="h-10 w-10 text-amber-600 animate-spin mb-4" />
        <p className="text-xs font-black text-amber-900/40 uppercase tracking-widest">Initializing Terminal...</p>
      </div>
    );
  }

  if (fullscreenMap) {
    if (!activeJob) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 space-y-4">
          <Clock className="h-12 w-12 text-slate-300" />
          <h3 className="text-sm font-black text-slate-800 uppercase">No Active Mission Map</h3>
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
      <div className="fixed inset-0 z-[99999] bg-slate-900 flex flex-col animate-fadeIn">
        {/* Fullscreen Map container */}
        <div className="relative flex-1 w-full h-full">
          <TechnicianTracker
            repairId={activeJob.id}
            customerLat={parseFloat(activeJob.user_lat || '11.6643')}
            customerLng={parseFloat(activeJob.user_lng || '78.1460')}
            token={token}
            heightClass="h-full"
            fullscreen={true}
            useLiveCustomerLocation={!!activeJob.live_location_enabled}
            liveCustomerLat={activeJob.live_customer_lat ? parseFloat(activeJob.live_customer_lat) : null}
            liveCustomerLng={activeJob.live_customer_lng ? parseFloat(activeJob.live_customer_lng) : null}
            isTechnicianView={true}
            onDistanceUpdate={setDistanceText}
          />

          {/* Floating Header */}
          <div className="absolute top-4 left-4 right-4 z-[999999] flex items-center justify-between pointer-events-none">
            <button
              onClick={() => navigate('/technician/home')}
              className="p-3 bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl font-black text-xs uppercase border border-slate-200 shadow-lg flex items-center gap-1.5 pointer-events-auto active:scale-95 transition-all"
            >
              <X className="h-4 w-4" /> Exit Map
            </button>
            <div className="bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 shadow-lg text-white pointer-events-auto flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-amber-500">REP-{activeJob.id}</span>
              <span className="text-xs font-bold">{activeJob.device_brand} {activeJob.device_model}</span>
            </div>
          </div>

          {/* Floating Bottom Panel containing status updates */}
          <div className="absolute bottom-4 left-4 right-4 z-[999999] bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-2xl space-y-3">
            <div className="flex justify-between items-center px-1">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Status</p>
                <p className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">
                  {activeJob.status.replace(/_/g, ' ')}
                </p>
              </div>
              {distanceText && (
                <div className="text-center">
                  <p className="text-xs font-black text-[#2563eb]">{distanceText}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Distance Away</p>
                </div>
              )}
              <div className="text-right">
                <p className="text-xs font-black text-[#004c4c]">₹{activeJob.price}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Earnings</p>
              </div>
            </div>

            {/* Scrollable horizontal status tab buttons */}
            <div className="space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
                {[
                  { key: 'pending',             label: 'Pending',             icon: <Clock className="h-3.5 w-3.5" /> },
                  { key: 'technician_assigned', label: 'Assigned',            icon: <User className="h-3.5 w-3.5" /> },
                  { key: 'on_the_way',          label: 'On the Way',          icon: <Navigation className="h-3.5 w-3.5" /> },
                  { key: 'reached',             label: 'Reached',             icon: <MapPin className="h-3.5 w-3.5" /> },
                  { key: 'repaired',            label: 'Repaired',            icon: <Wrench className="h-3.5 w-3.5" /> },
                  { key: 'payment_done',        label: 'Payment Done',        icon: <CheckCircle className="h-3.5 w-3.5" /> },
                  { key: 'completed',           label: 'Completed',           icon: <Check className="h-3.5 w-3.5" /> }
                ].map(tab => {
                  const isActive = activeJob.status === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleUpdateStatus(tab.key)}
                      disabled={statusSubmitting !== null}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap snap-center transition-all active:scale-95 ${
                        isActive
                          ? 'bg-[#004c4c] text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {statusSubmitting === tab.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusOrder = ['pending', 'technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done', 'completed'];

  return (
    <div className="animate-fadeIn space-y-5 pb-24">

      {/* ── ACTIVE JOB ── */}
      {activeJob && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Mission</h3>
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">In Progress</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full -mr-14 -mt-14 opacity-60" />

            {/* Header */}
            <div className="relative flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center">
                  <Smartphone className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">REP-{activeJob.id}</span>
                    <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded uppercase">
                      {activeJob.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">{activeJob.device_brand} {activeJob.device_model}</h4>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">{activeJob.problem_type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#004c4c]">₹{activeJob.price}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Earnings</p>
              </div>
            </div>

            {/* Customer */}
            <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                  {activeJob.customer_name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900">{activeJob.customer_name}</p>
                  <p className="text-[10px] font-bold text-slate-400">{activeJob.mobile_number}</p>
                </div>
              </div>
              <a href={`tel:${activeJob.mobile_number}`}
                className="p-2.5 bg-[#004c4c] text-white rounded-xl active:scale-90 transition-all shadow-md">
                <Phone className="h-4 w-4" />
              </a>
            </div>

            {/* Reward */}
            {activeJob.reward && (
              <div className="bg-emerald-50 p-3.5 rounded-2xl flex items-center gap-3 border border-emerald-100 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Gift className="w-20 h-20 text-emerald-500" />
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 relative z-10">
                  <Gift className="h-5 w-5" />
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Customer Reward</p>
                  <p className="text-xs font-bold text-emerald-800">{activeJob.reward}</p>
                </div>
              </div>
            )}

            {/* Address + Navigate */}
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 px-1">
                <MapPin className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs font-bold text-slate-700 leading-snug">
                  {activeJob.address_line1}, {activeJob.city} – {activeJob.pincode}
                </p>
              </div>
              <button
                onClick={() => navigate('/technician/map')}
                className="w-full py-3 bg-amber-100 text-amber-800 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-amber-200 active:scale-95 transition-all"
              >
                <Navigation className="h-4 w-4" />
                Track Destination Path
              </button>
              {showTracker && (
                <div className="animate-scaleIn">
                  <TechnicianTracker
                    repairId={activeJob.id}
                    customerLat={parseFloat(activeJob.user_lat || '11.6643')}
                    customerLng={parseFloat(activeJob.user_lng || '78.1460')}
                    token={token}
                    onMapClick={() => navigate('/technician/map')}
                    useLiveCustomerLocation={!!activeJob.live_location_enabled}
                    liveCustomerLat={activeJob.live_customer_lat ? parseFloat(activeJob.live_customer_lat) : null}
                    liveCustomerLng={activeJob.live_customer_lng ? parseFloat(activeJob.live_customer_lng) : null}
                    isTechnicianView={true}
                    onDistanceUpdate={setDistanceText}
                  />
                </div>
              )}
            </div>

            {/* Status Tab Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Update Status</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-1 px-1">
                {[
                  { key: 'pending',             label: 'Pending',             icon: <Clock className="h-3 w-3" /> },
                  { key: 'technician_assigned', label: 'Assigned',            icon: <User className="h-3.5 w-3.5" /> },
                  { key: 'on_the_way',          label: 'On the Way',          icon: <Navigation className="h-3.5 w-3.5" /> },
                  { key: 'reached',             label: 'Reached',             icon: <MapPin className="h-3.5 w-3.5" /> },
                  { key: 'repaired',            label: 'Repaired',            icon: <Wrench className="h-3.5 w-3.5" /> },
                  { key: 'payment_done',        label: 'Payment Done',        icon: <CheckCircle className="h-3.5 w-3.5" /> },
                  { key: 'completed',           label: 'Completed',           icon: <Check className="h-3.5 w-3.5" /> }
                ].map(tab => {
                  const isActive = activeJob.status === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleUpdateStatus(tab.key)}
                      disabled={statusSubmitting !== null}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap snap-center transition-all active:scale-95 ${
                        isActive
                          ? 'bg-[#004c4c] text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {statusSubmitting === tab.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PENDING OFFER (only shown when no active job) ── */}
      {!activeJob && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-widest">
              {pendingOffers.length > 0 ? 'New Opportunities' : 'Job Queue'}
            </h3>
            {pendingOffers.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-200 flex items-center gap-1">
                <Zap className="h-2.5 w-2.5" /> Nearby
              </span>
            )}
          </div>

          {extendedRepairId && !extendedRepair ? (
            /* ── Loading state for card details ── */
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-white/10 rounded-[32px] w-full min-h-[300px]">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Job Details...</p>
            </div>
          ) : extendedRepair ? (
            /* ── Extended Card Details View ── */
            <div className="bg-slate-900 border border-white/10 rounded-[32px] p-5 shadow-2xl space-y-6 animate-fadeIn relative overflow-hidden select-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full -ml-12 -mb-12" />

              {/* Header */}
              <div className="relative flex justify-between items-start z-10">
                <div>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">REP-{extendedRepair.id}</span>
                  <h3 className="text-base font-black text-white mt-0.5">{extendedRepair.device_brand} {extendedRepair.device_model}</h3>
                  <p className="text-[10px] text-amber-500 font-black uppercase tracking-wider mt-0.5">{extendedRepair.problem_type}</p>
                </div>
                <button 
                  onClick={() => setExtendedRepairId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90 text-slate-400 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Accept Job button at top of extended card */}
              <div className="relative z-10">
                <button
                  onClick={() => handleAccept(extendedRepair.id)}
                  disabled={submitting !== null}
                  className="w-full h-14 bg-amber-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  {submitting === 'accept' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-5 w-5" /> Accept Job Opportunity
                    </>
                  )}
                </button>
              </div>

              {/* Map & Distance */}
              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Location Map</label>
                  {techLocation && extendedRepair.user_lat && extendedRepair.user_lng && (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                      Distance: {getHaversineDistance(techLocation.lat, techLocation.lng, parseFloat(extendedRepair.user_lat), parseFloat(extendedRepair.user_lng)).toFixed(2)} Km
                    </span>
                  )}
                </div>
                <div
                  ref={extendedMapRef}
                  className="w-full h-52 rounded-2xl border border-white/10 overflow-hidden shadow-inner z-0"
                />
              </div>

              {/* Price & Earnings */}
              <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5 relative z-10">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Earnings</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">₹{extendedRepair.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Mode</p>
                  <p className="text-xs font-bold text-white mt-0.5">COD / Online</p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5 relative z-10">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-1">Customer Details</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {extendedRepair.customer_photo ? (
                      <img
                        src={resolveAsset(extendedRepair.customer_photo) || ''}
                        alt={extendedRepair.customer_name}
                        className="w-9 h-9 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-900 text-[10px] font-black uppercase">
                        {(extendedRepair.customer_name || 'CU').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-black text-white">{extendedRepair.customer_name || 'Anonymous Customer'}</p>
                      <p className="text-[10px] font-bold text-slate-400">Customer User ID: #{extendedRepair.user_id}</p>
                    </div>
                  </div>
                  {extendedRepair.customer_mobile && (
                    <a
                      href={`tel:${extendedRepair.customer_mobile}`}
                      className="p-2.5 bg-emerald-500 text-slate-950 rounded-xl active:scale-90 transition-all flex items-center justify-center shadow-md"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Service Address */}
              <div className="bg-white/5 p-4 rounded-2xl space-y-2.5 border border-white/5 relative z-10">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Address</p>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">
                      {extendedRepair.address_line1}, {extendedRepair.city} {extendedRepair.pincode ? `– ${extendedRepair.pincode}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Problem description */}
              {extendedRepair.problem_description && (
                <div className="bg-white/5 p-4 rounded-2xl space-y-1 border border-white/5 relative z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Problem Description</p>
                  <p className="text-xs font-medium text-slate-300 italic leading-relaxed">
                    "{extendedRepair.problem_description}"
                  </p>
                </div>
              )}

              {/* Customer Uploaded Images */}
              {extendedRepair.image_url && (
                <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5 relative z-10">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">Customer Uploaded Images</p>
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
                    {extendedRepair.image_url.split(',').filter(Boolean).map((url: string, i: number) => (
                      <img
                        key={i}
                        src={resolveAsset(url) || ''}
                        alt="Upload"
                        onClick={() => setFullScreenImage(resolveAsset(url))}
                        className="w-20 h-20 rounded-xl object-cover border border-white/10 cursor-pointer hover:opacity-85 active:scale-95 transition-all"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Close/Back button at bottom */}
              <div className="relative z-10">
                <button
                  onClick={() => setExtendedRepairId(null)}
                  className="w-full h-12 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-white/5 hover:bg-white/20 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Go Back
                </button>
              </div>
            </div>
          ) : pendingOffers.length > 0 ? (
            /* ── Offer Stack ── */
            <div className="w-full relative h-[480px]">
              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={false}
                autoplay={false}
                autoplayDelay={4000}
                pauseOnHover={true}
                cards={pendingOffers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="w-full h-full text-left bg-slate-900 p-5 rounded-3xl shadow-2xl space-y-5 border border-white/10 relative overflow-hidden flex flex-col justify-between select-none"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-500/5 rounded-full -ml-8 -mb-8" />

                    <div className="space-y-4 relative z-10">
                      {/* Offer Header */}
                      <div className="relative flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-500/30">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-white font-black text-sm">
                              {offer.device_brand} {offer.device_model}
                            </h4>
                            <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                              {offer.problem_type}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">₹{offer.price}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Earnings</p>
                        </div>
                      </div>

                      {/* Info chips */}
                      <div className="space-y-2">
                        <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-2xl">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-[11px] font-bold text-slate-300 leading-snug">
                            {offer.address_line1}, {offer.city}
                            {offer.pincode ? ` – ${offer.pincode}` : ''}
                          </p>
                        </div>
                        {offer.problem_description && (
                          <div className="flex items-start gap-2.5 bg-white/5 p-3 rounded-2xl">
                            <AlertCircle className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-[11px] font-medium text-slate-400 italic leading-snug">
                              "{offer.problem_description}"
                            </p>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-2xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Repair ID</span>
                          <span className="text-[11px] font-black text-slate-300">REP-{offer.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5 relative z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExtendedRepairId(offer.id);
                        }}
                        className="w-full h-11 bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-white/5 hover:bg-white/20 cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" /> Details
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(offer.id);
                          }}
                          disabled={submitting !== null}
                          className="w-full h-12 bg-amber-500 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xl shadow-amber-500/20 cursor-pointer"
                        >
                          {submitting === 'accept' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4" /> Accept Job
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              />
            </div>
          ) : (
            /* ── Empty queue ── */
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-10 text-center border border-dashed border-amber-200">
              <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-7 w-7 text-amber-200" />
              </div>
              <h3 className="text-sm font-black text-amber-900/60 uppercase">Searching for Tickets</h3>
              <p className="text-[10px] text-amber-900/40 font-bold mt-1 uppercase tracking-widest">
                You're in the queue for nearby repairs
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Image Lightbox Modal ── */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setFullScreenImage(null)}>
          <img src={fullScreenImage} className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl border border-white/10" alt="Lightbox" />
          <button className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"><X className="h-5 w-5" /></button>
        </div>
      )}



    </div>
  );
}
