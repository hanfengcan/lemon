import * as sport from "serialport";
import { OutputChannel } from "vscode";

import * as os from "os";

export class serialCtrl {

  private _portName : string = null;
  private _portCtrl : any = null;
  private _option : any = { autoOpen: false, baudRate: 115200 };

  /**
   * @description 获取COM列表
   */
  public static list() : Promise<any[]> {
    return new Promise((resolve, reject) => {
      sport.list((e: any, ports: {comName: string}[]) => {
        if (e) {
          reject(e);
        } else {
          resolve(ports);
        }
      })
    });
  }

  public get isOpen(): boolean {
    return this._portCtrl && this._portCtrl.isOpen();
  }

  public constructor(private _outputChannel: OutputChannel) {

  }

  /**
   * @description 创建一个COM
   */
  public create(port, option): boolean {
    // COM已创建过
    if(this._portCtrl) {
      if (port != this._portCtrl.path) {
        // 关闭原先的COM
        let result = this.close();
        if (result) {
          return false;
        }
      } else {
        // 指定COM已创建过
        return true;
      }
    }
    this._portName = port;
    this._option = { ...this._option, option }
    this._portCtrl = new sport(this._portName, this._option);
    return true;
  }

  /**
   * @description 打开COM
   */
  public open(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._portCtrl) {
        reject(new Error('串口没有创建'));
        return;
      }

      if (this._portCtrl.isOpen) {
        // 串口打开
        reject(new Error('串口已经打开'));
      } else {
        // 串口没有打开
        this._portCtrl.open((err) => {
          if (err) {
            return reject(err);
          }
          // 事件绑定
          this._portCtrl.on('close', (err) => {
            if (!err) {
              this._outputChannel.appendLine(`[结束] 关闭串口 ${os.EOL}`);
            } else if (err.disconnected) {
              this._outputChannel.appendLine(`[结束] 断开连接 ${os.EOL}`);
            }
          })
          this._portCtrl.on('data', (data) => {
            this._outputChannel.append(data.toString());
          })
          this._portCtrl.on('error', (err) => {
            this._outputChannel.appendLine(`[错误] ${err.toString()} ${os.EOL}`);
          })
          this._outputChannel.appendLine(`[开启] ${this._portName}`)
          resolve()
        })
      }
    })
  }

  /**
   * @description 关闭COM
   */
  public close(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._portCtrl) {
        reject(new Error('串口没有创建'));
        return
      }

      if (!this._portCtrl.isOpen) {
        // 串口没有打开啊
        reject(new Error('串口没有打开'));
      } else {
        // 等待数据发送完再关闭串口
        this._portCtrl.drain((err) => {
          if (err) {
            reject(err)
          } else {
            this._portCtrl.close((err) => {
              if (err) {
                return reject(err);
              }
              this._portCtrl = null;
              resolve();
            })
          }
        })
      }
    })
  }

  /**
   * @description 对打开的COM口修改波特率
   * @param baudRate
   */
  public changeBaudRate(baudRate: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._portCtrl) {
        reject(new Error('串口没有创建'));
        return
      }

      if(this._portCtrl.isOpen) {
        this._portCtrl.update(baudRate, (err) => {
          if (!err) {
            resolve();
          } else {
            reject(err);
          }
        })
      } else {
        reject(new Error('串口没有打开'));
      }
    })
  }

  /**
   * @description 发送数据
   * @param msg 
   */
  public sendMsg(msg: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._portCtrl) {
        reject(new Error('串口没有创建'));
        return
      }

      if (this._portCtrl.isOpen) {
        this._portCtrl.write(msg, () => {
          resolve()
        })
      } else {
        reject(new Error('串口没有打开'))
      }
    })
  }
}


