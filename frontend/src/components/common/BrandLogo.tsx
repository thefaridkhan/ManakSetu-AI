import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  hideSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'light',
  hideSubtitle = false
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const isDark = variant === 'dark';

  return (
    <div className="flex items-center space-x-3 select-none group">
      {/* Modern High-Tech Indian Standards Emblem */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center flex-shrink-0`}>
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-500/30 via-blue-600/30 to-indigo-600/30 blur-[6px] group-hover:blur-[8px] transition-all" />
        
        {/* Shield Container */}
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-[#0B2545] via-[#133E7C] to-[#0A192F] p-[1.5px] shadow-md transition-transform group-hover:scale-105">
          <div className="w-full h-full rounded-[10px] bg-[#0A1E38] flex items-center justify-center overflow-hidden">
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full p-1.5"
            >
              {/* Outer Hexagon/Shield contour */}
              <path
                d="M20 4L34 11V22C34 29.5 28 35.5 20 38C12 35.5 6 29.5 6 22V11L20 4Z"
                fill="url(#shield_gradient)"
                stroke="url(#shield_stroke)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              
              {/* Internal Indian Standard Precision Diamond/Structure */}
              <path
                d="M20 10L27 17L20 24L13 17L20 10Z"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(245, 158, 11, 0.15)"
              />

              {/* AI Nexus Center Core */}
              <circle cx="20" cy="17" r="2.5" fill="#38BDF8" />
              <path
                d="M20 24V31M13 17H8M27 17H32"
                stroke="#38BDF8"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Gradient Definitions */}
              <defs>
                <linearGradient id="shield_gradient" x1="6" y1="4" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#0E3360" />
                  <stop offset="1" stopColor="#06182E" />
                </linearGradient>
                <linearGradient id="shield_stroke" x1="6" y1="4" x2="34" y2="38" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="0.5" stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2 leading-none">
          <span className={`font-black tracking-tight ${titleSizes[size]} ${isDark ? 'text-white' : 'text-[#0B2545]'}`}>
            Manak<span className="text-blue-600">Setu</span>
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-sm">
            AI
          </span>
        </div>
        {!hideSubtitle && (
          <p className={`text-[10px] font-medium tracking-wide mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Bureau of Indian Standards Intelligence
          </p>
        )}
      </div>
    </div>
  );
};
