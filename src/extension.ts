import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';

let configName = '.order';

function modifyLastChangedDateForFiles(fileList: string[]) {
    let milliseconds = 1000;
    for (let path of fileList) {
        let newModifiedDate = new Date(Date.now() + milliseconds);
        milliseconds += 1000;
        utimesSync(path, newModifiedDate, newModifiedDate);
    }
}

function prefixWithProjectPath(fileList: string[]): string[] {
    let workspacePath = getProjectPath();
    let prefixedList: string[] = [];
    for (let filename of fileList) {
        prefixedList.push(workspacePath + filename);
    }
    return prefixedList;
}

function changeDefaultSortOrder() {
    let workspaceConfig = vscode.workspace.getConfiguration('explorer');
    workspaceConfig.update('sortOrder', 'modified', vscode.ConfigurationTarget.Workspace);
    console.log("sort changed to modify");
}

function getConfig(): string[] {
    let customOrderPath = getProjectPath() + configName;
    let fileContent = readFileSync(customOrderPath, 'utf-8');
    let lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
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

function sortFiles() {
    let fileOrder = getConfig();
    let filePaths = prefixWithProjectPath(fileOrder);
    modifyLastChangedDateForFiles(filePaths);
    console.log("Sorting completed");
}

export function activate(context: vscode.ExtensionContext) {
    changeDefaultSortOrder();
    sortFiles();

    vscode.workspace.onDidSaveTextDocument((document) => {
        sortFiles();

    });
}

export function deactivate() { }
