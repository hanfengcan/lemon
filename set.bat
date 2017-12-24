:: Electron 的版本。
set npm_config_target=1.7.9
:: Electron 的系统架构, 值为 ia32 或者 x64。
set npm_config_arch=x64
set npm_config_target_arch=x64
:: 下载 Electron 的 headers。
set npm_config_disturl=https://atom.io/download/electron
:: 告诉 node-pre-gyp 是为 Electron 构建。
set npm_config_runtime=electron
:: 告诉 node-pre-gyp 从源代码构建模块。
set npm_config_build_from_source=true


set PYTHON=D:\Python27
set path=C:\Windows\Microsoft.NET\Framework64\v4.0.30319;%path%


npm install serialport --save