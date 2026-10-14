const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = 4904403;
console.log('Component header:', content.slice(idx - 1600, idx - 1000));
