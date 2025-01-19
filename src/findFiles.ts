import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { minimatch } from "minimatch";

// -----------------
function getGitignoreFiles(): string {
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
export async function getAllFilesInWorkspace() {
    let fileList: string[] = [];

    // `{${ignorePatterns}}`
    // `*/bin`
    // `{*/obj,*/bin}`
    let ignorePatterns = getGitignoreFiles();
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

// -----------------
export async function recursivelyFindFolders(folderUri: vscode.Uri, folderUris: Set<string>) {
    try {
        const entries = await vscode.workspace.fs.readDirectory(folderUri);

        for (const [entryName, entryType] of entries) {
            const entryUri = vscode.Uri.joinPath(folderUri, entryName);

            if (entryType === vscode.FileType.Directory) {
                // Add the folder URI to the set
                folderUris.add(entryUri.toString());

                // Recursively search for more folders inside
                await recursivelyFindFolders(entryUri, folderUris);
            }
        }
    } catch (error) {
        console.error(`Error reading directory at ${folderUri.fsPath}:`, error);
    }
}

export async function recursivelyFindFoldersWithignore(folderUri: vscode.Uri, folderUris: Set<string>, ignorePattern: string) {
    try {
        const entries = await vscode.workspace.fs.readDirectory(folderUri);

        for (const [entryName, entryType] of entries) {
            const entryUri = vscode.Uri.joinPath(folderUri, entryName);

            // Check if the current folder fits the ignore pattern
            if (minimatch(entryUri.fsPath, ignorePattern)) {
                continue;
            }

            if (entryType === vscode.FileType.Directory) {
                // Add the folder URI to the set
                folderUris.add(entryUri.toString());

                // Recursively search for more folders inside
                await recursivelyFindFoldersWithignore(entryUri, folderUris, ignorePattern);
            }
        }
    } catch (error) {
        console.error(`Error reading directory at ${folderUri.fsPath}:`, error);
    }
}



export async function getAllFilesInWorkspaceWaiter() {
    let workspaceUri = vscode.workspace.workspaceFolders?.map(folder => folder.uri).at(0);
    if (!workspaceUri) { throw new URIError("No workspace detected"); }
    let allfolder = new Set<string>();
    let ignorePattern = getGitignoreFiles();
    await recursivelyFindFoldersWithignore(workspaceUri, allfolder, ignorePattern);
    return allfolder;
}
