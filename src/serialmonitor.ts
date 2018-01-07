/**
 * 串口配置模块 view
 */
import * as vscode from 'vscode'
import {window, StatusBarAlignment, StatusBarItem, QuickPickItem, OutputChannel, Terminal} from 'vscode'

import * as sport from "serialport";
import { serialCtrl } from "./serialCtrl"
import { Editor } from "./textEditor" 

import { port } from '_debugger';
import { fail } from 'assert';

export class serialMonitor {

  private _portsStatusBarItem : StatusBarItem;
  private _baudRateStatusBarItem : StatusBarItem;
  private _DPSStatusBarItem : StatusBarItem;
  private _openStatusBarItem : StatusBarItem;
  private _outputChannel : OutputChannel;
  // private _Terminal : Terminal;

  private _currentBaudRate : number;
  private _currentCom : string;
  private _openStatus : boolean = false;

  private _portCtrl : serialCtrl = null;
  private _editor : Editor = null;

  private _dataBit = serialMonitor.DEFAULT_DATA_BIT;
  private _parity = serialMonitor.DEFAULT_PARITY;
  private _stopBit = serialMonitor.DEFAULT_STOP_BIT;

  private static _serialMonitor: serialMonitor = null;

  public static DEFAULT_BAUD_RATE : number = 115200; // 默认波特率
  public static DEFAULT_DATA_BIT : number = 8; // 数据位
  public static DEFAULT_PARITY : string = 'none'; // 校验位
  public static DEFAULT_STOP_BIT : number = 1; // 停止位

  public static listBaudRate() : number[] {
    return [ 300, 1200, 2400, 4800, 9600, 14400, 19200, 38400, 57600, 115200 ];
  }

  public static dataBit() : string[] {
    return ['8', '7', '6', '5'];
  }

  public static parity() : string[] {
    return ['none', 'even', 'mark', 'odd', 'space'];
  }

  public static stopBit() : string[] {
    return ['1', '2'];
  }

  private constructor() {
    this.init()
  }

  private openUpdate(status: boolean) {
    //开启串口
    if (status === true) {
      this._openStatusBarItem.command = "port.close";
      this._openStatusBarItem.text = `$(x)`;
      this._openStatusBarItem.tooltip = "关闭串口";
      this._openStatusBarItem.show();

      this._openStatus = true;
    } else {
      this._openStatusBarItem.command = "port.open";
      this._openStatusBarItem.text = `$(plug)`;
      this._openStatusBarItem.tooltip = "打开串口";
      this._openStatusBarItem.show();

      this._openStatus = false;
    }
  }

  public init () {
    this._currentBaudRate = serialMonitor.DEFAULT_BAUD_RATE;
    this._currentCom = null;

    this._outputChannel = window.createOutputChannel("Serial port");
    this._outputChannel.show();
    // this._Terminal = window.createTerminal({name: 'SerialPort'});
    // this._Terminal.show();

    this._editor = Editor.getInstance();
    // console.log(this._editor);
    this._portCtrl = new serialCtrl(this._outputChannel, this._editor.insertText);

    this._portsStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 2);
    this._portsStatusBarItem.command = "port.select";
    this._portsStatusBarItem.tooltip = "选择COM口";
    this._portsStatusBarItem.text = "<COM?>";
    this._portsStatusBarItem.show();

