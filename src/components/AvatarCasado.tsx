interface AvatarCasadoProps {
  nomeEle: string;
  nomeEla: string;
  fotoUrl?: string;
  size?: number;
  onClick?: () => void;
}

export default function AvatarCasado({ nomeEle, nomeEla, fotoUrl, size = 40, onClick }: AvatarCasadoProps) {
  const initials = `${nomeEle.charAt(0)}&${nomeEla.charAt(0)}`;

  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={`${nomeEle} e ${nomeEla}`}
        width={size}
        height={size}
        onClick={onClick}
        className="avatar-casal-img"
        style={{
          width: size, height: size, borderRadius: '50%', objectFit: 'cover',
          cursor: onClick ? 'pointer' : 'default'
        }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      onClick={onClick}
      className="avatar-casal-placeholder"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #059669, #34D399)',
        color: 'white', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: size * 0.3,
        fontWeight: 700, cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0
      }}
    >
      {initials}
    </div>
  );
}
