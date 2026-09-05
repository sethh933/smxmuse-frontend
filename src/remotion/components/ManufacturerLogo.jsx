import { Img } from "remotion";

const LOGOS = {
  DUC: "https://assets.liveracemedia.com/manufacturers/primary/ducati.png",
  GAS: "https://assets.liveracemedia.com/manufacturers/primary/gasgas.png",
  HON: "https://assets.liveracemedia.com/manufacturers/primary/honda.png",
  HUS: "https://assets.liveracemedia.com/manufacturers/primary/husqvarna.png",
  KAW: "https://assets.liveracemedia.com/manufacturers/primary/kawasaki.png",
  KTM: "https://assets.liveracemedia.com/manufacturers/primary/ktm.png",
  SUZ: "https://assets.liveracemedia.com/manufacturers/primary/suzuki.png",
  TRI: "https://assets.liveracemedia.com/manufacturers/primary/triumph.png",
  YAM: "https://assets.liveracemedia.com/manufacturers/primary/yamaha.png"
};

export function ManufacturerLogo({ brand, compact = true }) {
  const logo = LOGOS[brand];

  return (
    <div
      style={{
        width: compact ? 96 : 170,
        height: compact ? 38 : 48,
        borderRadius: compact ? 7 : 8,
        background: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        overflow: "hidden",
        padding: compact ? "5px 8px" : "6px 18px",
        color: "#14171d",
        fontSize: 18,
        fontWeight: 900
      }}
    >
      {logo ? (
        <Img
          src={logo}
          alt={brand}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block"
          }}
        />
      ) : (
        brand
      )}
    </div>
  );
}
