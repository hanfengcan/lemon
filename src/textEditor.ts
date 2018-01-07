import { TextEditor, window, Position } from "vscode";

export class Editor {

  // private _editor: TextEditor = window.activeTextEditor;

  private static _self: Editor = null;


  public static getInstance(): Editor {
    if (Editor._self === null) {
      Editor._self = new Editor();
    }
    return Editor._self;
  }

  public static get activeTextEditor(): any {
    return window.activeTextEditor;
  }

  public sendAline(): string {
    let editor = Editor.activeTextEditor;
    let text: string = editor.document.lineAt(editor.selection.start).text;
    // console.log('sendAline: ', text);
    return text;
  }

  public sendAll() {
    let editor = Editor.activeTextEditor;
    let text = editor.document.getText();
    // console.log('sendAll: ', this._editor.document.getText());
    return text;
  }

  public sendSelect() {
    let editor = Editor.activeTextEditor;
    let text: string = editor.document.getText(editor.selection);
    // console.log('sendSelect: ', text);
    return text
  }

  /**
   * @description 在最后一行插入文本
   * @param text 
   */
  public insertText(text: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let edit = Editor.activeTextEditor;
      if (!edit) {
        reject(false);
        return
      }
      edit.edit((e) => {
        let p = new Position(edit.document.lineCount, 0);
        e.insert(p, text);
      }).then(() => {
        resolve(true);
      })
    })
  }
}


