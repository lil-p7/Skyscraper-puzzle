export default function CityAnimation() {
    return (
      <div className="relative w-full max-w-sm h-32 overflow-hidden">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-gray-950 via-gray-900 to-gray-800 rounded-xl" />
  
        {/* Stars */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width:  i % 3 === 0 ? "2px" : "1px",
              height: i % 3 === 0 ? "2px" : "1px",
              top:    `${8 + (i * 17) % 35}%`,
              left:   `${(i * 23 + 7) % 90}%`,
              animationDelay:    `${(i * 0.4) % 2}s`,
              animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              opacity: 0.6,
            }}
          />
        ))}
  
        {/* Moon */}
        <div className="absolute top-3 right-6 w-6 h-6 rounded-full bg-yellow-100/80 shadow-[0_0_8px_2px_rgba(254,249,195,0.4)]" />
  
        {/* Buildings */}
        <svg
          className="absolute bottom-0 w-full"
          viewBox="0 0 400 80"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Back buildings */}
          <rect x="0"   y="50" width="40" height="30" fill="#1f2937" />
          <rect x="10"  y="38" width="20" height="12" fill="#1f2937" />
          <rect x="45"  y="30" width="30" height="50" fill="#1f2937" />
          <rect x="55"  y="22" width="10" height="8"  fill="#1f2937" />
          <rect x="80"  y="45" width="25" height="35" fill="#1f2937" />
          <rect x="110" y="25" width="35" height="55" fill="#1f2937" />
          <rect x="120" y="15" width="15" height="10" fill="#1f2937" />
          <rect x="150" y="40" width="20" height="40" fill="#1f2937" />
          <rect x="175" y="20" width="40" height="60" fill="#1f2937" />
          <rect x="185" y="10" width="20" height="10" fill="#1f2937" />
          <rect x="220" y="35" width="30" height="45" fill="#1f2937" />
          <rect x="255" y="28" width="25" height="52" fill="#1f2937" />
          <rect x="285" y="42" width="20" height="38" fill="#1f2937" />
          <rect x="310" y="18" width="45" height="62" fill="#1f2937" />
          <rect x="322" y="8"  width="20" height="10" fill="#1f2937" />
          <rect x="360" y="38" width="25" height="42" fill="#1f2937" />
          <rect x="390" y="48" width="15" height="32" fill="#1f2937" />
  
          {/* Front buildings */}
          <rect x="0"   y="58" width="30" height="22" fill="#374151" />
          <rect x="35"  y="48" width="22" height="32" fill="#374151" />
          <rect x="62"  y="38" width="18" height="42" fill="#374151" />
          <rect x="85"  y="52" width="28" height="28" fill="#374151" />
          <rect x="118" y="42" width="20" height="38" fill="#374151" />
          <rect x="143" y="30" width="30" height="50" fill="#374151" />
          <rect x="178" y="50" width="22" height="30" fill="#374151" />
          <rect x="205" y="35" width="25" height="45" fill="#374151" />
          <rect x="235" y="45" width="18" height="35" fill="#374151" />
          <rect x="258" y="28" width="32" height="52" fill="#374151" />
          <rect x="295" y="50" width="20" height="30" fill="#374151" />
          <rect x="320" y="38" width="28" height="42" fill="#374151" />
          <rect x="353" y="52" width="22" height="28" fill="#374151" />
          <rect x="380" y="44" width="20" height="36" fill="#374151" />
  
          {/* Windows */}
          {[
            [52,33],[57,33],[52,40],[57,40],
            [113,28],[118,28],[113,35],[118,35],[123,28],
            [178,14],[183,14],[188,14],[178,22],[183,22],
            [313,22],[318,22],[323,22],[313,30],[323,30],
            [148,33],[153,33],[148,40],[153,40],
            [208,38],[213,38],[208,45],
            [261,32],[266,32],[271,32],[261,40],[271,40],
          ].map(([x, y], i) => (
            <rect
              key={i}
              x={x} y={y}
              width="4" height="4"
              fill={i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#93c5fd" : "#6ee7b7"}
              opacity={0.7 + (i % 3) * 0.1}
            />
          ))}
        </svg>
  
        {/* Plane */}
        <div
          className="absolute"
          style={{ top: "18%", animation: "fly-plane 8s linear infinite" }}
        >
          <svg width="36" height="16" viewBox="0 0 36 16" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="18" cy="8" rx="14" ry="4" fill="#e2e8f0" />
            <ellipse cx="30" cy="8" rx="5" ry="2.5" fill="#cbd5e1" />
            <polygon points="4,8 0,2 8,8" fill="#cbd5e1" />
            <polygon points="14,8 20,8 22,2 12,2" fill="#e2e8f0" />
            <circle cx="22" cy="7" r="1.5" fill="#93c5fd" opacity="0.9" />
            <circle cx="26" cy="7" r="1.5" fill="#93c5fd" opacity="0.9" />
            <rect x="15" y="9" width="6" height="3" rx="1" fill="#94a3b8" />
          </svg>
          <div
            className="absolute top-1/2 right-full -translate-y-1/2"
            style={{
              width: "40px",
              height: "2px",
              background: "linear-gradient(to left, rgba(255,255,255,0.4), transparent)",
            }}
          />
        </div>
      </div>
    );
  }