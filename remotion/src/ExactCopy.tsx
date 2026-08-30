import type {FC} from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';
import {SOURCE} from './lib/source';

/**
 * Frame-for-frame passthrough of the source film.
 *
 * The pixels are the original's, so this is exact by construction — which a
 * hand-redrawn SVG version could never be. What Remotion buys here is the
 * render pipeline: re-encode at any size, trim, overlay, loop, swap dates.
 *
 * Rendered through the ExactCopyHD composition this fills a 1920x1080 canvas,
 * but that is interpolation, not detail recovery. The source is 720p; scaling
 * it up adds pixels, not information. Real upscaling needs a model
 * (Real-ESRGAN et al), not a bigger canvas.
 */
export const ExactCopy: FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#EAEAEA'}}>
      <OffthreadVideo
        src={staticFile(SOURCE.file)}
        style={{width: '100%', height: '100%', objectFit: 'contain'}}
      />
    </AbsoluteFill>
  );
};
