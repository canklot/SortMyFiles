import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { outputChannel } from './logging';

let configName = '.order';

function configReader(): string[] {
    let customOrderPath = getProjectPath() + configName;
    let fileContent = readFileSync(customOrderPath, 'utf-8');
    let lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
    let removedEmptyLines = lines.filter(item => item !== '');
    let trimmed = removedEmptyLines.map(file => file.trim());
    trimmed.reverse();
    let filePaths = prefixWithProjectPath(trimmed);
    return filePaths;
}

export function getConfig(): string[] {
    // Public function with exception handling
    let fileOrder: string[];
    try {
        fileOrder = configReader();
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