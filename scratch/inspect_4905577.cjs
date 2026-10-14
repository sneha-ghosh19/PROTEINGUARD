const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

const idx = 4905577;
console.log('Component at 4905577:', content.slice(idx - 500, idx + 500));
