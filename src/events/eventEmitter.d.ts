import * as vscode from "vscode";
declare class EventEmitter {
    _onFatalError: vscode.EventEmitter<void>;
    _onQueryStart: vscode.EventEmitter<void>;
    _onQueryComplete: vscode.EventEmitter<void>;
}
declare const eventEmitter: EventEmitter;
export { eventEmitter };
//# sourceMappingURL=eventEmitter.d.ts.map