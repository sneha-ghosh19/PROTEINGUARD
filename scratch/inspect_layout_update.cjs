const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = content.indexOf('WW.Layout.Update');
console.log(content.slice(idx - 30, idx + 200));

// Find definition of Layout.Update
const lIdx = content.indexOf('Layout:{Update:');
console.log('Layout:{Update:', content.slice(lIdx, lIdx + 200));
