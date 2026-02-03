import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { outputChannel } from './logging';
import { findAllFilesAndFoldersWithIgnore } from './findFiles';
import * as vscode from 'vscode';

let configName = '.order';
export let regularExpressionTag = "(regex)";
export let bottomTag = "(bottom)";

async function configReader(): Promise<string[]> {
    let customOrderPath = getProjectPath() + configName;
    let fileContent = readFileSync(customOrderPath, 'utf-8');
    let lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
    let removedEmptyLines = lines.filter(item => item !== '');
    let trimmed = removedEmptyLines.map(file => file.trim());
    trimmed.reverse();
    let workspaceUri = vscode.workspace.workspaceFolders?.map(folder => folder.uri).at(0);
    if (!workspaceUri) { throw new URIError("No workspace detected"); }
    let filesAndFolders = await findAllFilesAndFoldersWithIgnore(workspaceUri);
    let filesAndFoldersArray = Array.from(filesAndFolders);
    let regexReplaced = replaceRegexWithMatchedFiles(filesAndFoldersArray, trimmed);
    return regexReplaced;
}

export function getRegexLines(lines: string[]): string[] {
    let regexLines = lines.filter(line => line.startsWith(regularExpressionTag));
    return regexLines;
}

export async function getOrder(): Promise<string[]> {
    let fileOrder: string[];
    try {
        fileOrder = await configReader();
        return fileOrder;
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
        return [] as string[]; // Exit the function if the config could not be loaded
    }
}

function getFilesFitsToSingleRegexPattern(files: string[], pattern: string): string[] {
    let tagEndIndex = regularExpressionTag.length ;
    let slicedPattern = pattern.slice(tagEndIndex);
    const myregex = new RegExp(slicedPattern);
    const result = files.filter(item => myregex.test(item));
    return result;
}

function replaceRegexWithMatchedFiles(files: string[], order: string[]): string[] {
    let copyOrder = [...order];
    for (let index = 0; index < order.length; index++) {
        if(order[index].startsWith(regularExpressionTag)) {
            let matchedFiles = getFilesFitsToSingleRegexPattern(files, order[index]);
            let replaceIndex = copyOrder.indexOf(order[index]);
            let projectPathRemovedMatchedFiles = removeProjectPath(matchedFiles);
            let backslashRemovedMatchedFiles = projectPathRemovedMatchedFiles.map(s => s.replaceAll("\\", "/"));
            copyOrder.splice(replaceIndex, 1, ...backslashRemovedMatchedFiles); //need to replace double back slashes with slashes
        }
    }
    return copyOrder;
}

function removeProjectPath(order: string[]): string[] {
    let projectPath = getProjectPath();
    let lengthOfProjectPath = projectPath.length;
    let removedProjectPathOrder = order.map(item => item.slice(lengthOfProjectPath));
    return removedProjectPathOrder;
}

