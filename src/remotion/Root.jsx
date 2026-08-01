import { Composition } from "remotion";
import { SxWinsBarRace } from "./components/SxWinsBarRace";
import { most450SxWins } from "./data/most450SxWins";

export function RemotionRoot() {
  return (
    <>
      <Composition
        id="Most450SxWinsInstagram"
        component={SxWinsBarRace}
        durationInFrames={3600}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          data: most450SxWins,
          layout: "instagramSafeVertical"
        }}
      />
      <Composition
        id="Most450SxWinsTikTok"
        component={SxWinsBarRace}
        durationInFrames={3600}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          data: most450SxWins,
          layout: "tiktokVertical"
        }}
      />
    </>
  );
}
