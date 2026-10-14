const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = 4904403;
console.log('Region layout logic:', content.slice(idx - 400, idx + 200));
