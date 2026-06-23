import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Star, ArrowLeft, ShieldAlert, Award, Camera, Save, X, UserCheck, ChevronRight, Loader2, Phone, Mail, User, MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL, BASE_URL } from '../api/api';

interface AdminTechniciansProps {
  token: string;
}

export default function AdminStaff({ token }: AdminTechniciansProps) {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [searchVal, setSearchVal] = useState<string>('');
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // New Tech entry state
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  
  // Image files
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [aadharImage, setAadharImage] = useState<File | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  
  // Previews
  const [profilePreview, setProfilePreview] = useState<string>('');

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users?role=technician`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setTechnicians(data.data);
      }
    } catch (err) {
      console.error("Error fetching technicians:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    const interval = setInterval(fetchTechnicians, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (isAdding) {
      fetch(`${API_URL}/shops`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setShops(data.data);
        });
    }
  }, [isAdding]);

  const filteredTechs = technicians.filter(tech => 
    (tech.full_name || tech.username || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (tech.email || '').toLowerCase().includes(searchVal.toLowerCase()) ||
    (tech.mobile_number || '').includes(searchVal)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File) => void, previewSetter?: (s: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file);
      if (previewSetter) {
        previewSetter(URL.createObjectURL(file));
      }
    }
  };

  const handleSaveTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !mobileNumber || !password || !fullName) {
      alert("Please fill in required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('full_name', fullName);
      formData.append('email', email);
      formData.append('mobile_number', mobileNumber);
      formData.append('password', password);
      if (shopId) formData.append('shop_id', shopId);
      
      if (profileImage) formData.append('profileImage', profileImage);
      if (aadharImage) formData.append('aadharImage', aadharImage);
      if (licenseImage) formData.append('licenseImage', licenseImage);

      const response = await fetch(`${API_URL}/auth/register-technician`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setIsAdding(false);
        fetchTechnicians();
        // Reset form
        setUsername('');
        setFullName('');
        setEmail('');
        setMobileNumber('');
        setPassword('');
        setShopId('');
        setProfileImage(null);
        setAadharImage(null);
        setLicenseImage(null);
        setProfilePreview('');
      } else {
        alert(data.message || "Failed to register technician");
      }
    } catch (err) {
      console.error("Error registering technician:", err);
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-grow p-5 bg-[#f9f9fc] animate-fadeIn select-none pb-28">
      
      {!isAdding ? (
        <div className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Technicians</h2>
              <p className="text-xs text-slate-500 mt-1 font-bold">Field operations & staff management</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/admin/staff/map')}
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-[#004c4c] px-4 py-2.5 rounded-2xl text-xs font-black active:scale-95 transition-all shadow-sm"
              >
                <MapPin className="h-4 w-4" /> Map
              </button>
              <button 
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 bg-[#004c4c] text-white px-4 py-2.5 rounded-2xl text-xs font-black active:scale-95 transition-all shadow-lg shadow-teal-900/10"
              >
                <Plus className="h-4 w-4" /> Add Tech
              </button>
            </div>
          </header>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, mobile, or email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 transition-all shadow-xs"
            />
          </div>

          {loading && technicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-[#004c4c] animate-spin mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing directory...</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredTechs.map((tech) => (
                <div 
                  key={tech.id}
                  className="bg-white border w-full border-slate-100 rounded-xl p-3 flex items-center justify-between gap-3 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={tech.profile_image_url ? (tech.profile_image_url.startsWith('http') ? tech.profile_image_url : `${BASE_URL}${tech.profile_image_url}`) : "https://lh3.googleusercontent.com/aida-public/AB6AXuAH_TyaVDmy-a7Z_ZWN_ODDeFHAUPEgTfBdUBY5DGR12vtO43KQ5q9V213cv9qSifDL6K9GVDtH3qRpX3HZpJWqxP1wcLRRjjmciHZTCx7m88JnAp8exzurfQPAtDk50JEUB6VVYLRZF7L6XlTOY5DM-6X5KcKgQKpMsNQ70aWaKiFpq_Iw-Ffk8UpxLAIS6c-KcMtnfCtwN2RbKkTcMhUEWc3ydpQ0vYJXFJvz-j2hAwEyhJLsJ_Jq78GE4PneOLJPcWYLBwFLMCmH"}
                        alt={tech.full_name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-3xs"
                      />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${tech.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-[13.5px] truncate leading-tight">{tech.full_name || tech.username}</h3>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none shrink-0 ${
                          tech.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {tech.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5 text-slate-450 text-slate-400" /> <a href={`tel:${tech.mobile_number}`} className="underline">{tech.mobile_number}</a>
                        </span>
                        {tech.email && (
                          <span className="text-[10px] font-bold text-slate-455 text-slate-400 truncate hidden sm:inline-block max-w-[120px]">
                            • {tech.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-lg text-[10px] font-black">
                      <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                      <span>4.9</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-350" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <section className="grid grid-cols-2 gap-4 pb-8">
            <div className="bg-[#004c4c] p-5 rounded-3xl text-white flex flex-col gap-2 shadow-lg shadow-teal-900/10">
              <UserCheck className="h-6 w-6 text-teal-300" />
              <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest leading-none mt-1">
                Active Staff
              </p>
              <h4 className="text-2xl font-black">{technicians.filter(t => t.status === 'active').length} / {technicians.length}</h4>
            </div>

            <div className="bg-white p-5 rounded-3xl flex flex-col gap-2 shadow-sm border border-slate-100">
              <Award className="h-6 w-6 text-[#004c4c]" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">
                Avg Rating
              </p>
              <h4 className="text-2xl font-black text-slate-900">4.92</h4>
            </div>
          </section>
        </div>
      ) : (

        <div className="animate-fadeIn pb-10">
          <header className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => setIsAdding(false)}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[#004c4c]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Register Technician</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add new field expert</p>
            </div>
          </header>

          <form onSubmit={handleSaveTech} className="space-y-6">
            {/* Profile Photo */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center gap-4">
              <label className="relative group cursor-pointer active:scale-95 transition-transform">
                <div className="w-28 h-28 rounded-3xl bg-slate-50 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-[#004c4c] transition-colors">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <Camera className="h-10 w-10 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Upload Photo</span>
                    </div>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setProfileImage, setProfilePreview)} />
                <div className="absolute -bottom-2 -right-2 bg-[#004c4c] text-white p-2 rounded-xl shadow-lg border-2 border-white">
                  <Plus className="h-4 w-4" />
                </div>
              </label>
              <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
                Provide a professional portrait for technician identification.
              </p>
            </div>

            {/* Form Fields */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="marcus_chen"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password *</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Marcus Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                <input 
                  type="email" 
                  placeholder="m.chen@nanbenda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                <input 
                  type="tel" 
                  required
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Shop (Optional)</label>
                <select 
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]"
                >
                  <option value="">No Shop Assigned</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>{shop.shop_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Verification Documents</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1.5 cursor-pointer">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Aadhar Card</span>
                  <div className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${aadharImage ? 'bg-teal-50 border-[#004c4c]' : 'bg-slate-50 border-slate-200'}`}>
                    <Camera className={`h-6 w-6 ${aadharImage ? 'text-[#004c4c]' : 'text-slate-300'}`} />
                    <span className="text-[8px] font-black uppercase text-slate-400">{aadharImage ? 'Selected' : 'Upload'}</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setAadharImage)} />
                </label>

                <label className="space-y-1.5 cursor-pointer">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Driving License</span>
                  <div className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${licenseImage ? 'bg-teal-50 border-[#004c4c]' : 'bg-slate-50 border-slate-200'}`}>
                    <Camera className={`h-6 w-6 ${licenseImage ? 'text-[#004c4c]' : 'text-slate-300'}`} />
                    <span className="text-[8px] font-black uppercase text-slate-400">{licenseImage ? 'Selected' : 'Upload'}</span>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setLicenseImage)} />
                </label>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-[#004c4c] mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-[#004c4c]">Technician Role Default</h4>
                <p className="text-[10px] text-teal-800 font-medium leading-relaxed mt-1">
                  Access will be granted with the 'technician' role. They can accept repair requests and update their live location.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 h-14 bg-white border border-slate-200 rounded-3xl font-black text-xs text-slate-500 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="flex-[2] h-14 bg-[#004c4c] text-white rounded-3xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-teal-900/20"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Register Technician</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
