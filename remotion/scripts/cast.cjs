/**
 * The figure LIBRARY: every unique person drawn once.
 *
 * Every entry USED by placement.cjs becomes one <g> in the scene's <defs>, and
 * the crowd is built by instancing those with <use>. Entries nobody places are
 * never emitted, which is why the seated block below costs nothing. That
 * sharing is what makes a large crowd affordable -- 20 placed figures cost 13
 * definitions. Internal <use> references work in every engine; only EXTERNAL
 * ones are a portability problem.
 *
 * Every value is an exact react-peeps key. A miss renders `undefined` as a
 * component and throws React #130 -- check `npm run scene:enumerate` first.
 * `ShortVolumed` and `ShavedSides` are real; `CurlyHighTop` is not.
 *
 * WB variants only. BW fills the body solid ink, which is far too heavy behind
 * white hero type at --hero-dim: 0.58.
 */
module.exports = [
  // ---- standing ----
  {id: 'st_shirt',   body: 'ShirtWB',          face: 'Smile',      hair: 'Afro'},
  {id: 'st_pants',   body: 'ShirtPantsWB',     face: 'Serious',    hair: 'Short'},
  {id: 'st_arms',    body: 'CrossedArmsWB',    face: 'Suspicious', hair: 'Turban'},
  {id: 'st_easing',  body: 'EasingWB',         face: 'Smile',      hair: 'Hijab'},
  {id: 'st_point',   body: 'PointingFingerWB', face: 'Awe',        hair: 'Long'},
  {id: 'st_rest',    body: 'RestingWB',        face: 'Calm',       hair: 'CornRows'},
  {id: 'st_walk',    body: 'WalkingWB',        face: 'Cheeky',     hair: 'Twists'},
  {id: 'st_blazer',  body: 'BlazerPantsWB',    face: 'Driven',     hair: 'GrayMedium',  accessory: 'GlassRound'},
  {id: 'st_robo',    body: 'RoboDanceWB',      face: 'SmileBig',   hair: 'Mohawk'},
  {id: 'st_beanie',  body: 'ShirtWB',          face: 'Driven',     hair: 'Beanie'},
  {id: 'st_gray',    body: 'ShirtPantsWB',     face: 'OldAged',    hair: 'GrayShort',   facialHair: 'FullMedium'},
  {id: 'st_bangs',   body: 'EasingWB',         face: 'Solemn',     hair: 'MediumBangs'},

  // These are no longer pooled: their dark lap/leg mass and missing chair read
  // as a person on a black blob under the hero scrim. Only `si_wheel` remains,
  // hand-placed once in placement.cjs; the verified react-peeps keys stay here.
  {id: 'si_medium',  body: 'MediumWB',         face: 'Driven',     hair: 'ShortCurly'},
  {id: 'si_hands',   body: 'HandsBackWB',      face: 'Cheeky',     hair: 'BantuKnots'},
  {id: 'si_closed',  body: 'ClosedLegWB',      face: 'Calm',       hair: 'Bun'},
  {id: 'si_oneleg',  body: 'OneLegUpWB',       face: 'EatingHappy',hair: 'Buns'},
  {id: 'si_cross',   body: 'CrossedLegs',      face: 'SmileTeeth', hair: 'FlatTop'},
  {id: 'si_wheel',   body: 'WheelChair',       face: 'Smile',      hair: 'LongCurly'},
  {id: 'si_bike',    body: 'Bike',             face: 'Driven',     hair: 'ShortMessy'},
];
