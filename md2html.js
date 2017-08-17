"use strict";
var fs = require('fs');
var showdown = require('showdown');

/** Check for arguments*/
if (process.argv.length < 4) {
    console.log("Usage: node md2html.js MD_FILE OUT_HTML_FILE");
    process.exit(1);
}

var mdFile = process.argv[2];
var outHtmlFile = process.argv[3];
var mdData = fs.readFileSync(mdFile, 'utf-8');
let converter = new showdown.Converter();
let html = converter.makeHtml(mdData);
console.log("html: " + html);
fs.writeFileSync(outHtmlFile, html);
console.log("OK.");