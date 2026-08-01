import { Img } from "remotion";

export function RiderAvatar({ image, name, size, radius }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        flex: "0 0 auto",
        boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.14)"
      }}
    >
      {image ? (
        <Img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block"
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255, 255, 255, 0.64)",
            fontSize: 22,
            fontWeight: 900
          }}
        >
          {name?.slice(0, 1)}
        </div>
      )}
    </div>
  );
}
