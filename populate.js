'use strict';

const fs = require('fs');
const markdown = require('marked');
const hljs = require('highlight.js');
const _ = require('lodash');

const OPEN = /{%\sblock\s([-\w]+)\s%}(?:\s+)?\n/g;
const CLOSE = /{%\sendblock\s%}(?:\s+)?\n?/g;
const scssOutputFile = 'src/scss/_flexcomp.scss';

module.exports = populate;

// global
var headings = [];
var renderer = new markdown.Renderer();

/**
 * overwrite default heading renderer of `marked`
 */
renderer.heading = (text, level) => {
  let sepIndex = text.indexOf('|');
  let content;
  let colBreak = false;
  let id;
  if (sepIndex > 0) {
    content = text.substring(0, sepIndex).trim();
    id = text.substring(sepIndex+1).trim();
  } else {
    content = text;
    id = text;
  }

  let escapedText = id.toLowerCase().replace(/[^\w]+/g, '-');

  headings.push({
    level,
    text: '<a name="' + escapedText +
          '" href="#' + escapedText + '">' +
          content + '</a>'
  });

  return '<h' + level + ' id="' +
          escapedText + '"' + '><a name="' +
          escapedText +
          '" class="anchor" href="#' +
          escapedText +
          '">#</a>' +
          content + '</h' + level + '>';
};

/**
 * parsing headings to ul > li tree
 *
 * @param headings {Array}
 * @param n {Number} the largest level of headings want to keep
 * @return {String} html string of ul > li tree
 */
function genToc(headings, n) {
  n = n || 3;
  let pre = 1;
  let topLevel = 2;
  let closeTags = [];
  let out = '';
  let hl = _(headings);
  hl
    .filter((h) => {
      return h.level <= n;
    })
    .map((h) => {
      let dif = h.level - pre;
      pre = h.level;
      if (h.level === topLevel) {
        closeTags.forEach((tag) => {
         out += tag;
        });
        out += '<ul class="top-level"><li>';
        closeTags.push('</li></ul>');
      } else if (dif > 0) {
        for(let i = 0; i < dif; i++) {
          out += '<ul><li>';
          closeTags.push('</li></ul>');
        }
      } else if (dif < 0) {
        dif = - dif;
        for(let i = 0; i < dif; i++) {
          out += closeTags.pop();
        }
        out += '</li><li>';
      } else {
        out += '</li><li>';
      }

      out += h.text;
    })
    .value();

  /* in case there is none closed tag */
  closeTags.forEach((tag) => {
    out += tag;
  });

  return out;
}

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

function populate(filename) {
  console.log('Reading file ' + filename);
  let cont = fs.readFileSync(filename, 'utf-8');
  let points = parseFile(cont);
  let data = [];
  let scss = '';
  let one;
  let item;
  let toc;
  let description, left, className;

  headings = [];

  // markdown opt
  markdown.setOptions({
    renderer,
    highlight: (code) => {
      return hljs.highlightAuto(code).value;
    }
  });

  for (let i = 0; i < points.length; i++) {
    item = points[i];
    if (item.type === 'markdown') {
      description = markdown(
        cont.substring(item.start, item.end).trim()
      );
    } else {
      left = cont.substring(item.start, item.end).trim();
      if (left) {
        scss += '.' + item.type + '{\n';

        one = left;

        // dirty '&' injection
        if (/^\.container/.test(left)) one = '&' + one;

        // make it pretty in scss file
        one = one.replace(/(^)/gm, '$1  ')

        scss += one + '\n}\n\n';
      }
      className = item.type;
      left = hljs.highlight('css', left).value;
    }

    if (i % 2 === 1) {
      data.push({
        description,
        left,
        className
      });
    }
  }

  fs.writeFileSync(scssOutputFile, scss, 'utf-8');
  return {
    data,
    toc: genToc(headings, 5)
  };
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

  // TODO
  // check mardkown/other should be interleaved

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