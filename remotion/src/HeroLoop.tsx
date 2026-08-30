import type {FC} from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {HERO_CUT, SOURCE} from './lib/source';

/**
 * The site-hero cut: the last 4.5s of the film, ending on the settled wide shot.
 *
 * A negative Sequence offset is how the source is advanced to frame 132 without
 * depending on OffthreadVideo's trim prop, which has been renamed across
 * Remotion versions (startFrom -> trimBefore). Inside a Sequence, the child's
 * clock reads parentFrame - from, so from={-132} starts the video at its own
 * frame 132 on the composition's frame 0.
 */
export const HeroLoop: FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#EAEAEA'}}>
      <Sequence from={-HERO_CUT.startFrom}>
        <OffthreadVideo
          src={staticFile(SOURCE.file)}
          muted
          style={{width: '100%', height: '100%', objectFit: 'contain'}}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
