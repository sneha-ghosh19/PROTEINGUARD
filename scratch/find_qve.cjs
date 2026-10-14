const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = 4818486;
console.log('qve definition and usage:', content.slice(idx - 200, idx + 500));

// Find where qve is referenced
const name = 'qve';
let p = 0;
while ((p = content.indexOf('qve', p)) !== -1) {
  console.log('qve reference at', p, ':', content.slice(p - 30, p + 80));
  p += 4;
}
