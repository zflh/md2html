"use strict";
const fs = require('fs');
const path = require("path");
const showdown = require('showdown');
const Handlebars = require("handlebars");

/** Check for arguments*/
if (process.argv.length < 6) {
    console.log("Usage: node md2html.js FOLDER_NAME OUT_FOLDER_NAME educate_str educate_level");
    process.exit(1);
}

const mdParam = process.argv[2];
const htmlParam = process.argv[3];
const educateStr = process.argv[4];
const educateLevel = process.argv[5];

var allFileName = [];
getAllFolderFileName(mdParam);

function getAllFolderFileName(folderName) {
    console.log("readFolder folderName : " + folderName);
    fs.readdir(folderName, function (err, files) {
        if (err) {
            console.log('error:\n' + err);
            return;
        }
        files.forEach(function (file) {
            if (file.endsWith('.md')) {
                allFileName.push(file);
            }
        });
    });
}

console.log("allFileName: " + allFileName);

readFolder(mdParam);

/**
 * 读取目录中的MD文件
 * @param folderName
 */
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
                            if (!exist) {
                                console.log('not exist make dir outFolder :' + outFolder);
                                fs.mkdirSync(outFolder);
                            }
                            outFileName = outFolder + '/' + file.replace('.md', '.html');
                        }
                        folderName.trim();
                        outFileName.trim();
                        console.log('mdFile:' + mdFile + ' outFileName :' + outFileName);
                        convertFile(mdFile, outFileName, file);
                    }
                }
            });
        });
    });
}

/**
 * Mardown文件转化为html文件
 * @param mdFile
 * @param outHtmlFile
 */
function convertFile(mdFile, outHtmlFile, fileName) {
    const mdData = fs.readFileSync(mdFile, 'utf-8');
    let converter = new showdown.Converter();
    let htmlData = converter.makeHtml(mdData);
    console.log("outHtmlFile : " + outHtmlFile);
    let outFolder = path.dirname(outHtmlFile);
    mkdirs(outFolder);
    const num = parseInt(fileName.split('.')[0]);
    let context = {};
    context.title = fileName.replace('.md', '');
    context.content = htmlData;
    context.educate = educateStr;
    context.level = educateLevel;
    context.last = getLast(num);
    context.next = getNext(num);
    console.log("context: " + context);
    let finalHtmlData = convert(context);
    fs.writeFileSync(outHtmlFile, finalHtmlData);
    console.log("OK.");
}

/**
 * 递归创建目录
 * @param dirPath 创建目录名
 */
function mkdirs(dirPath) {
    if (!fs.existsSync(dirPath)) {
        let dirName = path.dirname(dirPath);
        let exist = fs.existsSync(dirName);
        if (exist) {
            fs.mkdirSync(dirPath);
        } else {
            mkdirs(dirName);
        }
    }
}

/**
 * 转化handlebars模板
 * @param context
 * @return {*}
 */
function convert(context) {
    const mustache_data = fs.readFileSync("template.hbs", 'utf-8');
    const compiled = Handlebars.compile(mustache_data);
    return compiled(context);
}

/**
 * 获取上一篇链接
 * @param num
 * @return {*}
 */
function getLast(num){
    const lastNum = num - 1;
    const lastFileStart = lastNum + ".";

    let i = 0, length = allFileName.length;
    for (; i < length; i++) {
        if(allFileName[i].startsWith(lastFileStart)) {
            return allFileName[i].replace('.md', '.html');
        }
    }
    return null;
}
/**
 * 获取下一篇链接
 * @param num
 * @return {*}
 */
function getNext(num){
    const nextNum = num + 1;
    const nextFileStart = nextNum + "." ;

    let i = 0, length = allFileName.length;
    for (; i < length; i++) {
        if(allFileName[i].startsWith(nextFileStart)) {
            return allFileName[i].replace('.md', '.html');
        }
    }
    return null;
}