    this._baudRateStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 3);
    this._baudRateStatusBarItem.command = "port.baudrate";
    this._baudRateStatusBarItem.tooltip = "选择波特率";
    this._baudRateStatusBarItem.text = serialMonitor.DEFAULT_BAUD_RATE.toString();
    this._baudRateStatusBarItem.show();

    this._DPSStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 4);
    this._DPSStatusBarItem.command = "port.dataparitystop";
    this._DPSStatusBarItem.tooltip = "8-N-1";
    this._DPSStatusBarItem.text = "8-N-1";
    this._DPSStatusBarItem.show();

    this._openStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 5);
    this._openStatusBarItem.command = "port.open";
    this._openStatusBarItem.tooltip = "打开串口";
    this._openStatusBarItem.text = `$(plug)`;
    this._openStatusBarItem.show();
    
  }

  public static getInstance(): serialMonitor {
    if (serialMonitor._serialMonitor === null) {
      serialMonitor._serialMonitor = new serialMonitor();
    }
    return serialMonitor._serialMonitor;
  }

  public dispose() {
    return this._portCtrl.close();
  }

  /**
   * COM口选择
   */
  public async portSelect () {
    // window.showInformationMessage("select a port")
    // window.showQuickPick(["COM1", "COM2"]);
    // portCtrl.list(async(flag, arg) => {
    //   if (flag === true) {
    //     const com = await window.showQuickPick(arg);
    //     if (!com) {
    //       console.warn('什么COM口都没有选择');
    //       return;
    //     }
    //     this._currentCom = com;
    //     this._portsStatusBarItem.text = this._currentCom;
    //   } else {
    //     window.showErrorMessage(arg)
    //   }
    // })
    const lists = await serialCtrl.list();
    if (!lists.length) {
      window.showInformationMessage('没有串口');
      return;
    }

    const chosen = await window.showQuickPick(<string[]>lists.map((l:any): string => {
      return l.comName;
    }), { placeHolder: "Select a serial port" });
    if (!chosen) {
      console.warn('什么COM口都没有选择');
      return;
    }
    this._currentCom = chosen;
    this._portsStatusBarItem.text = this._currentCom;
  }

  /**
   * 波特率选择
   */
  public async changeBaudRate () {
    const baudrate = serialMonitor.listBaudRate();
    const chosen = await window.showQuickPick(baudrate.map((br) => br.toString()));

    if (!chosen) {
      console.warn('什么波特率都没有选择');
      return;
    }

    const choseBaudRate : number = parseInt(chosen, 10);
    if (!choseBaudRate) {
      console.warn('无效的波特率');
      return;
    }

    this._currentBaudRate = choseBaudRate;
    this._baudRateStatusBarItem.text = chosen;
    // 如果串口打开,更新波特率
    if (this._portCtrl.isOpen) {
      this._portCtrl.changeBaudRate(this._currentBaudRate);
    }
  }

  /**
   * 数据位 校验位 停止位选择
   */
  public async changeDPS () {

    // 数据位
    const cdataBit = (await window.showQuickPick(serialMonitor.dataBit()));

    if (!cdataBit) {
      console.warn('没有选择数据位');
    } else {
      const ndataBit : number = parseInt(cdataBit, 10);
      if (!ndataBit) {
        console.warn('无效的数据位');
      } else {
        this._dataBit = ndataBit;
      }
    }

    // 校验位
    const cparity = await window.showQuickPick(serialMonitor.parity());

    if (!cparity) {
      console.warn('没有选择校验位');
    } else {
      this._parity = cparity;
    }

    // 停止位
    const cstopBit = await window.showQuickPick(serialMonitor.stopBit());

    if (!cstopBit) {
      console.warn('没有选择停止位');
    } else {
      const nstopBit : number = parseInt(cstopBit, 10);
      if (!nstopBit) {
        console.warn('无效的停止位');
      } else {
        this._stopBit = nstopBit;
      }
    }

    const p = this._parity.substring(0,1).toUpperCase();
    this._DPSStatusBarItem.text = `${this._dataBit}-${p}-${this._stopBit}`;
  }

  /**
   * 开关串口
   */
  public async open () {
    if (this._openStatus === false) {
      // 打开串口
      if (this._currentCom) {
        let result = this._portCtrl.create(
          this._currentCom, 
          {
            baudRate: this._currentBaudRate,
            dataBits: this._dataBit,
            stopBits: this._parity,
            parity: this._stopBit,
          }
        )
        if(result) {
          await this._portCtrl.open(() => {
            this.openUpdate(false);
          })
          .then(() => {
            this.openUpdate(true);
          })
          .catch((err) => {
            window.showErrorMessage(err.message);
          })
        }
      } else {
        // window.showWarningMessage("请先选择COM口");
        this.portSelect();
      }
    } else {
      // 关闭串口
      this.close();
    }
  }

  public async close() {
    await this._portCtrl.close()
    .then(() => {
      this.openUpdate(false);
    })
    .catch((err) => {
      this.openUpdate(false);
      window.showErrorMessage(err.message);
    })
  }

  public async sendMessage() {
    if (this._portCtrl.isOpen) {
      let result = await window.showInputBox({placeHolder: '输入文本'});
      if (result) {
        this._portCtrl.sendMsg(result);
        // this._editor.insertText(result);
      }
    } else {
      window.showErrorMessage('请先打开串口');
    }
  }

  public sendAline() {
    if (this._portCtrl.isOpen) {
      let text = this._editor.sendAline();
      this._portCtrl.sendMsg(text);
    } else {
      window.showErrorMessage('请先打开串口');
    }
  }

  public sendAll() {
    if (this._portCtrl.isOpen) {
      let text = this._editor.sendAll();
      this._portCtrl.sendMsg(text);
    } else {
      window.showErrorMessage('请先打开串口');
    }
  }

  public sendSelect() {
    if (this._portCtrl.isOpen) {
      let text = this._editor.sendSelect();
      this._portCtrl.sendMsg(text);
    } else {
      window.showErrorMessage('请先打开串口');
    }
  }

  public async outputDoc() {
    let result
    if (Editor.activeTextEditor) {
      await window.showInformationMessage("将数据输出到文件", "Y", "N");
    } else {
      await window.showInformationMessage("没有可输出文件, 只能输出到默认位置");
    }
    if (result === 'Y') {
      this._portCtrl.outputDoc = true;
    } else {
      this._portCtrl.outputDoc = false;
    }
  }
}
