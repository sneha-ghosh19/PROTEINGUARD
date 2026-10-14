const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

let p = 0;
while ((p = content.indexOf('msp-sequence', p)) !== -1) {
  console.log('msp-sequence at', p, ':', content.slice(p - 30, p + 80));
  p += 15;
}
