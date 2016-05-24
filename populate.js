'use strict';

const fs = require('fs');
const markdown = require('marked');
const hljs = require('highlight.js');

const OPEN = /{%\sblock\s(\w+)\s%}(?:\s+)?\n/g;
const CLOSE = /{%\sendblock\s%}(?:\s+)?\n?/g;

test();

function test() {
  let cont = fs.readFileSync('src/tdata.txt', 'utf-8');
  let points = parseFile(cont);
  let i;
  points.forEach(i => {
    console.log('TYPE:');
    console.log(i.type);
    console.log()
    console.log('CONTENT:');
    console.log(cont.substring(i.start, i.end));
    console.log();
  });
}

function parseFile(cont) {
  let points = parseAllOpen(cont);
  let closePoints = parseAllClose(cont);

  if (points.length !== closePoints.length) {
    console.log('Open tag number is not matching' +
      ' close tag number');
    console.log('OPEN  tag: ' + points.length);
    console.log('CLOSE tag: ' + closePoints.length);

    console.log(closePoints);
    process.exit(2);
  }

  for (let i = 0; i < points.length; i++) {
    points[i].end = closePoints[i].end;
  }

  return points;
}

// for simplicity's sake split open/close parsing
// since we do not have nested open/close
function parseAllOpen(data) {
  let cap;
  let ret = [];
  let start;
  let type;

  while (cap = OPEN.exec(data)) {
    type = cap[1];
    start = cap.index + cap[0].length;

    ret.push({
      type,
      start
    });
  }

  return ret;
}

function parseAllClose(data) {
  let cap;
  let ret = [];
  let end;

  while (cap = CLOSE.exec(data)) {
    end = cap.index;

    ret.push({
      end
    });
  }

  return ret;
}