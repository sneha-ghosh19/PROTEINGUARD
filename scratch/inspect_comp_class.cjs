const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = 4904403;
console.log('Component class definition:', content.slice(idx - 2500, idx - 1600));
