import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { minimatch } from "minimatch";

export function getGitignoreFiles(): string {
    try {
        let workspacePath = getProjectPath();
        let gitignorePath = workspacePath + '.gitignore';
        let fileContent = readFileSync(gitignorePath, 'utf-8');
        let lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
        lines.push('.git/'); // Normally gitignore files doesnt include the .git folder, but we want to include it
        let removedComments = lines.filter(item => item.charAt(0) !== '#');
        let removedEmptyLines = removedComments.filter(item => item !== '');
        let prefixedGitignoreFiles = removedEmptyLines.map(file => "**/" + file + "**");
        let trimmedGitignoreFiles = prefixedGitignoreFiles.map(file => file.trim());
        let ignorePatterns = trimmedGitignoreFiles.join(',');
        ignorePatterns = `{${ignorePatterns}}`;
        return ignorePatterns;
    } catch (error) {
        return "";
    }
}

export async function findAllFilesAndFoldersWithIgnore(folderUri: vscode.Uri, resultSet: Set<string>, ignorePattern: string) {
    // Finds all files and folders in the workspace and saves them to the set provided
    // You might need to await the results.
    const entries = await vscode.workspace.fs.readDirectory(folderUri);
    for (const [entryName, entryType] of entries) {
        const entryUri = vscode.Uri.joinPath(folderUri, entryName);
        // Check if the current folder fits the ignore pattern
        if (minimatch(entryUri.fsPath, ignorePattern)) {
            continue;
        }
        // Add the folder URI to the set
        // remove the first slash from the uri
        resultSet.add(entryUri.fsPath);
        if (entryType === vscode.FileType.Directory) {
            // If result is a directory, recursively call the function
            await findAllFilesAndFoldersWithIgnore(entryUri, resultSet, ignorePattern);
        }
    }
}
