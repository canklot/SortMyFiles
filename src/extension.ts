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

function getGitignoreFiles(): string[] {
    try {
        let workspacePath = getProjectPath();
        let gitignorePath = workspacePath + '.gitignore';
        let fileContent = readFileSync(gitignorePath, 'utf-8');
        let lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
        return lines;
    } catch (error) {
        return [];
    }
}

async function getAllFilesInWorkspace() {
    let fileList: string[] = [];
    let removedComments = getGitignoreFiles().filter(item => item.charAt(0) !== '#');
    let removedEmptyLines = removedComments.filter(item => item !== '');
    let prefixedGitignoreFiles = removedEmptyLines.map(file => "**/" + file + "**");
    let trimmedGitignoreFiles = prefixedGitignoreFiles.map(file => file.trim());
    let ignorePatterns = trimmedGitignoreFiles.join(',');
    ignorePatterns = `{${ignorePatterns}}`;
    // `{${ignorePatterns}}`
    // `*/bin`
    // `{*/obj,*/bin}`
    let uris = await vscode.workspace.findFiles('', ignorePatterns, 10000);
    let workspace = vscode.workspace.workspaceFolders?.map(folder => folder.uri).at(0);
    if (!workspace) { throw new URIError("No workspace detected"); }
    let allFolders = await vscode.workspace.fs.readDirectory(workspace);

    for (let uri of uris) {
        let path = uri.path.slice(1); // remove the first slash
        fileList.push(path);
    }
    return fileList;
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
    let filePaths = prefixWithProjectPath(lines);
    return filePaths;
}

function getProjectPath(): string {
    let workspaceUriPath = vscode.workspace.workspaceFolders?.map(folder => folder.uri.path).at(0);
    if (!workspaceUriPath) { throw new URIError("No workspace detected"); }
    let workspacePath = workspaceUriPath.slice(1);
    workspacePath = workspacePath + "/";
    return workspacePath;
}

async function sortFiles() {
    let fileOrder: string[];
    try {
        fileOrder = getConfig();
    } catch (error) {
        // Exception handling should be done in the getconfig function not here
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

    modifyLastChangedDateForFiles(fileOrder);
    let allFilesInWorkspace = await getAllFilesInWorkspace();
    let restOfTheFiles = allFilesInWorkspace.filter(file => !fileOrder.includes(file));
    let alpahabeticalllySortedFiles = restOfTheFiles.sort();
    modifyLastChangedDateForFiles(alpahabeticalllySortedFiles);

    outputChannel.appendLine("Sorting completed");
}

export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidSaveTextDocument((document) => {
        sortFiles();
        let allFiles = getAllFilesInWorkspace();
        console.log(allFiles);
    });
    changeDefaultSortOrder('modified');
    sortFiles();
}

export function deactivate() {
    changeDefaultSortOrder('default');
}
