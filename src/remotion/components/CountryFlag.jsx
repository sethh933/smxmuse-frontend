import { Img } from "remotion";

export function CountryFlag({ code, country, size = 34 }) {
  if (!code) {
    return null;
  }

  return (
    <div
      aria-label={country || code}
      style={{
        width: size * 1.42,
        height: size,
        borderRadius: 4,
        overflow: "hidden",
        flex: "0 0 auto",
        background: "rgba(255, 255, 255, 0.18)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.28)"
      }}
    >
      <Img
        src={`https://flagcdn.com/w80/${code}.png`}
        alt={country || code}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block"
        }}
      />
    </div>
  );
}
