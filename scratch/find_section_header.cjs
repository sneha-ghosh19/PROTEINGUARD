const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

// search for `Structure Tools` or what section headers exist
let idx = 0;
while ((idx = content.indexOf('msp-section-header', idx)) !== -1) {
  console.log('msp-section-header at', idx, ':', content.slice(idx - 100, idx + 200));
  idx += 20;
}
