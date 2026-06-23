import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';

declare const L: any;

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: any) => void;
}

export default function MapSelector({ onLocationSelect }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchVal] = useState('');

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      const initialPos: [number, number] = [11.6643, 78.1460]; // Salem
      const newMap = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(initialPos, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(newMap);

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: #004c4c; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const newMarker = L.marker(initialPos, {
        draggable: true,
        icon: customIcon
      }).addTo(newMap);

      mapInstance.current = { map: newMap, marker: newMarker };

      newMap.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        newMarker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      newMarker.on('dragend', () => {
        const pos = newMarker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
      });

      // Automatically fetch current location on load
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (!mapInstance.current) {
              setLoading(false);
              return;
            }
            const { latitude, longitude } = position.coords;
            newMap.setView([latitude, longitude], 16, { animate: false });
            newMarker.setLatLng([latitude, longitude]);
            reverseGeocode(latitude, longitude);
            setLoading(false);
          },
          () => {
            setLoading(false);
            console.warn("Geolocation permission denied or failed.");
          }
        );
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.map.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        
        // Construct comprehensive address lines
        const house = addr.house_number || '';
        const road = addr.road || '';
        const suburb = addr.suburb || addr.neighbourhood || '';
        
        const line1 = [house, road].filter(Boolean).join(', ') || suburb || '';
        const line2 = addr.neighbourhood || addr.suburb || addr.city_district || '';
        
        const details = {
          line1: line1,
          line2: line2 !== line1 ? line2 : '',
          city: addr.city || addr.town || addr.village || addr.county || '',
          state: addr.state || '',
          pincode: addr.postcode || '',
          fullAddress: data.display_name
        };
        onLocationSelect(lat, lng, details);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !mapInstance.current) return;
    setLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLon = parseFloat(lon);
        mapInstance.current.map.setView([newLat, newLon], 16);
        mapInstance.current.marker.setLatLng([newLat, newLon]);
        
        // Fetch full details for this point
        reverseGeocode(newLat, newLon);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation && mapInstance.current) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstance.current.map.setView([latitude, longitude], 16);
          mapInstance.current.marker.setLatLng([latitude, longitude]);
          reverseGeocode(latitude, longitude);
          setLoading(false);
        },
        () => {
          setLoading(false);
          alert("Error: The Geolocation service failed. Please check your browser permissions.");
        }
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search area (e.g. Salem, Tamil Nadu)"
          value={searchQuery}
          onChange={(e) => setSearchVal(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-12 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
        />
        <button 
          type="button"
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#004c4c] text-white px-2 py-1 rounded-md text-[10px] font-black uppercase"
        >
          Search
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 h-48 shadow-inner z-0">
        <div ref={mapRef} className="w-full h-full" />
        <button
          type="button"
          onClick={useCurrentLocation}
          className="absolute bottom-4 right-4 bg-white p-2.5 rounded-full shadow-lg border border-slate-100 active:scale-95 transition-all text-[#004c4c] z-[1000]"
          disabled={loading}
        >
          <Navigation className={`h-5 w-5 ${loading ? 'animate-pulse' : ''}`} />
        </button>
      </div>
      
      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 px-1">
        <MapPin className="h-3 w-3" /> Drag the pin or click on map for precise location
      </p>
    </div>
  );
}
