import { TextEditor, window } from "vscode";

export class Editor {

  private _editor: TextEditor = window.activeTextEditor;

  private static _self: Editor = null;


  public static getInstance(): Editor {
    if (Editor._self === null) {
      Editor._self = new Editor();
    }
    return Editor._self;
  }

  public sendAline(): string {
    let text: string = this._editor.document.lineAt(this._editor.selection.start).text;
    // console.log('sendAline: ', text);
    return text;
  }

  public sendAll() {
    let text = this._editor.document.getText();
    // console.log('sendAll: ', this._editor.document.getText());
    return text;
  }

  public sendSelect() {
    let text: string = this._editor.document.getText(this._editor.selection);
    // console.log('sendSelect: ', text);
    return text
  }

}


