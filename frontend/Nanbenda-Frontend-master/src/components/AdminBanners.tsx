import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Plus, Trash2, Megaphone } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';

interface AdminBannersProps {
  token: string;
}

export default function AdminBanners({ token }: AdminBannersProps) {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${API_URL}/banners/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBanners(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImage) {
      alert('Please select an image file');
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('link_url', linkUrl);
    formData.append('image', bannerImage);

    try {
      const res = await fetch(`${API_URL}/banners`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Banner uploaded successfully!');
        setTitle('');
        setLinkUrl('');
        setBannerImage(null);
        fetchBanners();
      } else {
        alert(data.message || 'Failed to upload banner');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while uploading banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (bannerId: number) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const res = await fetch(`${API_URL}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setBanners(prev => prev.filter(b => b.id !== bannerId));
      } else {
        alert(data.message || 'Failed to delete banner');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting banner');
    }
  };

  return (
    <div className="p-5 bg-[#f9f9fc] min-h-screen space-y-6">
      {/* Add Banner Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-xs font-black text-[#004c4c] uppercase tracking-wider flex items-center gap-1.5">
          <Megaphone className="h-4 w-4" /> Add New Banner
        </h3>

        {/* Title */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Banner Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Super Sale!"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          />
        </div>

        {/* Redirect Destination Dropdown */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Redirect Destination</label>
          <select
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
          >
            <option value="">No Redirect</option>
            <option value="/customer/home">Home</option>
            <option value="/customer/book">Book Repair</option>
            <option value="/customer/support">Support</option>
            <option value="/customer/repairs">Repairs</option>
            <option value="/customer/account">Account</option>
            <option value="/customer/profile">Profile</option>
            <option value="/customer/addresses">Addresses</option>
            <option value="/customer/notifications">Notifications</option>
          </select>
        </div>

        {/* Banner File */}
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Banner Image</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setBannerImage(e.target.files ? e.target.files[0] : null)}
            className="text-xs text-slate-500 font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-[#004c4c] file:cursor-pointer"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-[#004c4c] hover:bg-[#006666] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Upload Ad Banner</>}
        </button>
      </form>

      {/* Existing Banners list */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider px-1">Active Banners</h3>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-400">No promotional banners active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4 relative overflow-hidden group">
                <img 
                  src={b.image_url ? (b.image_url.startsWith('http') ? b.image_url : `${BASE_URL}${b.image_url}`) : ''} 
                  alt={b.title} 
                  className="w-24 aspect-[2/1] rounded-xl object-cover bg-slate-50"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 leading-tight">{b.title || 'Untitled Banner'}</h4>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tighter mt-1">{b.link_url || 'No redirect link'}</p>
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors active:scale-90"
                  title="Delete Banner"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
