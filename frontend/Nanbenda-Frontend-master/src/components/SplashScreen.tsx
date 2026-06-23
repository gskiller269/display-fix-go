import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen splash-bg flex flex-col items-center justify-center overflow-hidden max-w-md mx-auto relative select-none splash-container">
      {/* Subtle bottom-right sparkle from the video */}
      <svg viewBox="0 0 24 24" className="bg-sparkle" fill="currentColor">
        <path d="M 12 2 Q 12 12 22 12 Q 12 12 12 22 Q 12 12 2 12 Q 12 12 12 2 Z" />
      </svg>

      {/* Main Logo Container */}
      <div className="logo-container">
        {/* Glow effect behind the phone */}
        <div className="glow-effect"></div>

        {/* SVG Icon on the left */}
        <div className="icon-wrapper">
          <svg viewBox="-10 -15 140 140" className="w-[115px] h-[115px]">
            <defs>
              <mask id="phone-mask">
                {/* Rect covering the entire viewBox */}
                <rect x="-20" y="-30" width="180" height="180" fill="white" />
                {/* Black checkmark to punch a hole in the phone border */}
                <path 
                  d="M 10 55 L 45 90 L 95 25" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="20" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="checkmark-path"
                />
              </mask>
            </defs>

            {/* Phone Outline (Masked) */}
            <path 
              d="M 30 10 h 40 a 12 12 0 0 1 12 12 v 76 a 12 12 0 0 1 -12 12 h -40 a 12 12 0 0 1 -12 -12 v -76 a 12 12 0 0 1 12 -12 z" 
              fill="none" 
              stroke="#0062a8" 
              strokeWidth="8" 
              mask="url(#phone-mask)"
              className="phone-path"
            />

            {/* Camera dot */}
            <circle cx="50" cy="20" r="3" fill="#0062a8" className="phone-camera" />

            {/* Blue Checkmark (Drawn on top) */}
            <path 
              d="M 10 55 L 45 90 L 95 25" 
              fill="none" 
              stroke="#0062a8" 
              strokeWidth="10" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="checkmark-path"
            />

            {/* Sparkles */}
            {/* Main Sparkle */}
            <path 
              d="M 105 3 Q 105 15 117 15 Q 105 15 105 27 Q 105 15 93 15 Q 105 15 105 3 Z" 
              className="sparkle sparkle-main" 
            />
            
            {/* Top Sparkle */}
            <path 
              d="M 98 -6 Q 98 0 104 0 Q 98 0 98 6 Q 98 0 92 0 Q 98 0 98 -6 Z" 
              className="sparkle sparkle-top" 
            />

            {/* Bottom Sparkle */}
            <path 
              d="M 112 23 Q 112 28 117 28 Q 112 28 112 33 Q 112 28 107 28 Q 112 28 112 23 Z" 
              className="sparkle sparkle-bottom" 
            />
          </svg>
        </div>

        {/* Text Container on the right */}
        <div className="text-container">
          <div className="brand-text-display">DISPLAY</div>
          <div className="brand-text-row">
            <span className="brand-text-fix">FIX</span>
            <span className="brand-text-go">GO</span>
          </div>
        </div>
      </div>

      <style>{`
        /* Background texture & colors */
        .splash-bg {
          background: radial-gradient(circle at center, #fbfbfa 0%, #eeece6 60%, #dedcd5 100%);
          position: relative;
          overflow: hidden;
        }

        /* Seamless noise texture overlay */
        .splash-bg::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.045;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }

        /* Subtle bottom-right sparkle from the video */
        .bg-sparkle {
          position: absolute;
          bottom: 10%;
          right: 10%;
          width: 36px;
          height: 36px;
          opacity: 0.08;
          color: #0062a8;
          animation: pulse-slow 5s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.12; transform: scale(1.15) rotate(15deg); }
        }

        /* Centered Flex Container */
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 340px;
          height: 140px;
        }

        /* Icon wrapper shifts to left from center */
        .icon-wrapper {
          animation: icon-slide 4.0s cubic-bezier(0.25, 1, 0.3, 1) forwards;
          will-change: transform;
        }

        @keyframes icon-slide {
          0%, 42% {
            transform: translateX(93px); /* Centered initially */
          }
          58%, 100% {
            transform: translateX(0px); /* Slides left to make room */
          }
        }

        /* Glow effect behind the phone, synced with checkmark draw */
        .glow-effect {
          position: absolute;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(14, 165, 233, 0) 70%);
          filter: blur(10px);
          top: 50%;
          left: 50px;
          transform: translate(-50%, -50%) scale(0.6);
          opacity: 0;
          pointer-events: none;
          animation: glow-pulse 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.8s;
        }

        @keyframes glow-pulse {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          40% { opacity: 0.75; transform: translate(-50%, -50%) scale(1.4); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
        }

        /* Phone contour drawing */
        .phone-path {
          stroke-dasharray: 320;
          stroke-dashoffset: 320;
          animation: draw-phone 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.1s;
        }

        @keyframes draw-phone {
          0% { stroke-dashoffset: 320; }
          100% { stroke-dashoffset: 0; }
        }

        /* Phone Camera notch pop in */
        .phone-camera {
          opacity: 0;
          transform: scale(0);
          transform-origin: 50px 20px;
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.8s;
        }

        /* Checkmark path drawing */
        .checkmark-path {
          stroke-dasharray: 140;
          stroke-dashoffset: 140;
          animation: draw-checkmark 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: 0.9s;
        }

        @keyframes draw-checkmark {
          0% { stroke-dashoffset: 140; }
          100% { stroke-dashoffset: 0; }
        }

        /* Sparkles pop-in animations */
        .sparkle {
          transform: scale(0);
          fill: #0062a8;
        }

        .sparkle-main {
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, sparkle-float-1 3.5s ease-in-out infinite;
          animation-delay: 1.7s;
          transform-origin: 105px 15px;
        }

        .sparkle-top {
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, sparkle-float-2 4s ease-in-out infinite;
          animation-delay: 2.0s;
          transform-origin: 98px 0px;
        }

        .sparkle-bottom {
          animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, sparkle-float-3 3.2s ease-in-out infinite;
          animation-delay: 2.2s;
          transform-origin: 112px 28px;
        }

        @keyframes pop-in {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }

        @keyframes sparkle-float-1 {
          0%, 100% { transform: scale(1) translate(0, 0); filter: drop-shadow(0 0 1px rgba(0, 98, 168, 0.3)); }
          50% { transform: scale(1.15) translate(0.5px, -0.5px); filter: drop-shadow(0 0 4px rgba(0, 98, 168, 0.6)); }
        }

        @keyframes sparkle-float-2 {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(0.85) translate(-0.5px, 0.5px); }
        }

        @keyframes sparkle-float-3 {
          0%, 100% { transform: scale(0.9) translate(0, 0); }
          50% { transform: scale(1.1) translate(0.5px, 0.5px); }
        }

        /* Text container animation */
        .text-container {
          display: flex;
          flex-direction: column;
          margin-left: 12px;
          opacity: 0;
          transform: translateX(12px);
          animation: fade-slide-in 0.8s cubic-bezier(0.25, 1, 0.3, 1) forwards;
          animation-delay: 1.8s;
        }

        @keyframes fade-slide-in {
          0% {
            opacity: 0;
            transform: translateX(12px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Slanted, bold uppercase logo text styling */
        .brand-text-display, .brand-text-fix {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          color: #0062a8;
          letter-spacing: -0.04em;
          transform: skewX(-12deg);
          line-height: 0.85;
        }

        .brand-text-display {
          font-size: 36px;
          margin-bottom: 2px;
        }

        .brand-text-row {
          display: flex;
          align-items: baseline;
        }

        .brand-text-fix {
          font-size: 36px;
        }

        /* Lighter blue GO zooming in with blur effect from the video */
        .brand-text-go {
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          font-weight: 800;
          text-transform: uppercase;
          color: #0ea5e9;
          letter-spacing: -0.04em;
          line-height: 0.85;
          font-size: 36px;
          margin-left: 6px;
          opacity: 0;
          transform: skewX(-12deg) scale(1.4);
          filter: blur(4px);
          animation: go-settle 0.6s cubic-bezier(0.25, 1, 0.3, 1) forwards;
          animation-delay: 2.3s;
          will-change: transform, filter, opacity;
        }

        @keyframes go-settle {
          0% {
            opacity: 0;
            transform: skewX(-12deg) scale(1.4);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: skewX(-12deg) scale(1);
            filter: blur(0);
          }
        }

        /* Whole splash container fade out */
        .splash-container {
          animation: splash-fade-out 0.4s cubic-bezier(0.25, 1, 0.3, 1) forwards;
          animation-delay: 3.6s;
          opacity: 1;
        }

        @keyframes splash-fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
