/**
 * Side-profile vehicle illustrations used in the hero's animated highway strip.
 * Kept as lightweight inline SVGs so they can be recolored and scaled freely.
 */

type VehicleProps = {
  className?: string;
  color?: string;
};

/** A simple side-view car. `color` controls the body paint. */
export function SideCar({ className, color = "#EF4444" }: VehicleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 160 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <path
        d="M8 46c0-6 4-9 10-10l18-18c5-5 11-7 18-7h34c8 0 15 3 20 9l14 16c10 1 18 5 22 12 2 4-1 8-6 8H14c-4 0-6-3-6-6z"
        fill={color}
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Windows */}
      <path
        d="M44 20c3-4 7-6 13-6h30c6 0 11 2 15 7l10 12H34z"
        fill="#E0F2FE"
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="46" cy="52" r="12" fill="#0F172A" />
      <circle cx="46" cy="52" r="5" fill="#CBD5E1" />
      <circle cx="116" cy="52" r="12" fill="#0F172A" />
      <circle cx="116" cy="52" r="5" fill="#CBD5E1" />
      {/* Headlight */}
      <circle cx="146" cy="44" r="3.5" fill="#FDE68A" stroke="#0F172A" strokeWidth="2" />
    </svg>
  );
}

/** A side-view delivery truck carrying a FASTag parcel. */
export function DeliveryTruck({ className }: VehicleProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cargo box */}
      <rect x="8" y="22" width="120" height="44" rx="6" fill="#2563EB" stroke="#0F172A" strokeWidth="3.5" />
      {/* Parcel logo on the box */}
      <rect x="28" y="34" width="22" height="20" rx="3" fill="#FACC15" stroke="#0F172A" strokeWidth="2.5" />
      <path d="M28 44h22M39 34v20" stroke="#0F172A" strokeWidth="2.5" />
      {/* Cab */}
      <path
        d="M128 30h36c6 0 11 3 15 8l20 26c1 2 0 2-2 2h-69z"
        fill="#F59E0B"
        stroke="#0F172A"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* Cab window */}
      <path d="M140 36h22c4 0 8 2 11 6l9 12h-42z" fill="#E0F2FE" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
      {/* Chassis */}
      <rect x="8" y="66" width="192" height="6" rx="3" fill="#0F172A" />
      {/* Wheels */}
      <circle cx="54" cy="74" r="13" fill="#0F172A" />
      <circle cx="54" cy="74" r="5.5" fill="#CBD5E1" />
      <circle cx="160" cy="74" r="13" fill="#0F172A" />
      <circle cx="160" cy="74" r="5.5" fill="#CBD5E1" />
    </svg>
  );
}
