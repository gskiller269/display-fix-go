import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Shield, Maximize2, MapPin, Radio } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, API_URL, BASE_URL } from '../api/api';

declare const google: any;

interface TechnicianTrackerProps {
  repairId: string;
  customerLat: number;
  customerLng: number;
  token: string;
  onMapClick?: () => void;
  heightClass?: string;
  fullscreen?: boolean;
  /** When true, use liveCustomerLat/liveCustomerLng as destination instead of customerLat/customerLng */
  useLiveCustomerLocation?: boolean;
  liveCustomerLat?: number | null;
  liveCustomerLng?: number | null;
  isTechnicianView?: boolean;
  onDistanceUpdate?: (distanceText: string | null) => void;
}

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

export default function TechnicianTracker({
  repairId,
  customerLat,
  customerLng,
  token,
  onMapClick,
  heightClass = 'h-64',
  fullscreen = false,
  useLiveCustomerLocation = false,
  liveCustomerLat,
  liveCustomerLng,
  isTechnicianView = false,
  onDistanceUpdate
}: TechnicianTrackerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const initialFitRef = useRef<boolean>(false);
  const HTMLMarkerClassRef = useRef<any>(null);
  
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (onDistanceUpdate) {
      onDistanceUpdate(distanceText);
    }
  }, [distanceText, onDistanceUpdate]);

  // Resolve the destination (address vs live GPS)
  const destLat = useLiveCustomerLocation && liveCustomerLat != null ? liveCustomerLat : customerLat;
  const destLng = useLiveCustomerLocation && liveCustomerLng != null ? liveCustomerLng : customerLng;

  // 1. Dynamic Script Loader for Google Maps
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

  // 2. Define Custom HTMLMarker once maps are loaded
  useEffect(() => {
    if (!mapsLoaded || HTMLMarkerClassRef.current) return;

    class HTMLMarker extends google.maps.OverlayView {
      private position: { lat: number; lng: number };
      private html: string;
      private div: HTMLDivElement | null = null;
      private offsetX: number;
      private offsetY: number;

      constructor(position: { lat: number; lng: number }, html: string, map: any, offsetX = 9, offsetY = 9) {
        super();
        this.position = position;
        this.html = html;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.setMap(map);
      }

      onAdd() {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.zIndex = '10';
        div.innerHTML = this.html;
        this.div = div;

        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        const latLng = new google.maps.LatLng(this.position.lat, this.position.lng);
        const point = projection.fromLatLngToDivPixel(latLng);

        if (point) {
          this.div.style.left = (point.x - this.offsetX) + 'px';
          this.div.style.top = (point.y - this.offsetY) + 'px';
        }
      }

      onRemove() {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }

      setPosition(position: { lat: number; lng: number }) {
        this.position = position;
        this.draw();
      }
    }

    HTMLMarkerClassRef.current = HTMLMarker;
  }, [mapsLoaded]);

  // Inject custom Zomato/Swiggy marker styles & animations
  useEffect(() => {
    const styleId = 'swiggy-zomato-map-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes map-ripple {
          0% { transform: scale(0.6); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes scooter-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 3. Initialize Map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance.current || !HTMLMarkerClassRef.current) return;

    const destPos = { lat: destLat, lng: destLng };

    // Swiggy and Zomato warm pastel/cream minimalist map style
    const swiggyMapStyles = [
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#4f5b66" }]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [{ "visibility": "on" }, { "color": "#ffffff" }, { "weight": 3 }]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#fdfbf7" }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f3ef" }]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#e2ebd9" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }]
      },
      {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#e5e0d8" }]
      },
      {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [{ "visibility": "on" }]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#2c3e50" }]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#ffffff" }, { "weight": 2.5 }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffe8cc" }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{ "color": "#ffd8a8" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#cce8f4" }]
      }
    ];

    const map = new google.maps.Map(mapRef.current, {
      center: destPos,
      zoom: 14,
      styles: swiggyMapStyles,
      disableDefaultUI: true,
      zoomControl: false
    });

    const custIconHtml = useLiveCustomerLocation
      ? `<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
           <div style="position: absolute; width: 36px; height: 36px; background: rgba(37, 99, 235, 0.25); border-radius: 50%; animation: map-ripple 1.8s infinite ease-out;"></div>
           <div style="position: absolute; width: 44px; height: 44px; background: rgba(37, 99, 235, 0.15); border-radius: 50%; animation: map-ripple 1.8s infinite ease-out; animation-delay: 0.6s;"></div>
           <div style="position: relative; width: 18px; height: 18px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>
         </div>`
      : `<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
           <div style="position: absolute; width: 36px; height: 36px; background: rgba(239, 68, 68, 0.25); border-radius: 50%; animation: map-ripple 1.8s infinite ease-out;"></div>
           <div style="position: absolute; width: 44px; height: 44px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; animation: map-ripple 1.8s infinite ease-out; animation-delay: 0.6s;"></div>
           <div style="position: relative; width: 32px; height: 32px; background: #ef4444; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
               <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
               <polyline points="9 22 9 12 15 12 15 22"/>
             </svg>
           </div>
         </div>`;

    const techIconHtml = `<div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
         <div style="position: absolute; width: 36px; height: 36px; background: rgba(16, 185, 129, 0.25); border-radius: 50%; animation: map-ripple 1.8s infinite ease-out;"></div>
         <div style="position: absolute; width: 44px; height: 44px; background: rgba(16, 185, 129, 0.15); border-radius: 50%; animation: map-ripple 1.8s infinite ease-out; animation-delay: 0.6s;"></div>
         <div style="position: relative; width: 32px; height: 32px; background: #10b981; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; animation: scooter-bounce 1s infinite ease-in-out;">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="6" cy="18" r="2" fill="white" />
             <circle cx="18" cy="18" r="2" fill="white" />
             <path d="M6 18h6l2-7H7" />
             <path d="M14 11h4l2 7" />
             <path d="M17 7l-2-4h-2" />
             <rect x="5" y="8" width="6" height="6" rx="1" fill="white" />
           </svg>
         </div>
       </div>`;

    const custMarker = new HTMLMarkerClassRef.current(destPos, custIconHtml, map, 22, 22);
    const techMarker = new HTMLMarkerClassRef.current(destPos, techIconHtml, map, 22, 22);

    // Thick base path representing route context
    const pathBackground = new google.maps.Polyline({
      path: [destPos, destPos],
      geodesic: true,
      strokeColor: '#004c4c',
      strokeOpacity: 0.15,
      strokeWeight: 8,
      map
    });

    // Dashed overlay path running down the center
    const lineSymbol = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 1,
      scale: 3
    };

    const pathForeground = new google.maps.Polyline({
      path: [destPos, destPos],
      geodesic: true,
      strokeColor: '#004c4c',
      strokeOpacity: 0,
      icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '15px'
      }],
      map
    });

    mapInstance.current = { map, techMarker, pathBackground, pathForeground, custMarker };

    if (onMapClick) {
      map.addListener('click', () => {
        onMapClick();
      });
    }

    return () => {
      if (mapInstance.current) {
        if (mapInstance.current.techMarker) mapInstance.current.techMarker.setMap(null);
        if (mapInstance.current.custMarker) mapInstance.current.custMarker.setMap(null);
        if (mapInstance.current.pathBackground) mapInstance.current.pathBackground.setMap(null);
        if (mapInstance.current.pathForeground) mapInstance.current.pathForeground.setMap(null);
        mapInstance.current = null;
      }
    };
  }, [isTechnicianView, mapsLoaded, useLiveCustomerLocation]);

  // Update customer marker whenever destination changes
  useEffect(() => {
    if (!mapInstance.current || !mapsLoaded) return;
    const { custMarker } = mapInstance.current;
    if (custMarker) {
      custMarker.setPosition({ lat: destLat, lng: destLng });
    }
  }, [destLat, destLng, mapsLoaded]);

  // Route updates loop
  useEffect(() => {
    if (!mapsLoaded) return;
    let active = true;

    const fetchRouteAndLoc = async () => {
      try {
        if (!mapInstance.current || !mapRef.current) return;

        const response = await fetch(`${API_URL}/repairs/${repairId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (!active || !mapInstance.current) return;

        if (data.success && data.data.technician_location_lat && data.data.technician_location_lng) {
          const techLat = parseFloat(data.data.technician_location_lat);
          const techLng = parseFloat(data.data.technician_location_lng);
          
          if (isNaN(techLat) || isNaN(techLng) || (techLat === 0 && techLng === 0)) return;

          const newPos = { lat: techLat, lng: techLng };
          const { map, techMarker, pathBackground, pathForeground, custMarker } = mapInstance.current;

          // Use live customer location from API response if available
          const apiLiveLat = data.data.live_customer_lat ? parseFloat(data.data.live_customer_lat) : null;
          const apiLiveLng = data.data.live_customer_lng ? parseFloat(data.data.live_customer_lng) : null;
          const resolvedDestLat = useLiveCustomerLocation && apiLiveLat ? apiLiveLat : destLat;
          const resolvedDestLng = useLiveCustomerLocation && apiLiveLng ? apiLiveLng : destLng;

          if (!isNaN(techLat) && !isNaN(techLng) && techLat !== 0 && techLng !== 0 && resolvedDestLat && resolvedDestLng) {
            const dist = getHaversineDistance(techLat, techLng, resolvedDestLat, resolvedDestLng);
            if (!distanceText) {
              setDistanceText(dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`);
            }
          }

          try {
            if (techMarker) {
              techMarker.setPosition(newPos);
            }
            if (custMarker && resolvedDestLat && resolvedDestLng) {
              custMarker.setPosition({ lat: resolvedDestLat, lng: resolvedDestLng });
            }

            const setPathCoordinates = (coords: any[]) => {
              if (pathBackground) pathBackground.setPath(coords);
              if (pathForeground) pathForeground.setPath(coords);
            };

             // Fetch true driving route path with turns
             const getRoute = async () => {
               try {
                 // Try OSRM routing first to avoid Google billing issues and console warnings
                 const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${techLng},${techLat};${resolvedDestLng},${resolvedDestLat}?overview=full&geometries=geojson`);
                 const routeData = await routeRes.json();
                 if (active && routeData.code === 'Ok' && routeData.routes && routeData.routes.length > 0) {
                   const coords = routeData.routes[0].geometry.coordinates; // [lng, lat]
                   const pathCoordinates = coords.map((c: [number, number]) => ({ lat: c[1], lng: c[0] }));
                   setPathCoordinates(pathCoordinates);
                   
                   const dist = routeData.routes[0].distance; // meters
                   setDistanceText(dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`);
                   return; // Success, exit
                 }
               } catch (e) {
                 console.warn("OSRM routing failed, trying Google/Straight line fallback:", e);
               }

               // Fallback to Google Directions Service if OSRM is down
               try {
                 const directionsService = new google.maps.DirectionsService();
                 directionsService.route(
                   {
                     origin: new google.maps.LatLng(techLat, techLng),
                     destination: new google.maps.LatLng(resolvedDestLat, resolvedDestLng),
                     travelMode: google.maps.TravelMode.DRIVING
                   },
                   async (result: any, status: any) => {
                     if (active && status === google.maps.DirectionsStatus.OK) {
                       setPathCoordinates(result.routes[0].overview_path);
                       if (result.routes[0].legs && result.routes[0].legs[0]) {
                         setDistanceText(result.routes[0].legs[0].distance.text);
                       }
                     } else {
                       setPathCoordinates([newPos, { lat: resolvedDestLat, lng: resolvedDestLng }]);
                     }
                   }
                 );
               } catch {
                 setPathCoordinates([newPos, { lat: resolvedDestLat, lng: resolvedDestLng }]);
               }
             };
            getRoute();

            if (map && !initialFitRef.current) {
              if (isTechnicianView) {
                map.setCenter(newPos);
                map.setZoom(15);
              } else {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend(newPos);
                bounds.extend({ lat: resolvedDestLat, lng: resolvedDestLng });
                map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
              }
              initialFitRef.current = true;
            }
          } catch (mapErr) {
            console.warn("Google Maps interaction error:", mapErr);
          }
        }
      } catch (err) {
        console.error("Error updating map path:", err);
      }
    };

    fetchRouteAndLoc();
    const interval = setInterval(fetchRouteAndLoc, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [repairId, token, destLat, destLng, useLiveCustomerLocation, isTechnicianView, mapsLoaded]);

  if (fullscreen) {
    return (
      <div className="w-full h-full relative z-0">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-sm relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-[#004c4c]">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Live Mission Path</h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Technician Realtime Route</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {useLiveCustomerLocation && (
              <div className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1">
                <Radio className="h-2.5 w-2.5" />
                GPS
              </div>
            )}
            <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse">
              LIVE
            </div>
            {onMapClick && (
              <button 
                onClick={onMapClick} 
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
                title="Fullscreen Map"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div 
          onClick={onMapClick}
          className={`relative rounded-2xl overflow-hidden border border-slate-200 ${heightClass} shadow-inner z-0 ${onMapClick ? 'cursor-pointer hover:border-[#004c4c] transition-all' : ''}`}
        >
          <div ref={mapRef} className="w-full h-full" />
          
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[1000] pointer-events-none">
            {distanceText && (
              <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-white/50 flex items-center gap-1.5 pointer-events-auto">
                <Navigation className="h-2.5 w-2.5 text-[#2563eb]" />
                <span className="text-[9px] font-black text-slate-700">
                  {distanceText}
                </span>
              </div>
            )}
            <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-white/50 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#2563eb] animate-ping"></div>
              <span className="text-[9px] font-black text-slate-700">
                {useLiveCustomerLocation ? 'GPS' : 'Address'}
              </span>
            </div>
            <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-white/50 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isTechnicianView ? 'bg-[#004c4c]' : 'bg-black'}`}></div>
              <span className="text-[9px] font-black text-slate-700">{isTechnicianView ? 'Destination' : 'Me'}</span>
            </div>
            <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs border border-white/50 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-slate-700">{isTechnicianView ? 'Me (Tech)' : 'Tech'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
