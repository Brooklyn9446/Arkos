export const SentinelLogo = ({ size = 32, animated = true }: { size?: number; animated?: boolean }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={animated ? "animate-pulse" : ""}
  >
    {/* Outer Shield outline */}
    <path
      d="M16 2 L26 6 L26 14 C26 22 16 28 16 28 C16 28 6 22 6 14 L6 6 Z"
      stroke="#00FF41"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
      opacity="0.9"
    />

    {/* Inner crosshair / scan lines */}
    <g opacity="0.6">
      {/* Horizontal line */}
      <line x1="10" y1="16" x2="22" y2="16" stroke="#00FF41" strokeWidth="0.8" />
      {/* Vertical line */}
      <line x1="16" y1="10" x2="16" y2="22" stroke="#00FF41" strokeWidth="0.8" />
    </g>

    {/* Center dot (target) */}
    <circle cx="16" cy="16" r="1.5" fill="#00FF41" opacity="0.9" />

    {/* Corner brackets - top left */}
    <g stroke="#00FF41" strokeWidth="1" strokeLinecap="round" opacity="0.7">
      <line x1="9" y1="8" x2="12" y2="8" />
      <line x1="9" y1="8" x2="9" y2="11" />
      
      {/* Top right */}
      <line x1="23" y1="8" x2="20" y2="8" />
      <line x1="23" y1="8" x2="23" y2="11" />
      
      {/* Bottom left */}
      <line x1="9" y1="24" x2="12" y2="24" />
      <line x1="9" y1="24" x2="9" y2="21" />
      
      {/* Bottom right */}
      <line x1="23" y1="24" x2="20" y2="24" />
      <line x1="23" y1="24" x2="23" y2="21" />
    </g>

    {/* Accent glow circle */}
    <circle
      cx="16"
      cy="16"
      r="13"
      stroke="#00FF41"
      strokeWidth="0.5"
      fill="none"
      opacity="0.3"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export const SentinelWordmark = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const textSizes = {
    sm: { main: "text-base", version: "text-xs" },
    md: { main: "text-xl", version: "text-sm" },
    lg: { main: "text-2xl", version: "text-base" },
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className={`${textSizes[size].main} font-display font-bold tracking-widest neon-text`}>
        SENTINEL
      </h1>
      <span className={`${textSizes[size].version} font-mono text-neon-dim tracking-widest opacity-60`}>
        v2.0
      </span>
    </div>
  );
};

export const SentinelBrand = ({ size = 32 }: { size?: number }) => (
  <div className="flex items-center gap-3">
    <SentinelLogo size={size} />
    <SentinelWordmark size={size > 40 ? "md" : "sm"} />
  </div>
);
