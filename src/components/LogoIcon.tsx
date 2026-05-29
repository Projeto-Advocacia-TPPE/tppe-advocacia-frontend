interface LogoIconProps {
  size?: number;
  color?: string;
}

export default function LogoIcon({ size = 36, color = '#c0392b' }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      style={{ fill: color, flexShrink: 0 }}
      aria-hidden="true"
    >
      <rect x="16" y="2"  width="4"  height="32" rx="1" />
      <rect x="8"  y="10" width="20" height="3"  rx="1" />
      <rect x="10" y="22" width="16" height="3"  rx="1" />
    </svg>
  );
}
