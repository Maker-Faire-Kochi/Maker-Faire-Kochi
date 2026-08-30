import {Config} from '@remotion/cli/config';

/**
 * PNG, not JPEG, as the frame intermediate.
 *
 * The default JPEG path costs a generation of loss before the encoder even
 * runs, which showed up as SSIM 0.9927 against the source on the first render.
 * These are hairline net strands on flat paper — exactly the content JPEG
 * ringing damages most. PNG is slower to render and the only way a passthrough
 * composition can honestly be called a copy.
 */
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
