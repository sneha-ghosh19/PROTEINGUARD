const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = 4904403;
console.log('Before region layout logic:', content.slice(idx - 1000, idx - 400));
