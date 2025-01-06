import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';

let configName = '.order';
let stringToAdd = "-a";

function modifyLastChangedDateForFiles(fileList: string[]) {
    // Get current date and time
    const newModifiedDate = new Date();
    for (let path of fileList) {
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

function appendStringToFiles(fileList: string[], stringToAdd: string): void {
    fileList = prefixWithProjectPath(fileList);
    for (let path of fileList) {
        console.log(path);
        appendFileSync(path, stringToAdd, 'utf8');
    }
}

export function activate(context: vscode.ExtensionContext) {
    changeDefaultSortOrder();

    vscode.workspace.onDidSaveTextDocument((document) => {
        let fileOrder = getConfig();
        //appendStringToFiles(fileOrder, stringToAdd);
        let filePaths = prefixWithProjectPath(fileOrder);
        modifyLastChangedDateForFiles(filePaths);

        console.log("re order completed");
    });
}

export function deactivate() { }
