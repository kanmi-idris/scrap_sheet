interface SquigglyArrowProps {
  className?: string;
  width?: number;
  height?: number;
}

export function SquigglyArrow({
  className = "text-primary/60",
  width = 80,
  height = 60,
  dashed = false,
}: SquigglyArrowProps & { dashed?: boolean }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Squiggly path */}
      <path
        d="M40 5 Q30 15, 40 25 T40 45 L40 50 M35 45 L40 50 L45 45"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "4 4" : undefined}
        fill="none"
        className="drop-shadow-lg"
      />
    </svg>
  );
}
