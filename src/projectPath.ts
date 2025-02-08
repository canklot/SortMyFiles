import * as vscode from 'vscode';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import * as path from 'path';

export function getProjectPath(): string {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) { throw new URIError("No workspace detected"); }
    let workspaceUriPath = workspaceFolder.uri.fsPath;
    //let normalizedPath = path.normalize(workspaceUriPath);
    workspaceUriPath = workspaceUriPath + path.sep;
    return workspaceUriPath;

}
export function prefixWithProjectPath(fileList: string[]): string[] {
    let workspacePath = getProjectPath();
    let prefixedList: string[] = [];
    for (let filename of fileList) {
        prefixedList.push(workspacePath + filename);
    }
    return prefixedList;
}