const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

// find WW.Layout.Update
const idx = content.indexOf('WW.Layout.Update');
console.log('WW.Layout.Update:', content.slice(idx - 200, idx + 100));

// Find definition of WW
const dIdx = content.lastIndexOf('WW=', idx);
console.log('WW definition:', content.slice(dIdx, dIdx + 200));
