import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, Star, Search, ArrowLeft, Filter, Smartphone, MessageSquare, Wrench, Package } from 'lucide-react';
import { API_URL, BASE_URL } from '../api/api';

interface AdminReviewsProps {
  token: string;
}

export default function AdminReviews({ token }: AdminReviewsProps) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchVal, setSearchVal] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (searchVal) queryParams.append('search', searchVal);
      if (ratingFilter) queryParams.append('rating', ratingFilter);
      if (typeFilter) queryParams.append('type', typeFilter);

      const res = await fetch(`${API_URL}/reviews?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews();
    }, 400); // debounce API call slightly for search inputs
    return () => clearTimeout(timer);
  }, [searchVal, ratingFilter, typeFilter, token]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => prev.filter(r => r.id !== id));
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the review');
    }
  };

  return (
    <div className="p-5 bg-[#f9f9fc] min-h-screen space-y-6 pb-28 select-none">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/mart')}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-[#004c4c]"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">Reviews Moderation</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mart Dashboard</p>
        </div>
      </header>

      {/* Search & Filters */}
      <section className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search username or review text..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#004c4c] transition-all"
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#004c4c] transition-colors"
            >
              <option value="">All Types</option>
              <option value="repair">Repairs</option>
              <option value="product">Products</option>
            </select>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="space-y-3.5">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Customer Feedback</h3>
          <span className="text-[10px] font-bold text-slate-400">{reviews.length} reviews</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#004c4c] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-slate-200">
            <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">No reviews found</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reviews.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
                {/* Header: User Profile & Rating */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {item.profile_image_url ? (
                      <img 
                        src={item.profile_image_url.startsWith('http') ? item.profile_image_url : `${BASE_URL}${item.profile_image_url}`} 
                        alt={item.username} 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004c4c] to-teal-600 flex items-center justify-center text-white text-xs font-black">
                        {(item.username || 'CU').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{item.username || 'Customer'}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < (item.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-transparent'}`} 
                        />
                      ))}
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                      item.repair_id 
                        ? 'bg-purple-50 text-purple-600 border border-purple-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {item.repair_id ? 'Doorstep Repair' : 'Product Purchase'}
                    </span>
                  </div>
                </div>

                {/* Body Comment */}
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic bg-slate-50/50 p-3.5 rounded-2xl border border-slate-50">
                  "{item.comment || 'No review comment provided.'}"
                </p>

                {/* Sub-info: Repair details or Technician */}
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    {item.repair_id ? (
                      <>
                        <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{item.device_brand} {item.device_model}</span>
                      </>
                    ) : (
                      <>
                        <Package className="h-3.5 w-3.5 text-slate-400" />
                        <span>Product Review</span>
                      </>
                    )}
                  </div>

                  {item.technician_name && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded text-amber-700 text-[9px] font-black uppercase">
                      <Wrench className="w-3 h-3" />
                      <span>Tech: {item.technician_name}</span>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
