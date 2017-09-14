"use strict";
const fs = require('fs');
const path = require("path");
const showdown = require('sinbad_showdown');
const Handlebars = require("handlebars");

/** Check for arguments*/
if (process.argv.length < 6) {
	console.log("Usage: node md2html.js FOLDER_NAME OUT_FOLDER_NAME article_path article_path_sub_folder");
	process.exit(1);
}

const mdParam = process.argv[2];
const htmlParam = process.argv[3];
const article_type = process.argv[4];
const article_path_sub_folder = process.argv[5];

const article_config = require("./configure_" + article_type + ".json");

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
						if (folderName === mdParam) {
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
	let outFolder = path.dirname(outHtmlFile);
	mkdirs(outFolder);
	/** 不转化index.md, 采用单独的模板, 这里只转化文章内容*/
	console.log("-------------------------------------------------------");
	console.log("convertFile fileName " + fileName);
	console.log("-------------------------------------------------------");
	const num = parseInt(fileName.split('.')[0]);
	/** 配置表中加入其它参数*/
	article_config.title = fileName.replace('.md', '');
	article_config.content = htmlData;
	article_config.last = getLast(num);
	article_config.next = getNext(num);
	article_config.article_type = article_type;
	article_config.sub_folder = article_path_sub_folder;
	article_config.tab_content[article_path_sub_folder].isActive = "true";
	/** 读取handlebars模板数据*/
	const mustache_data = fs.readFileSync("template_article.hbs", 'utf-8');
	/** 转化为html数据*/
	const compiled = Handlebars.compile(mustache_data);
	let firstHtmlData = compiled(article_config);
	/** 写入文件*/
	fs.writeFileSync(outHtmlFile, firstHtmlData);
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
 * 获取上一篇链接
 * @param num
 * @return {*}
 */
function getLast(num) {
	const lastNum = num - 1;
	const lastFileStart = lastNum + ".";
	
	let i = 0, length = allFileName.length;
	for (; i < length; i++) {
		if (allFileName[i].startsWith(lastFileStart)) {
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
function getNext(num) {
	const nextNum = num + 1;
	const nextFileStart = nextNum + ".";
	
	let i = 0, length = allFileName.length;
	for (; i < length; i++) {
		if (allFileName[i].startsWith(nextFileStart)) {
			return allFileName[i].replace('.md', '.html');
		}
	}
	return null;
}