const fs = require('fs');
const content = fs.readFileSync('frontend/public/vendor/molstar/molstar.js', 'utf8');

// search for PluginCommands in exports
let idx = 0;
while ((idx = content.indexOf('PluginCommands', idx)) !== -1) {
  console.log('PluginCommands at', idx, ':', content.slice(idx - 50, idx + 100));
  idx += 15;
}
