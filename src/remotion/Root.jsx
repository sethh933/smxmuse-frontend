import { Composition } from "remotion";
import { ChampionshipBarRace } from "./components/ChampionshipBarRace";
import { SxWinsBarRace } from "./components/SxWinsBarRace";
import { most450SxWins } from "./data/most450SxWins";
import { standings2026Mx250 } from "./data/standings2026Mx250";
import { standings2026Mx450 } from "./data/standings2026Mx450";

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
      <Composition
        id="ChampionshipBarRace2026Mx450Instagram"
        component={ChampionshipBarRace}
        durationInFrames={1080}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          data: standings2026Mx450,
          layout: "instagramSafeVertical"
        }}
      />
      <Composition
        id="ChampionshipBarRace2026Mx250Instagram"
        component={ChampionshipBarRace}
        durationInFrames={1080}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          data: standings2026Mx250,
          layout: "instagramSafeVertical"
        }}
      />
    </>
  );
}
