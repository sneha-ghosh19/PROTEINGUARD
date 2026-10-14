const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const name = 'hwe';
let p = 0;
while ((p = content.indexOf(name, p)) !== -1) {
  console.log('hwe reference at', p, ':', content.slice(p - 50, p + 100));
  p += 4;
}
