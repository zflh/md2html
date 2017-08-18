"use strict";
var fs = require('fs');
var showdown = require('showdown');

/** Check for arguments*/
if (process.argv.length < 5) {
    console.log("Usage: node md2html.js -e MD_FILE OUT_HTML_FILE");
    console.log("       node md2html.js -r FOLDER_NAME OUT_FOLDER_NAME");
    process.exit(1);
}

var type = process.argv[2];
var mdParam = process.argv[3];
var htmlParam = process.argv[4];

if (type == "-e") {
    convertFile(mdParam, htmlParam);
} else if (type == "-r") {
    readFolder(mdParam);
}

function convertFile(mdFile, outHtmlFile) {
    var mdData = fs.readFileSync(mdFile, 'utf-8');
    let converter = new showdown.Converter();
    let html = converter.makeHtml(mdData);
    console.log("outHtmlFile : " + outHtmlFile);
    fs.writeFileSync(outHtmlFile, html);
    console.log("OK.");
}

function readFolder(folderName) {
    console.log("readFolder folderName : " + folderName);
    fs.readdir(folderName, function (err, files) {
        if (err) {
            console.log('error:\n' + err);
            return;
        }
        files.forEach(function (file) {
            fs.stat(folderName + '/' + file, function (err, stat) {
                if (err) {
                    console.log(err);
                    return;
                }
                if (stat.isDirectory()) {
                    console.log("isDirectory stat : " + stat);
                    readFolder(folderName + '/' + file);
                } else {
                    if (file.endsWith('.md')) {
                        let mdFile = folderName + '/' + file;
                        let outFileName = '';
                        if (folderName == mdParam) {
                            outFileName = htmlParam + '/' + file.replace('.md', '.html');
                        } else {
                            let subFulder = folderName.replace(mdParam + "/", '');
                            let outFolder = htmlParam + '/' + subFulder;
                            let exist = fs.existsSync(outFolder);
                            if(!exist) {
                                fs.mkdirSync(outFolder);
                            }
                            outFileName = outFolder + '/' + file.replace('.md', '.html');
                        }
                        folderName.trim();
                        outFileName.trim();
                        console.log('mdFile:' + mdFile + ' outFileName :' + outFileName);
                        //todo edit out folder name
                        convertFile(mdFile, outFileName);
                    }
                }
            });
        });
    });
}