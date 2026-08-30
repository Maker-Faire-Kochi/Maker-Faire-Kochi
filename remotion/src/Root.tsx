import type {FC} from 'react';
import {Composition} from 'remotion';
import {PeepsTest} from './PeepsTest';
import {ExactCopy} from './ExactCopy';
import {HeroLoop} from './HeroLoop';
import {HERO_CUT, SOURCE} from './lib/source';

export const RemotionRoot: FC = () => {
  return (
    <>
      {/* Frame-for-frame passthrough of the source film. */}
      <Composition
        id="PeepsTest"
        component={PeepsTest}
        durationInFrames={48}
        fps={24}
        width={1280}
        height={720}
      />
      <Composition
        id="ExactCopy"
        component={ExactCopy}
        durationInFrames={SOURCE.durationInFrames}
        fps={SOURCE.fps}
        width={SOURCE.width}
        height={SOURCE.height}
      />

      {/* Same footage on a 1080p canvas. Interpolated, not upscaled —
          see the note in ExactCopy.tsx. */}
      <Composition
        id="ExactCopyHD"
        component={ExactCopy}
        durationInFrames={SOURCE.durationInFrames}
        fps={SOURCE.fps}
        width={1920}
        height={1080}
      />

      {/* Trimmed cut for the site hero, ending on the settled wide shot so the
          last frame matches the poster still. */}
      <Composition
        id="HeroLoop"
        component={HeroLoop}
        durationInFrames={HERO_CUT.durationInFrames}
        fps={SOURCE.fps}
        width={SOURCE.width}
        height={SOURCE.height}
      />
    </>
  );
};
