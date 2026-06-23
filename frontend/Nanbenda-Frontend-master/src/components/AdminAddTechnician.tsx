import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, ShieldCheck, FileText, Image as ImageIcon } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';

interface AdminAddTechnicianProps {
  token: string;
}

export default function AdminAddTechnician({ token }: AdminAddTechnicianProps) {
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [shopId, setShopId] = useState('');
  const [shops, setShops] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [aadharImage, setAadharImage] = useState<File | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch(`${API_URL}/shops`);
        const data = await res.json();
        if (data.success) {
          setShops(data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setShopsLoading(false);
      }
    };
    fetchShops();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('mobile_number', mobileNumber);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('full_name', fullName);
    if (shopId) formData.append('shop_id', shopId);

    if (profileImage) formData.append('profileImage', profileImage);
    if (aadharImage) formData.append('aadharImage', aadharImage);
    if (licenseImage) formData.append('licenseImage', licenseImage);

    try {
      const res = await fetch(`${API_URL}/auth/register-technician`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Technician registered successfully!');
        // Reset form
        setUsername('');
        setMobileNumber('');
        setEmail('');
        setPassword('');
        setFullName('');
        setShopId('');
        setProfileImage(null);
        setAadharImage(null);
        setLicenseImage(null);
      } else {
        alert(data.message || 'Failed to register technician');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 bg-[#f9f9fc] min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. johndoe"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Mobile Number */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Mobile Number</label>
          <input
            type="tel"
            required
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john@example.com"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Shop Assignment */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Assign Shop</label>
          <select
            value={shopId}
            onChange={(e) => setShopId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          >
            <option value="">No Shop (Freelancer)</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>{s.shop_name}</option>
            ))}
          </select>
        </div>

        {/* Document/Photo Uploads */}
        <div className="grid grid-cols-1 gap-4 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#004c4c]" /> Verification Documents
          </h3>

          {/* Profile Photo */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
              <ImageIcon className="h-3.5 w-3.5" /> Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-slate-500 font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-[#004c4c] file:cursor-pointer"
            />
          </div>

          {/* Aadhar Image */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
              <FileText className="h-3.5 w-3.5" /> Aadhar Card Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAadharImage(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-slate-500 font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-[#004c4c] file:cursor-pointer"
            />
          </div>

          {/* License Image */}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer">
              <FileText className="h-3.5 w-3.5" /> Driving License Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLicenseImage(e.target.files ? e.target.files[0] : null)}
              className="text-xs text-slate-500 font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-[#004c4c] file:cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#004c4c] hover:bg-[#006666] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-4"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4" /> Register partner</>}
        </button>
      </form>
    </div>
  );
}
