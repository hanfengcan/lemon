# lemon
> 一个为vscode提供串口功能的扩展插件  

### 前置说明
串口模块使用[node-serialport](https://github.com/node-serialport/node-serialport),在electron环境下需要重新编译才能使用.编译需要py2.7(不支持py3)、gyp、msbuild.  

建议可以在node环境下编译执行node-serialport后再测试electron环境下的编译  

Windows用户可以根据情况修改`set.bat`后执行


### 使用说明  
当文件夹下面有`.serialport`时,会自动激活插件。

支持设置起始位、数据位、停止位。
支持右键发送一行文本、选择的文本、全文。


**卸载插件需要在插件未激活的情况下卸载**
