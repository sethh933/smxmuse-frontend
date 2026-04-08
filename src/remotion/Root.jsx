import { Composition } from 'remotion';
import { PromoVideo } from './PromoVideo.jsx';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="SmxMusePromo"
        component={PromoVideo}
        durationInFrames={960}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
