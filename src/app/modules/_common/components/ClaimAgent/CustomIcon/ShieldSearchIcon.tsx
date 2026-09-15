type ColorKey = "blue" | "write";

type ShieldSearchIconProps = {
    size?: number;
    color?: ColorKey;
};

const glassColor: Record<ColorKey, string> = {
    blue: "#FFFFFF",
    write: "#1a5da8 ",
};

export const shieldcolor: Record<ColorKey, string> = {
    blue: "#1a5da8 ",
    write: "#FFFFFF",
};

const ShieldSearchIcon = ({ size = 24, color = "blue" }: ShieldSearchIconProps) => (
    <svg width={size} height={size} viewBox="0 0 80 100" fill="none">
        <path d="M40 0 L80 15 L80 55 Q80 85 40 100 Q0 85 0 55 L0 15 Z" fill={shieldcolor[color]} />
        <circle cx="38" cy="46" r="18" stroke={glassColor[color]} strokeWidth="11" />
        <line x1="51" y1="58" x2="75" y2="80" stroke={glassColor[color]} strokeWidth="11" strokeLinecap="round" />
    </svg>
);

export default ShieldSearchIcon;
