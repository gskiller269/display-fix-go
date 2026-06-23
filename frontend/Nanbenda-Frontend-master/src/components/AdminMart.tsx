import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, BASE_URL } from '../api/api';
import { 
  Plus, Search, ArrowLeft, Camera, Save, X, ChevronRight, Loader2, Trash2, Edit2, Monitor, Layout, Wrench, Smartphone, Laptop, Tv, Crop, Star
} from 'lucide-react';

interface AdminMartProps {
  token: string;
}

type ViewMode = 'hub' | 'banners' | 'config';

export default function AdminMart({ token }: AdminMartProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>('hub');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states for Banners
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [bannerPreview, setProfilePreview] = useState<string>('');

  // Crop option states
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panX, y: e.touches[0].clientY - panY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 1200;
      const targetHeight = 675; // 16:9 aspect ratio matching h-52 container aspect ratio
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      
      if (imgRatio > targetRatio) {
        drawWidth = targetHeight * imgRatio;
      } else {
        drawHeight = targetWidth / imgRatio;
      }
      
      let x = (targetWidth - drawWidth) / 2;
      let y = (targetHeight - drawHeight) / 2;
      
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const scaleMultiplier = targetWidth / rect.width;
        
        ctx.translate(targetWidth / 2 + panX * scaleMultiplier, targetHeight / 2 + panY * scaleMultiplier);
        ctx.scale(zoom, zoom);
        ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      } else {
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], (bannerImage?.name || 'cropped_banner.jpg'), { type: 'image/jpeg' });
          setBannerImage(croppedFile);
          setProfilePreview(URL.createObjectURL(croppedFile));
          setShowCropModal(false);
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = cropImageSrc;
  };

  // Form states for Device Config
  const [devType, setDevType] = useState('');
  const [devBrand, setDevBrand] = useState('');
  const [devModel, setDevModel] = useState('');
  const [devDamage, setDevDamage] = useState('');
  const [devPrice, setDevPrice] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = view === 'banners' ? '/api/banners/all' : '/api/devices/all';
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'hub') {
      fetchData();
    }
  }, [view]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', bannerTitle);
      formData.append('subtitle', bannerSubtitle);
      formData.append('link_url', bannerLink);
      if (bannerImage) formData.append('image', bannerImage);

      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `${API_URL}/banners/${editingItem.id}` : `${API_URL}/banners`;

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setIsAdding(false);
        setEditingItem(null);
        fetchData();
        resetBannerForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/devices`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: devType,
          brand: devBrand,
          model: devModel,
          damage_type: devDamage,
          repair_price: devPrice
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsAdding(false);
        fetchData();
        resetDeviceForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = view === 'banners' ? `/api/banners/${id}` : `/api/devices/${id}`;
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetBannerForm = () => {
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerLink('');
    setBannerImage(null);
    setProfilePreview('');
  };

  const resetDeviceForm = () => {
    setDevType('');
    setDevBrand('');
    setDevModel('');
    setDevDamage('');
    setDevPrice('');
  };

  const startEditBanner = (item: any) => {
    setEditingItem(item);
    setBannerTitle(item.title || '');
    setBannerSubtitle(item.subtitle || '');
    setBannerLink(item.link_url || '');
    setProfilePreview(item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`) : '');
    setIsAdding(true);
  };

  if (view === 'hub') {
    return (
      <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none">
        <header className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Mart Configuration</h2>
          <p className="text-sm text-slate-500 mt-1 font-bold">Manage store banners and repair pricing</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={() => setView('banners')}
            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#004c4c]/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#004c4c] group-hover:bg-[#004c4c] group-hover:text-white transition-all">
                <Layout className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-900">Promotional Banners</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Edit home screen sliders</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#004c4c] transition-all" />
          </button>

          <button 
            onClick={() => setView('config')}
            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#004c4c]/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Wrench className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-900">Repair Pricing</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">Configure devices & damages</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-amber-600 transition-all" />
          </button>

          <button 
            onClick={() => navigate('/admin/reviews')}
            className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-[#004c4c]/30 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Star className="h-7 w-7" />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-slate-900">Customer Reviews</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">View and moderate all reviews</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-300 group-hover:text-blue-600 transition-all" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow p-6 bg-[#f9f9fc] animate-fadeIn select-none pb-28">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setView('hub'); setIsAdding(false); setEditingItem(null); }}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[#004c4c]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-tight">
              {view === 'banners' ? 'Banner Management' : 'Repair Configuration'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mart Settings</p>
          </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black text-white shadow-lg transition-all active:scale-95 ${view === 'banners' ? 'bg-[#004c4c] shadow-teal-900/10' : 'bg-amber-600 shadow-amber-900/10'}`}
          >
            <Plus className="h-4 w-4" /> Add New
          </button>
        )}
      </header>

      {isAdding ? (
        <div className="animate-fadeIn max-w-lg mx-auto">
          {view === 'banners' ? (
            <form onSubmit={handleSaveBanner} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-4">
                <label className="relative group cursor-pointer active:scale-95 transition-transform w-full">
                  <div className="w-full h-40 aspect-video rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-[#004c4c] transition-colors">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <Camera className="h-10 w-10 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">Upload Banner Image</span>
                      </div>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
                {bannerPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setCropImageSrc(bannerPreview);
                      setZoom(1);
                      setPanX(0);
                      setPanY(0);
                      setShowCropModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-all active:scale-95 border border-slate-200"
                  >
                    <Crop className="h-4 w-4 text-[#004c4c]" />
                    Crop Banner Image
                  </button>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input type="text" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} required placeholder="e.g. Summer Sale" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle</label>
                  <input type="text" value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)} placeholder="e.g. 50% off on all repairs" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#004c4c]" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); resetBannerForm(); }} className="flex-1 h-14 bg-white border border-slate-200 rounded-3xl font-black text-xs text-slate-500 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] h-14 bg-[#004c4c] text-white rounded-3xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-teal-900/20">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> {editingItem ? 'Update' : 'Create'} Banner</>}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSaveDevice} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Device Type</label>
                  <select value={devType} onChange={e => setDevType(e.target.value)} required className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-600">
                    <option value="">Select Type</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Laptop">Laptop</option>
                    <option value="TV">TV</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Watch">Watch</option>
                    <option value="Audio">Audio</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                    <input type="text" value={devBrand} onChange={e => setDevBrand(e.target.value)} required placeholder="Apple" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-600" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Model</label>
                    <input type="text" value={devModel} onChange={e => setDevModel(e.target.value)} required placeholder="iPhone 15 Pro" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-600" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Damage Type</label>
                  <input type="text" value={devDamage} onChange={e => setDevDamage(e.target.value)} required placeholder="Cracked Screen" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repair Price (₹)</label>
                  <input type="number" value={devPrice} onChange={e => setDevPrice(e.target.value)} required placeholder="1499" className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-600" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsAdding(false); resetDeviceForm(); }} className="flex-1 h-14 bg-white border border-slate-200 rounded-3xl font-black text-xs text-slate-500 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={loading} className="flex-[2] h-14 bg-amber-600 text-white rounded-3xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-amber-900/20">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-5 w-5" /> Save Configuration</>}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-[#004c4c] animate-spin mb-4" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching items...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-4">
                  {view === 'banners' ? (
                    <div className="flex gap-4">
                      <img src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`) : ''} alt={item.title} className="w-24 aspect-video rounded-lg object-cover bg-slate-50" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-sm truncate">{item.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold truncate mt-1">{item.subtitle}</p>
                        <p className="text-[9px] text-teal-600 font-black mt-2 uppercase tracking-tighter truncate">{item.link_url}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => startEditBanner(item)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-teal-50 hover:text-[#004c4c] transition-all"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.type === 'Laptop' ? 'bg-blue-50 text-blue-600' : item.type === 'TV' ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-[#004c4c]'}`}>
                        {item.type === 'Laptop' ? <Laptop className="h-6 w-6" /> : item.type === 'TV' ? <Tv className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.type}</span>
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">₹{item.repair_price}</span>
                        </div>
                        <h3 className="font-black text-slate-800 text-sm mt-1">{item.brand} {item.model}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-1">{item.damage_type}</p>
                      </div>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-4" />
              <h3 className="text-sm font-black text-slate-800">No items found</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Start by adding your first {view === 'banners' ? 'banner' : 'device config'}.</p>
            </div>
          )}
        </div>
      )}

      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md p-6 border border-slate-100 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Crop Banner Image</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">Drag image to position, slide to zoom (16:9 banner ratio)</p>
            </div>

            <div 
              ref={containerRef}
              className="w-full aspect-video rounded-2xl bg-slate-900 relative overflow-hidden cursor-move touch-none border border-slate-200"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img 
                src={cropImageSrc} 
                alt="Crop preview" 
                draggable={false}
                crossOrigin="anonymous"
                className="w-full h-full object-cover select-none pointer-events-none"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <span>Zoom</span>
                <span className="text-[#004c4c]">{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.05" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))} 
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#004c4c]"
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowCropModal(false)} 
                className="flex-1 h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs text-slate-500 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={applyCrop} 
                className="flex-[2] h-12 bg-[#004c4c] hover:bg-teal-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-teal-900/20"
              >
                <Crop className="h-4 w-4" />
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
