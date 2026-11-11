'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
// Only the public HTML is copied. Server files and environment secrets never enter public/.
fs.mkdirSync(path.join(root,'public'),{recursive:true});
fs.copyFileSync(path.join(root,'index.html'),path.join(root,'public/index.html'));
