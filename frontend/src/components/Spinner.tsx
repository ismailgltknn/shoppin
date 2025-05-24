import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | string; // Küçük, orta, büyük veya özel boyut (h-X w-X gibi)
  color?: string; // Tailwind renk sınıfı (örn: 'text-indigo-600', 'text-white')
  className?: string; // Ekstra Tailwind sınıfları veya diğer CSS sınıfları
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "text-indigo-600",
  className = "",
}) => {
  // Boyut sınıfını belirleme
  let sizeClass = "";
  switch (size) {
    case "sm":
      sizeClass = "h-5 w-5"; // Buton içi için küçük
      break;
    case "md":
      sizeClass = "h-10 w-10"; // Tam ekran için varsayılan orta
      break;
    case "lg":
      sizeClass = "h-16 w-16"; // Daha büyük spinner
      break;
    default:
      sizeClass = size; // Özel bir boyut sınıfı gelirse direkt kullan
  }

  return (
    <svg
      className={`animate-spin ${sizeClass} ${color} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
};

export default Spinner;
