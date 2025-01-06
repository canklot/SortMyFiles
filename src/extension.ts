import * as vscode from 'vscode';
import { readFileSync, appendFileSync } from 'fs';

let configName = '.order';
let stringToAdd = "-a";


function changeSortOrder() {
    const workspaceConfig = vscode.workspace.getConfiguration('explorer');
    workspaceConfig.update('sortOrder', 'modified', vscode.ConfigurationTarget.Workspace);
}

function getConfig(): string[] {
    let customOrderPath = getProjectPath() + configName;
    let fileContent = readFileSync(customOrderPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
    lines.reverse();
    return lines;
}

function getProjectPath(): string {
    let workspaceUriPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path).at(0);
    if (!workspaceUriPath) { throw new URIError("No workspace detected"); }
    let workspacePath = workspaceUriPath.slice(1);
    workspacePath = workspacePath + "/";
    return workspacePath;
}

function appendStringToFiles(fileList:string[],stringToAdd:string): void {
    let workspacePath = getProjectPath();
    for (let filename of fileList) {
        console.log(filename);
        let filePath = workspacePath + filename;
        appendFileSync(filePath, stringToAdd, 'utf8');
    }
}

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidSaveTextDocument((document) => {
        let fileOrder = getConfig();
        appendStringToFiles(fileOrder,stringToAdd);
        console.log("re order completed");
    });
}

export function deactivate() { }
