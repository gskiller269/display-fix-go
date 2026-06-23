import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Gift, X } from 'lucide-react';

interface RewardWheelModalProps {
  onClose: () => void;
  onRewardClaimed: (reward: string) => void;
}

const PRIZES = [
  { top: 'GLASS', bottom: '₹69', color: '#10b981' },          // Green
  { top: 'POWER BANK', bottom: '₹499', color: '#0ea5e9' },    // Blue
  { top: 'PROTECTOR', bottom: '₹19', color: '#3b82f6' },      // Royal
  { top: 'HEADPHONE', bottom: '₹199', color: '#7c3aed' },     // Purple
  { top: 'AIRPODS', bottom: '₹249', color: '#db2777' },       // Magenta
  { top: 'CASHBACK', bottom: '₹29', color: '#f97316' }        // Orange
];

export default function RewardWheelModal({ onClose, onRewardClaimed }: RewardWheelModalProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wonPrize, setWonPrize] = useState('');
  const [claimed, setClaimed] = useState(false);
  const [closingAnimation, setClosingAnimation] = useState(false);

  const handleClaim = () => {
    setClaimed(true);
    setTimeout(() => {
      setClosingAnimation(true);
      setTimeout(() => {
        onRewardClaimed(wonPrize);
      }, 2000);
    }, 1500);
  };

  const handleReject = () => {
    setClosingAnimation(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const spinWheel = () => {
    if (spinning || finished) return;
    setSpinning(true);
    
    const extraSpins = 6;
    const baseDegrees = extraSpins * 360;
    
    // Pick a winning index (favoring smaller discounts or checkups)
    const winnableIndexes = [0, 2, 3, 4, 5]; 
    const winningIndex = winnableIndexes[Math.floor(Math.random() * winnableIndexes.length)];
    
    const segmentAngle = 360 / PRIZES.length;
    const sliceCenter = (winningIndex * segmentAngle) + (segmentAngle / 2);
    const targetDegree = baseDegrees + (360 - sliceCenter);

    setRotation(targetDegree);

    setTimeout(() => {
      setSpinning(false);
      setFinished(true);
      setWonPrize(`${PRIZES[winningIndex].top} ${PRIZES[winningIndex].bottom}`);
    }, 4000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-[#130b2b] flex flex-col items-center justify-center overflow-hidden animate-fadeIn font-sans">
      
      {/* Static Confetti Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
          const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-emerald-400', 'bg-pink-400'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.random() * 4 + 4; // 4 to 8px
          return (
            <div 
              key={i} 
              className={`absolute rounded-sm ${color} opacity-60`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          );
        })}
      </div>



      {/* Main Wheel Area */}
      <div className={`relative z-10 flex flex-col items-center w-full max-w-lg px-4 transition-all duration-700 ${finished ? 'opacity-0 scale-50 pointer-events-none absolute' : 'opacity-100 scale-100'}`}>
        
        {/* Glow effect under Gift icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-purple-500 rounded-full blur-xl opacity-40"></div>
          <div className="w-16 h-16 bg-[#2a1b54] rounded-full flex items-center justify-center text-yellow-400 shadow-[0_0_30px_rgba(139,92,246,0.3)] border border-purple-500/30 relative z-10">
            <Gift className="h-8 w-8" />
          </div>
        </div>
        
        <h2 className="text-[32px] sm:text-4xl font-black text-white mb-2 text-center tracking-tight leading-[1.15]">
          Spin & Win <br /> Exciting Prizes!
        </h2>
        <p className="text-[13px] sm:text-[15px] font-medium text-purple-200/80 mb-10 text-center px-4 leading-relaxed max-w-[320px]">
          Thank you for choosing us.<br />Spin the wheel & win exclusive rewards.
        </p>

        {/* The Wheel */}
        <div className="relative w-[85vw] max-w-[340px] aspect-square mb-12 select-none">
          {/* Pointer */}
          <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            <div className="bg-[#130b2b] p-1 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l8 12 8-12" />
              </svg>
            </div>
          </div>

          {/* Wheel Container */}
          <div 
            className="w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-[0_0_40px_rgba(0,0,0,0.5)] relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? '4s' : '0s',
              transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.15, 1)'
            }}
          >
            <div className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full rounded-full">
                {PRIZES.map((prize, i) => {
                  const angle = 360 / PRIZES.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;
                  
                  const startX = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const startY = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const endX = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const endY = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  
                  const d = `M 50 50 L ${startX} ${startY} A 50 50 0 0 1 ${endX} ${endY} Z`;
                  return <path key={i} d={d} fill={prize.color} />;
                })}
              </svg>
            </div>

            {/* Labels overlay */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {PRIZES.map((prize, i) => {
                const angle = (i * 60) + 30; // Center of slice
                const angleRad = angle * (Math.PI / 180);
                const radius = 28; // Distance from center (%)
                const left = 50 + radius * Math.sin(angleRad);
                const top = 50 - radius * Math.cos(angleRad);
                
                return (
                  <div
                    key={i}
                    className="absolute flex flex-col items-center justify-center text-center"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '32%'
                    }}
                  >
                    <span className="text-white text-[13px] sm:text-[15px] font-bold drop-shadow-md leading-tight">
                      {prize.top} <br/>
                      {prize.bottom}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85px] h-[85px] bg-white rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center">
              <span className="text-[#130b2b] text-[20px] font-black tracking-wide">SPIN</span>
            </div>
          </div>
        </div>

        <button
          onClick={spinWheel}
          disabled={spinning}
          className={`w-full max-w-[320px] py-4 font-black rounded-[14px] transition-all uppercase tracking-wide text-[16px] ${
            spinning ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-[#ffc107] text-[#130b2b] active:scale-95 hover:bg-[#ffb300]'
          }`}
        >
          {spinning ? 'Spinning...' : 'SPIN THE WHEEL!'}
        </button>
      </div>

      {/* Full-Screen Victory Animation Overlay */}
      <div 
        className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#130b2b] p-6 transition-all duration-700 ${
          finished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        {/* Animated Falling Confetti */}
        {finished && !claimed && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => {
              const colors = ['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-purple-400', 'bg-white'];
              const color = colors[Math.floor(Math.random() * colors.length)];
              const left = Math.random() * 100;
              const delay = Math.random() * 2;
              const duration = 2 + Math.random() * 3;
              return (
                <div 
                  key={i} 
                  className={`absolute top-[-20px] w-3 h-6 rounded-sm ${color} opacity-80`}
                  style={{
                    left: `${left}%`,
                    animation: `fall ${duration}s linear ${delay}s infinite`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              );
            })}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
          {claimed ? (
            <div className="flex flex-col items-center justify-center animate-scaleIn duration-500">
               <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_0_20px_rgba(16,185,129,0.2)]">
                 <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: 'drawCheck 0.5s ease-out 0.2s forwards' }}>
                   <path d="M20 6L9 17l-5-5"></path>
                 </svg>
               </div>
               <h1 className="text-white text-3xl font-black mb-2 drop-shadow-lg animate-slideUp">Reward Claimed!</h1>
               <p className="text-purple-200 font-bold mb-8 animate-slideUp" style={{animationDelay: '0.1s'}}>Added to your booking bill.</p>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-[#2a1b54] border border-purple-500/50 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                <Gift className="h-12 w-12 text-yellow-400" />
              </div>
              
              <h1 className="text-white text-5xl font-black mb-4 tracking-tight drop-shadow-lg">
                YOU WON!
              </h1>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 mb-12 w-full shadow-2xl">
                <h2 className="text-yellow-400 text-4xl sm:text-5xl font-black uppercase tracking-tight drop-shadow-xl leading-tight">
                  {wonPrize}
                </h2>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleClaim}
                  className="w-full py-5 bg-[#ffc107] text-[#130b2b] font-black rounded-2xl active:scale-95 transition-all shadow-xl hover:bg-[#ffb300] uppercase tracking-widest text-lg"
                >
                  Claim My Reward
                </button>
                <button
                  onClick={handleReject}
                  className="w-full py-4 bg-transparent border-2 border-white/20 text-white/70 font-bold rounded-2xl active:scale-95 transition-all hover:bg-white/5 hover:text-white uppercase tracking-widest text-sm"
                >
                  Reject Reward
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Confirming Service Animation Overlay */}
      {closingAnimation && (
        <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-[#130b2b]/95 backdrop-blur-md animate-fadeIn">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-white text-2xl font-black drop-shadow-md tracking-wide">Confirming your service...</h2>
          <p className="text-purple-200 mt-2 font-medium">Please wait a moment</p>
        </div>
      )}
      
      {/* Fall Animation Keyframes */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>,
    document.body
  );
}
