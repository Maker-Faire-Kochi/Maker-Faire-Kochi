import type {FC} from 'react';
import {AbsoluteFill} from 'remotion';
import * as ReactPeeps from 'react-peeps';

// CommonJS package: the component hangs off `.default` on the namespace object,
// which an ESM default import does not resolve to under this bundler.
const Peep = (ReactPeeps as any).default as FC<any>;

/**
 * Feasibility probe only — not a deliverable. Answers three questions:
 * can Open Peeps render inside Remotion, does the line art recolour to the
 * brand palette, and do the available poses read as "makers at work"?
 */
const CAST = [
  {body: 'Shirt', face: 'Smile', hair: 'Afro', accessory: 'GlassRoundThick'},
  {body: 'ArmsCrossed', face: 'Calm', hair: 'Bun', accessory: 'None'},
  {body: 'Device', face: 'Cheeky', hair: 'Long', accessory: 'None'},
  {body: 'Hoodie', face: 'Smile', hair: 'FlatTop', accessory: 'None'},
  {body: 'PointingUp', face: 'Awe', hair: 'Medium', accessory: 'None'},
  {body: 'Coffee', face: 'Contempt', hair: 'Bald', accessory: 'GlassRound'},
];

export const PeepsTest: FC = () => (
  <AbsoluteFill style={{backgroundColor: '#EAEAEA', padding: 40}}>
    <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '100%'}}>
      {CAST.map((c, i) => (
        <div
          key={i}
          style={{
            width: 300,
            height: 460,
            // Recolour probe: Open Peeps ships as black line art.
            filter: i % 2 === 0
              ? 'invert(38%) sepia(58%) saturate(420%) hue-rotate(140deg)'
              : 'none',
          }}
        >
          <Peep
            style={{width: 300, height: 460}}
            accessory={c.accessory}
            body={c.body}
            face={c.face}
            hair={c.hair}
            strokeColor="#1A1C1E"
          />
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
