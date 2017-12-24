# lemon
> 一个为vscode提供串口功能的扩展插件  

### 前置说明
串口模块使用[node-serialport](https://github.com/node-serialport/node-serialport),在electron环境下需要重新编译才能使用.编译需要py2.7(不支持py3)、gyp、msbuild.  

建议可以在node环境下编译执行node-serialport后再测试electron环境下的编译  

Windows用户可以根据情况修改`set.bat`后执行