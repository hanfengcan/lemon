'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import  { serialMonitor } from './serialmonitor'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "pitaya" is now active!');

    const serialmonitor = serialMonitor.getInstance();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = vscode.commands.registerCommand('serialport.select', () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     // vscode.window.showInformationMessage('Hello World!');
    //     serialmonitor.portSelect()
    // });
    context.subscriptions.push(serialmonitor);
    context.subscriptions.push(vscode.commands.registerCommand('port.select', () => {
        serialmonitor.portSelect();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.baudrate', () => {
        serialmonitor.changeBaudRate();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.dataparitystop', () => {
        serialmonitor.changeDPS();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.open', () => {
        serialmonitor.open();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.close', () => {
        serialmonitor.open();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.input', () => {
        serialmonitor.sendMessage();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('port.sendALine', () => {
        serialmonitor.sendAline();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.sendAll', () => {
        serialmonitor.sendAll();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('port.sendSelect', () => {
        serialmonitor.sendSelect();
    }));

    context.subscriptions.push(vscode.commands.registerCommand('port.toDoc', () => {
        serialmonitor.outputDoc();
    }));

    // 执行一条命令->告知插件被激活
    vscode.commands.executeCommand('setContext', 'serialport', true);
    // console.log(vscode.commands.getCommands());
}

// this method is called when your extension is deactivated
export function deactivate() {
    const serialmonitor = serialMonitor.getInstance();
    serialmonitor.close();
}
