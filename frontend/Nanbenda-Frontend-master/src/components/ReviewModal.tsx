import React, { useState } from 'react';
import { Star, X, Loader2, Send } from 'lucide-react';
import { API_URL } from '../api/api';

interface ReviewModalProps {
  token: string;
  repairId: number | string;
  technicianId: number | string | null;
  deviceName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ token, repairId, technicianId, deviceName, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          repair_id: repairId,
          technician_id: technicianId || null,
          rating,
          comment
        })
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-[32px] w-full max-w-md p-6 border border-slate-100 shadow-2xl space-y-6 animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Share Your Experience</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">Rate your repair for {deviceName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors active:scale-90"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-bold p-3.5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Picker */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform active:scale-90 focus:outline-none"
                >
                  <Star 
                    className={`h-9 w-9 transition-colors ${
                      star <= (hoverRating ?? rating) 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-slate-200 fill-transparent'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black text-amber-600 bg-amber-50/80 px-2.5 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
            </span>
          </div>

          {/* Comment Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Write your review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the service?"
              rows={4}
              maxLength={500}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#004c4c]/40 focus:border-[#004c4c] transition-all resize-none shadow-xs"
            />
          </div>

          {/* Submit Action */}
          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 h-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl font-black text-xs text-slate-500 active:scale-95 transition-all"
            >
              Skip
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] h-12 bg-[#004c4c] hover:bg-teal-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-teal-900/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
