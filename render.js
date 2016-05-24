'use strict';

const pug = require('pug');
const fs = require('fs');
const inputFile = 'src/index.pug';
const outputFile = 'index-render.html'

const pugOpt = {
  pretty: true
};
var html = pug.renderFile(inputFile, Object.assign({}, pugOpt));
fs.writeFileSync(outputFile, html, 'utf-8');