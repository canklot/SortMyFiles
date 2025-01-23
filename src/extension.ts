import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { findAllFilesAndFoldersWithIgnore, getGitignoreFiles } from './findFiles';
import { outputChannel } from './logging';
import { getConfig } from './config';
import { alpahabeticalllySortFiles } from './sortingFunctions';

function modifyLastChangedDateForFiles(fileList: string[]) {
    let milliseconds = 0;
    for (let path of fileList) {
        try {
            let newModifiedDate = new Date(Date.now() + milliseconds);
            milliseconds += 1;
            utimesSync(path, newModifiedDate, newModifiedDate);
            //outputChannel.appendLine(path);
        } catch (error) {
            outputChannel.appendLine(`Failed to modify last changed date for file: ${path}`);
            outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            outputChannel.appendLine(''); // Add a blank line for readability
        }
    }
}

function changeDefaultSortOrder(newValue: string) {
    let workspaceConfig = vscode.workspace.getConfiguration('explorer');
    workspaceConfig.update('sortOrder', newValue, vscode.ConfigurationTarget.Workspace);
    outputChannel.appendLine("sort changed to " + newValue);
}

async function sortFiles() {
    let fileOrder = getConfig();
    let sortedNonConfigFiles = await sortNonConfigFiles(fileOrder);
    let combinedList = [...sortedNonConfigFiles, ...fileOrder];
    modifyLastChangedDateForFiles(combinedList);
    outputChannel.appendLine("Sorting completed");
}

async function sortNonConfigFiles(config: string[] = []): Promise<string[]> {
    let workspaceUri = vscode.workspace.workspaceFolders?.map(folder => folder.uri).at(0);
    if (!workspaceUri) { throw new URIError("No workspace detected"); }
    let filesAndFolders = new Set<string>();
    let ignorePattern = getGitignoreFiles();

    await findAllFilesAndFoldersWithIgnore(workspaceUri, filesAndFolders, ignorePattern);
    let nonConfigFilesAndFolders = Array.from(filesAndFolders).filter(name => !config.includes(name));
    let alpahabeticalllySorted = alpahabeticalllySortFiles(nonConfigFilesAndFolders);
    //modifyLastChangedDateForFiles(alpahabeticalllySorted);
    return alpahabeticalllySorted;
}


export function activate(context: vscode.ExtensionContext) {
    vscode.workspace.onDidSaveTextDocument((document) => {
        // Everytime a save detected, sort the files
        sortFiles();
    });
    // Run the sortFiles function when the extension is activated
    changeDefaultSortOrder('modified');
    sortFiles();

}

export function deactivate() {
    changeDefaultSortOrder('default');
}
