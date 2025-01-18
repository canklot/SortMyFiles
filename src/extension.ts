import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';

let configName = '.order';
const outputChannel = vscode.window.createOutputChannel('SortMyFiles');

function modifyLastChangedDateForFiles(fileList: string[]) {

    let milliseconds = 0;
    for (let path of fileList) {
        try {
            let newModifiedDate = new Date(Date.now() + milliseconds);
            milliseconds += 1;
            utimesSync(path, newModifiedDate, newModifiedDate);
        } catch (error) {
            outputChannel.appendLine(`Failed to modify last changed date for file: ${path}`);
            outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            outputChannel.appendLine(''); // Add a blank line for readability
        }
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

function changeDefaultSortOrder(newValue: string) {
    let workspaceConfig = vscode.workspace.getConfiguration('explorer');
    workspaceConfig.update('sortOrder', newValue, vscode.ConfigurationTarget.Workspace);
    outputChannel.appendLine("sort changed to " + newValue);
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
    let fileOrder: string[];
    try {
        fileOrder = getConfig();
    } catch (error) {
        if (error instanceof URIError) {
            outputChannel.appendLine("Workspace path not detected. Please open a workspace.");
        } else if (error instanceof Error && error.message.includes('ENOENT')) {
            outputChannel.appendLine(`Config file "${configName}" not found.`);
        } else if (error instanceof Error) {
            outputChannel.appendLine(`Failed to load configuration: ${error.message}`);
        } else {
            outputChannel.appendLine('An unknown error occurred.');
        }
        return; // Exit the function if the config could not be loaded
    }
    let filePaths = prefixWithProjectPath(fileOrder);
    modifyLastChangedDateForFiles(filePaths);
    outputChannel.appendLine("Sorting completed");
}

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidSaveTextDocument((document) => {
        sortFiles();
    });
    changeDefaultSortOrder('modified');
    sortFiles();
}

export function deactivate() {
    changeDefaultSortOrder('default');
}
