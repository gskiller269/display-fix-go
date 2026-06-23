import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin, Map as MapIcon } from 'lucide-react';
import { fetchAddresses, createAddress, setAddressActive } from '../api/deviceApi';
import MapSelector from './MapSelector';

interface ClientAddressesProps {
  token: string;
}

export default function ClientAddresses({ token }: ClientAddressesProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [addressesList, setAddressesList] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);

  // Address form fields
  const [newAddrLabel, setNewAddrLabel] = useState<string>('Home');
  const [newAddrFullName, setNewAddrFullName] = useState<string>('');
  const [newAddrMobile, setNewAddrMobile] = useState<string>('');
  const [newAddrLine1, setNewAddrLine1] = useState<string>('');
  const [newAddrLine2, setNewAddrLine2] = useState<string>('');
  const [newAddrLandmark, setNewAddrLandmark] = useState<string>('');
  const [newAddrCity, setNewAddrCity] = useState<string>('');
  const [newAddrState, setNewAddrState] = useState<string>('');
  const [newAddrPincode, setNewAddrPincode] = useState<string>('');
  const [newAddrLat, setNewAddrLat] = useState<number | null>(null);
  const [newAddrLng, setNewAddrLng] = useState<number | null>(null);
  const [autofilled, setAutofilled] = useState<boolean>(false);

  const loadAddresses = () => {
    if (token) {
      fetchAddresses(token).then(data => setAddressesList(data));
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [token]);

  const handleSelectAddress = async (id: string) => {
    await setAddressActive(token, id);
    const saved = sessionStorage.getItem('booking_wizard_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        state.selectedAddressId = id;
        sessionStorage.setItem('booking_wizard_state', JSON.stringify(state));
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/customer/book/wizard/logistics');
  };

  const handleLocationSelect = (lat: number, lng: number, details: any) => {
    setNewAddrLat(lat);
    setNewAddrLng(lng);
    setNewAddrLine1(details.line1 || '');
    setNewAddrLine2(details.line2 || '');
    setNewAddrCity(details.city || '');
    setNewAddrState(details.state || '');
    setNewAddrPincode(details.pincode || '');
    setAutofilled(true);
    setTimeout(() => setAutofilled(false), 3000);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrFullName || !newAddrMobile || !newAddrLine1 || !newAddrCity || !newAddrState || !newAddrPincode) {
      navigate('/customer/alert?message=' + encodeURIComponent("Please fill in all the required fields.") + '&type=error');
      return;
    }
    const res = await createAddress(token, {
      label: newAddrLabel,
      full_name: newAddrFullName,
      mobile_number: newAddrMobile,
      address_line1: newAddrLine1,
      address_line2: newAddrLine2 || null,
      landmark: newAddrLandmark || null,
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
      latitude: newAddrLat,
      longitude: newAddrLng,
      is_active: 1
    });

    if (res.success) {
      loadAddresses();
      // Reset fields
      setNewAddrFullName('');
      setNewAddrMobile('');
      setNewAddrLine1('');
      setNewAddrLine2('');
      setNewAddrLandmark('');
      setNewAddrCity('');
      setNewAddrState('');
      setNewAddrPincode('');
      setNewAddrLat(null);
      setNewAddrLng(null);
      setShowAddForm(false);
      setShowMap(false);
    } else {
      navigate('/customer/alert?message=' + encodeURIComponent(res.message || "Failed to add address") + '&type=error');
    }
  };

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pt-6 pb-28">
      {/* Back & Title */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => {
            if (location.state?.selectMode) {
              navigate('/customer/book/wizard/logistics');
            } else {
              navigate('/customer/account');
            }
          }}
          className="p-2 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all text-slate-800"
        >
          <ArrowLeft className="h-6 w-6 text-slate-700" />
        </button>
        <h2 className="text-xl font-black text-slate-900">
          {location.state?.selectMode ? 'Select Delivery Address' : 'Saved Addresses'}
        </h2>
      </div>

      <div className="space-y-4">
        {!showAddForm ? (
          <>
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 bg-[#E9F6F6] text-[#004c4c] text-sm font-bold rounded-xl border border-teal-100 active:scale-98 transition-transform mb-3 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {addressesList.length > 0 ? (
                addressesList.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      if (location.state?.selectMode || sessionStorage.getItem('booking_wizard_state')) {
                        handleSelectAddress(String(item.id));
                      }
                    }}
                    className={`p-4 bg-white rounded-xl border text-xs leading-relaxed shadow-xs flex gap-3 items-start transition-all ${
                      (location.state?.selectMode || sessionStorage.getItem('booking_wizard_state')) ? 'cursor-pointer hover:border-[#004c4c]/40 active:scale-[0.99] hover:shadow-sm border-teal-500/10' : 'border-slate-100'
                    }`}
                  >
                    <div className="p-2.5 bg-[#E9F6F6] text-[#004c4c] rounded-lg mt-0.5 animate-fadeIn">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1 mb-1 text-sm">
                        {item.label} 
                        {item.is_active ? <span className="bg-teal-100 text-[#004c4c] text-[10px] font-bold px-2.5 py-0.5 ml-2 rounded-full">Active</span> : null}
                      </p>
                      <p className="text-slate-500 font-medium text-xs leading-relaxed mt-1">
                        <span className="font-bold text-slate-700">{item.full_name}</span> ({item.mobile_number})<br />
                        {item.address_line1}{item.address_line2 ? `, ${item.address_line2}` : ''}
                        {item.landmark ? ` [Landmark: ${item.landmark}]` : ''}, {item.city}, {item.state} - {item.pincode}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic text-center py-8 bg-white rounded-xl border border-slate-100 shadow-xs">
                  No addresses saved. Add one above.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Address addition form */
          <form onSubmit={handleSaveNewAddress} className="space-y-4 bg-white p-5 rounded-xl border border-slate-150 shadow-xs">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Select on Map</label>
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="w-full py-2.5 bg-[#E9F6F6] text-[#004c4c] text-[11px] font-black rounded-lg border border-teal-100 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
              >
                <MapIcon className="h-4 w-4" /> {showMap ? 'Hide Map' : 'Open Map for Live Location'}
              </button>
            </div>

            {showMap && (
              <div className="mb-2">
                <MapSelector onLocationSelect={handleLocationSelect} />
                {autofilled && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg animate-fadeIn">
                    <p className="text-[10px] text-emerald-600 font-black text-center uppercase tracking-wider">
                      ✨ Address fields autofilled from map
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Label Identifier</label>
              <div className="flex gap-2.5">
                {['Home', 'Work', 'Other'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewAddrLabel(lbl)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      newAddrLabel === lbl ? 'bg-[#004c4c] text-white border-transparent' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={newAddrFullName}
                onChange={(e) => setNewAddrFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={newAddrMobile}
                onChange={(e) => setNewAddrMobile(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Address Line 1 *</label>
              <input
                type="text"
                required
                placeholder="Flat/House No., Building, Street"
                value={newAddrLine1}
                onChange={(e) => setNewAddrLine1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Address Line 2 (Optional)</label>
              <input
                type="text"
                placeholder="Apartment, Area, Sector"
                value={newAddrLine2}
                onChange={(e) => setNewAddrLine2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Near City Mall"
                value={newAddrLandmark}
                onChange={(e) => setNewAddrLandmark(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Salem"
                  value={newAddrCity}
                  onChange={(e) => setNewAddrCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Indiana"
                  value={newAddrState}
                  onChange={(e) => setNewAddrState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Pincode / Zip Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. 636001"
                value={newAddrPincode}
                onChange={(e) => setNewAddrPincode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
              />
            </div>

            <div className="flex gap-3.5 pt-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-xs font-bold bg-[#004c4c] text-white rounded-lg transition-colors"
              >
                Save Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
