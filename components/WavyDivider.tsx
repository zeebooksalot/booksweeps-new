export function WavyDivider() {
  return (
    <div className="relative w-full h-20">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 1200 130"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="intenseShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="35" stdDeviation="30" floodColor="rgba(0,0,0,0.25)"/>
          </filter>
        </defs>
        <path
          d="M0,100 Q300,0 600,130 Q900,0 1200,100 L1200,130 L0,130 Z"
          fill="var(--background)"
          className="transition-colors"
          filter="url(#intenseShadow)"
        />
      </svg>
    </div>
  )
}
