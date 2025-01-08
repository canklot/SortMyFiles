import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';

let configName = '.order';

function modifyLastChangedDateForFiles(fileList: string[]) {
    // Get current date and time
    for (let path of fileList) {
        let newModifiedDate = new Date();
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
    const workspaceConfig = vscode.workspace.getConfiguration('explorer');
    workspaceConfig.update('sortOrder', 'modified', vscode.ConfigurationTarget.Workspace);
    console.log("sort changed to modify");
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

function sortFiles() {
    let fileOrder = getConfig();
    let filePaths = prefixWithProjectPath(fileOrder);
    modifyLastChangedDateForFiles(filePaths);
}

export function activate(context: vscode.ExtensionContext) {
    changeDefaultSortOrder();

    vscode.workspace.onDidSaveTextDocument((document) => {

        sortFiles();
        console.log("re order completed");
    });
}

export function deactivate() { }
