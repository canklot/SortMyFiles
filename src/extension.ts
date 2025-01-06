import * as vscode from 'vscode';
import { readFileSync, appendFileSync } from 'fs';

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidSaveTextDocument((document) => {
        let stringToAdd = "-a";
        let customOrderFileName = '.order';

        let workspaceUriPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path).at(0);
        if (!workspaceUriPath) { return; }
        let workspacePath = workspaceUriPath.slice(1);
        workspacePath = workspacePath + "/";
        let customOrderPath = workspacePath + customOrderFileName;
        let fileContent = readFileSync(customOrderPath, 'utf-8');
        const lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
        lines.reverse();
        for (let line of lines) {
            console.log(line);
            let toOrderPath = workspacePath + line;
            appendFileSync(toOrderPath, stringToAdd, 'utf8');
        }

        console.log("re order completed");
    });
}

export function deactivate() { }
