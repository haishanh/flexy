'use strict';

const pug = require('pug');
const fs = require('fs');
const inputFile = 'src/index.pug';
const outputFile = 'dest/index.html'
const populate = require('./populate');
const dataFile = 'src/data.txt';

if (!module.parent) {
  renderPug();
} else {
  module.exports = renderPug;
}

function renderPug() {
  let pugOpts = {
    pretty: true
  };
  let locals = {
    data: populate(dataFile)
  };

  let fn =  pug.compileFile(inputFile, pugOpts);
  let html = fn(locals)

  fs.writeFileSync(outputFile, html, 'utf-8');
}