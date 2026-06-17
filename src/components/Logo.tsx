export default function Logo({ size = 40, showText = true }: { size?: number; showText?: boolean }) {
  const height = Math.round(size * 0.6);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 200 60"
      role="img"
      aria-label="Casados Para Sempre"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Duas alianças douradas entrelaçadas */}
      <circle cx="30" cy="30" r="16" fill="none" stroke="#FFC801" strokeWidth="3.5" />
      <circle
        cx="42"
        cy="30"
        r="16"
        fill="none"
        stroke="#FFC801"
        strokeWidth="3.5"
        strokeDasharray="25 75"
        strokeDashoffset="20"
      />

      {showText && (
        <text
          x="90"
          y="36"
          fontFamily="Outfit, sans-serif"
          fontSize="16"
          fontWeight="700"
          fill="#214991"
        >
          Casados Para Sempre
        </text>
      )}
    </svg>
  );
}
