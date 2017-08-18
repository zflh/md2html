# md2html
大屎蛋编程网-dashidan.com 自研工具系列之markdown转html

基于github上著名转化工具showdown基础上二次开发.
改善部分:
1. 加入了通过命令行转化文件的功能.不用写代码直接敲入命令行即可转化.
2. 单文件和目录级转化.
3. 支持目录嵌套,转化后保留原有层级关系.
4. 加入google pretty code的class类支持.支持代码区关键字变色.


markdown转化为html的工具,采用nodejs语言编写.

命令行:

	单个文件转化:
	node md2html.js -e MD_FILE OUT_HTML_FILE")
	目录转化转化:
	node md2html.js -r FOLDER_NAME OUT_FOLDER_NAME

