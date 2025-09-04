import React, { useState, useEffect } from 'react';

export function SimpleVideoBackground() {
  const [videoError, setVideoError] = useState(false);
  const [fallbackStars, setFallbackStars] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number; animationDelay: number }>>([]);

  useEffect(() => {
    // Generate stars for fallback
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 4
        });
      }
      setFallbackStars(newStars);
    };

    generateStars();
  }, []);

  const handleVideoError = () => {
    console.log('Video failed to load, using fallback background');
    setVideoError(true);
  };

  if (videoError) {
    // Fallback animated background when video fails
    return (
      <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
        {/* Base deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-800" />
        
        {/* Black hole simulation with CSS */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Event horizon - the black center */}
            <div className="w-32 h-32 bg-black rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10" />
            
            {/* Accretion disk - glowing ring around black hole */}
            <div 
              className="w-80 h-80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
              style={{
                background: 'conic-gradient(from 0deg, #ff6b35, #f7931e, #ffcd3c, #ff6b35)',
                borderRadius: '50%',
                animation: 'spin 20s linear infinite',
                filter: 'blur(2px)'
              }}
            />
            
            {/* Inner accretion disk */}
            <div 
              className="w-60 h-60 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
              style={{
                background: 'conic-gradient(from 180deg, #ff3030, #ff6b35, #ffcd3c, #ff3030)',
                borderRadius: '50%',
                animation: 'spin 15s linear infinite reverse',
                filter: 'blur(1px)'
              }}
            />
            
            {/* Gravitational lensing effect */}
            <div className="w-96 h-96 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-400/20 animate-pulse" />
            <div className="w-[500px] h-[500px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-600/10 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Animated starfield */}
        <div className="absolute inset-0">
          {fallbackStars.map((star) => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.animationDelay}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/60 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onError={handleVideoError}
        onLoadedData={() => setVideoError(false)}
      >
        {/* Primary video source - your custom video */}
        <source src="/video_1423e4e3_1756715284703.mp4" type="video/mp4" />
        <source src="/blackhole-video.mp4" type="video/mp4" />
        <source src="/blackhole-video.webm" type="video/webm" />
        <source src="/space-background.mp4" type="video/mp4" />
        <source src="https://cdn.pixabay.com/video/2021/08/10/84537-590368299_large.mp4" type="video/mp4" />
        
        {/* Fallback text for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60 pointer-events-none" />
      
      {/* Additional cosmic overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-slate-900/30 pointer-events-none" />
    </div>
  );
}
