const RP = require('react-peeps');
for (const g of ['StandingPose','SittingPose','BustPose','Face','Hair','FacialHair','Accessories']) {
  console.log('\n### ' + g);
  console.log(Object.keys(RP[g] || {}).join(' '));
}
