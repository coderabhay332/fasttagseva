/**
 * Tagu — the TagSeva mascot.
 * A friendly cartoon car holding a FASTag sticker. Pure SVG so it scales crisply.
 */
export default function Mascot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Tagu, the TagSeva mascot car"
    >
      {/* Ground shadow */}
      <ellipse cx="160" cy="270" rx="120" ry="18" fill="#0F172A" opacity="0.18" />

      {/* Car body */}
      <g>
        <path
          d="M40 190c0-14 10-22 24-24l28-44c8-12 20-18 36-18h64c16 0 30 7 38 20l24 40c16 3 26 12 26 26v22c0 9-7 16-16 16H56c-9 0-16-7-16-16z"
          fill="#FACC15"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Windows */}
        <path
          d="M104 126c5-8 13-12 24-12h52c11 0 21 5 27 14l18 30H90z"
          fill="#BAE6FD"
          stroke="#0F172A"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path d="M160 116v42" stroke="#0F172A" strokeWidth="6" />
      </g>

      {/* Headlight */}
      <circle cx="264" cy="196" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />

      {/* Wheels */}
      <g>
        <circle cx="96" cy="222" r="30" fill="#0F172A" />
        <circle cx="96" cy="222" r="13" fill="#E2E8F0" />
        <circle cx="224" cy="222" r="30" fill="#0F172A" />
        <circle cx="224" cy="222" r="13" fill="#E2E8F0" />
      </g>

      {/* Eyes */}
      <g>
        <circle cx="140" cy="140" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
        <circle cx="144" cy="142" r="6" fill="#0F172A" />
        <circle cx="184" cy="140" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
        <circle cx="188" cy="142" r="6" fill="#0F172A" />
      </g>

      {/* Smile */}
      <path d="M150 162c6 7 18 7 24 0" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" fill="none" />

      {/* FASTag sticker held up front */}
      <g transform="rotate(-10 60 150)">
        <rect x="18" y="120" width="70" height="46" rx="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="5" />
        <rect x="26" y="128" width="30" height="30" rx="3" fill="#0F172A" />
        <rect x="30" y="132" width="6" height="6" fill="#FFFFFF" />
        <rect x="42" y="132" width="6" height="6" fill="#FFFFFF" />
        <rect x="30" y="144" width="6" height="6" fill="#FFFFFF" />
        <rect x="46" y="148" width="6" height="6" fill="#FFFFFF" />
        <text x="62" y="140" fontFamily="'Baloo 2', sans-serif" fontSize="11" fontWeight="800" fill="#0F172A">
          FAST
        </text>
        <text x="62" y="156" fontFamily="'Baloo 2', sans-serif" fontSize="11" fontWeight="800" fill="#16A34A">
          tag
        </text>
      </g>
    </svg>
  );
}
