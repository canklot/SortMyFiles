import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { findAllFilesAndFoldersWithIgnore, getGitignoreFiles } from './findFiles';
import { outputChannel } from './logging';
import { getConfig, getRegexLines, regularExpressionTag, getConfigMode, ConfigMode } from './config';
import { alpahabeticalllySortFiles } from './sortingFunctions';
import { hugoSortFiles } from './hugoSorting';

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
    // Get current config mode
    const configMode = getConfigMode();

    if (configMode === ConfigMode.ORDER) {
        // In .order mode, we need a config file
        let fileOrder = getConfig();
        if (fileOrder.length === 0) {
            // if config does not exist in .order mode, do nothing
            return;
        }
        fileOrder = fileOrder.filter(line => !line.startsWith(regularExpressionTag));
        let prefixedFileOrder = prefixWithProjectPath(fileOrder);
        let sortedNonConfigFiles = await getNonConfigFilesSorted();
        let combinedList = [...sortedNonConfigFiles, ...prefixedFileOrder];
        modifyLastChangedDateForFiles(combinedList);
    } else if (configMode === ConfigMode.HUGO) {
        // In Hugo mode, we just sort all files using the Hugo sorting algorithm
        let sortedFiles = await getNonConfigFilesSorted();
        modifyLastChangedDateForFiles(sortedFiles);
    }

    outputChannel.appendLine("Sorting completed");
}

function putFilesFitsToRegexPatternToEnd(fileOrder: string[], regexLines: string[]): string[] {
    // remote regex tag from regex lines and get the files that fits to regex pattern
    let filesFitsToRegexPattern = fileOrder.filter(file => regexLines.some(regex => file.match(regex.slice(8))));
    let filesNotFitsToRegexPattern = fileOrder.filter(file => !filesFitsToRegexPattern.includes(file));
    return [...filesNotFitsToRegexPattern, ...filesFitsToRegexPattern];
}

async function getNonConfigFilesSorted(): Promise<string[]> {
    let config = getConfig();
    let workspaceUri = vscode.workspace.workspaceFolders?.map(folder => folder.uri).at(0);
    if (!workspaceUri) { throw new URIError("No workspace detected"); }
    let filesAndFolders = new Set<string>();
    let ignorePattern = getGitignoreFiles();

    await findAllFilesAndFoldersWithIgnore(workspaceUri, filesAndFolders, ignorePattern);
    let nonConfigFilesAndFolders = Array.from(filesAndFolders).filter(name => !config.includes(name));

    // Use different sorting strategies based on the selected mode
    const configMode = getConfigMode();

    if (configMode === ConfigMode.HUGO) {
        // In Hugo mode, use the Hugo-specific sorting algorithm
        outputChannel.appendLine("Using Hugo mode sorting");
        return hugoSortFiles(nonConfigFilesAndFolders);
    } else {
        // In .order mode, use the original sorting algorithm
        let alpahabeticalllySorted = alpahabeticalllySortFiles(nonConfigFilesAndFolders);
        let regexSorted = putFilesFitsToRegexPatternToEnd(alpahabeticalllySorted, getRegexLines(config));
        return regexSorted;
    }
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
