const path = require('path');
global.window = global;
global.self = global;
global.document = { createElement: () => ({ style: {} }), head: { appendChild: () => {} } };
const p = 'C:\\Users\\taniy\\OneDrive\\Desktop\\ProteinGuard\\frontend\\public\\vendor\\molstar\\molstar.js';
require(p);
console.log('window.molstar keys:', Object.keys(global.molstar || {}));
