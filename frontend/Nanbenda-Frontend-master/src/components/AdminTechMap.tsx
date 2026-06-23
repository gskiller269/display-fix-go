import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, API_URL, BASE_URL } from '../api/api';

declare const google: any;

interface AdminTechMapProps {
  token: string;
}

export default function AdminTechMap({ token }: AdminTechMapProps) {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const infoWindowRef = useRef<any>(null);
  const HTMLMarkerClassRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);

  // 1. Dynamic Script Loader for Google Maps using async/callback best practices
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
      // Clean up callback to avoid memory leak if unmounted while loading
      delete (window as any).initGoogleMap;
    };
  }, []);

  // 2. Fetch technician locations
  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users?role=technician`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filter technicians who have actual coordinates from the location table
        const techsWithLocation = data.data.filter((t: any) => t.latitude && t.longitude);
        setTechnicians(techsWithLocation);
      }
    } catch (err) {
      console.error("Error fetching technicians for map:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    const interval = setInterval(fetchTechnicians, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [token]);

  // 3. Define HTMLMarker class once Maps load
  useEffect(() => {
    if (!mapsLoaded || HTMLMarkerClassRef.current) return;

    // Create custom HTML marker overlay that avoids AdvancedMarkerElement Map ID requirements/warnings
    class HTMLMarker extends google.maps.OverlayView {
      private position: { lat: number; lng: number };
      private html: string;
      private div: HTMLDivElement | null = null;
      private onClick: () => void;

      constructor(position: { lat: number; lng: number }, html: string, map: any, onClick: () => void) {
        super();
        this.position = position;
        this.html = html;
        this.onClick = onClick;
        this.setMap(map);
      }

      onAdd() {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.cursor = 'pointer';
        div.style.zIndex = '10';
        div.innerHTML = this.html;
        this.div = div;

        div.addEventListener('click', (e) => {
          e.stopPropagation();
          this.onClick();
        });

        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        const latLng = new google.maps.LatLng(this.position.lat, this.position.lng);
        const point = projection.fromLatLngToDivPixel(latLng);

        if (point) {
          // Centered on coords
          this.div.style.left = (point.x - 17) + 'px';
          this.div.style.top = (point.y - 17) + 'px';
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

  // 4. Initialize Map
  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstance.current) return;

    // Center on Tamil Nadu coordinates
    const tamilNaduCenter = { lat: 11.1271, lng: 78.6569 };

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

    const newMap = new google.maps.Map(mapRef.current, {
      center: tamilNaduCenter,
      zoom: 7,
      styles: swiggyMapStyles,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false
    });

    mapInstance.current = newMap;
    infoWindowRef.current = new google.maps.InfoWindow();

    return () => {
      // Clean up markers
      Object.keys(markersRef.current).forEach(id => {
        markersRef.current[id].setMap(null);
      });
      markersRef.current = {};
      mapInstance.current = null;
    };
  }, [mapsLoaded]);

  // 5. Update markers on the Google Map
  useEffect(() => {
    if (!mapInstance.current || !mapsLoaded || !HTMLMarkerClassRef.current) return;

    const map = mapInstance.current;

    // Remove markers that are no longer in the list
    Object.keys(markersRef.current).forEach(id => {
      if (!technicians.find(t => t.id.toString() === id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    technicians.forEach(tech => {
      const lat = parseFloat(tech.latitude);
      const lng = parseFloat(tech.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const position = { lat, lng };

        const profileImage = tech.profile_image_url
          ? (tech.profile_image_url.startsWith('http')
              ? tech.profile_image_url
              : `${BASE_URL}${tech.profile_image_url}`)
          : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH_TyaVDmy-a7Z_ZWN_ODDeFHAUPEgTfBdUBY5DGR12vtO43KQ5q9V213cv9qSifDL6K9GVDtH3qRpX3HZpJWqxP1wcLRRjjmciHZTCx7m88JnAp8exzurfQPAtDk50JEUB6VVYLRZF7L6XlTOY5DM-6X5KcKgQKpMsNQ70aWaKiFpq_Iw-Ffk8UpxLAIS6c-KcMtnfCtwN2RbKkTcMhUEWc3ydpQ0vYJXFJvz-j2hAwEyhJLsJ_Jq78GE4PneOLJPcWYLBwFLMCmH';

        const popupContent = `
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px; min-width: 140px;">
            <p style="margin: 0; font-weight: 800; font-size: 13px; color: #004c4c;">${tech.full_name || tech.username}</p>
            <p style="margin: 2px 0 0; font-size: 10px; font-weight: 600; color: #64748b;">${tech.mobile_number}</p>
            <div style="margin: 8px 0 0; padding-top: 6px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 9px; font-weight: 800; color: ${tech.status === 'active' ? '#14b8a6' : '#94a3b8'}; text-transform: uppercase;">
                ● ${tech.status}
              </span>
              <span style="font-size: 8px; color: #94a3b8;">${tech.location_updated_at ? new Date(tech.location_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
            </div>
          </div>
        `;

        const onMarkerClick = () => {
          infoWindowRef.current.setContent(popupContent);
          infoWindowRef.current.setPosition(position);
          infoWindowRef.current.open(map);
        };

        if (markersRef.current[tech.id]) {
          markersRef.current[tech.id].setPosition(position);
          // Re-bind click handler on update to capture latest popupContent/position state
          markersRef.current[tech.id].onClick = onMarkerClick;
        } else {
          // Use custom HTMLMarker overlay instead of standard / Advanced markers
          const markerHtml = `
            <div style="background-color: #14b8a6; width: 34px; height: 34px; border-radius: 10px; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.15); overflow: hidden; display: flex; align-items: center; justify-content: center;">
              <img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          `;
          
          const marker = new HTMLMarkerClassRef.current(position, markerHtml, map, onMarkerClick);
          markersRef.current[tech.id] = marker;
        }
      }
    });
  }, [technicians, mapsLoaded]);

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col">
      <header className="px-6 py-4 bg-white/85 backdrop-blur-md border-b border-slate-100 flex items-center justify-between absolute top-0 left-0 w-full z-[1001]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/staff')}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[#004c4c]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Staff Deployment</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Technician Locations
            </p>
          </div>
        </div>
        
        <div className="bg-[#004c4c] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-teal-900/10">
          {technicians.length} Active
        </div>
      </header>

      <div ref={mapRef} className="flex-1 w-full h-full z-0" />

      {loading && technicians.length === 0 && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs flex flex-col items-center justify-center z-[1002]">
          <Loader2 className="h-10 w-10 text-[#004c4c] animate-spin mb-4" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning network...</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-10 left-6 z-[1001] bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-2xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg border-2 border-white flex items-center justify-center text-white shadow-sm">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">Technicians</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">Live Pulse Tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
}
