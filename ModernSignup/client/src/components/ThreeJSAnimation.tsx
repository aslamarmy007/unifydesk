import { useEffect, useRef } from 'react';

interface ThreeJSAnimationProps {
  className?: string;
  type?: 'logo' | 'welcome';
}

export default function ThreeJSAnimation({ className = '', type = 'logo' }: ThreeJSAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const element = mountRef.current;
    
    if (type === 'logo') {
      element.innerHTML = `
        <div class="relative w-12 h-12 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg animate-glow group-hover:scale-110 transition-all duration-300">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl opacity-20 animate-pulse-custom"></div>
          <div class="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
          <svg class="w-7 h-7 text-white relative z-10 drop-shadow-sm" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <!-- Modern unified workspace icon -->
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor" stroke="none" opacity="0.3"/>
            <circle cx="8" cy="7" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="8" cy="17" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" stroke="currentColor" fill="none"/>
            <path d="M8.5 7h7.5M8.5 12h7.5M8.5 17h7.5" stroke="currentColor" stroke-width="1.2"/>
          </svg>
          <div class="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl opacity-20 blur-sm"></div>
        </div>
      `;
    } else {
      element.innerHTML = `
        <div class="relative w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl flex items-center justify-center shadow-2xl animate-float">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl opacity-30 animate-pulse-custom"></div>
          <div class="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm"></div>
          <svg class="w-12 h-12 text-white relative z-10 drop-shadow-lg" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <!-- Welcome workspace icon with connecting elements -->
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" fill="currentColor" stroke="none" opacity="0.25"/>
            <circle cx="7" cy="7" r="2" fill="currentColor" stroke="none"/>
            <circle cx="17" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none"/>
            <path d="M3 5v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2z" stroke="currentColor" fill="none" stroke-width="1.8"/>
            <path d="M9 7h6M9 12h6M9 17h6" stroke="currentColor" stroke-width="1.3"/>
            <path d="M9 7l6 5M15 12l-6 5" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>
          </svg>
          <div class="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl opacity-30 blur-lg animate-pulse-custom"></div>
        </div>
      `;
    }

    return () => {
      if (element) {
        element.innerHTML = '';
      }
    };
  }, [type]);

  return <div ref={mountRef} className={className} />;
}
