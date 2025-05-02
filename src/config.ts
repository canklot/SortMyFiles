import { getProjectPath, prefixWithProjectPath } from './projectPath';
import { readFileSync, appendFileSync, utimesSync } from 'fs';
import { outputChannel } from './logging';
import * as vscode from 'vscode';

export let regularExpressionTag = "(regex)";

/**
 * Enum for all supported configuration modes
 */
export enum ConfigMode {
    ORDER = '.order',
    HUGO = 'Hugo'
}

export class InvalidConfigModeError extends Error {
    constructor(public modeName: string) {
        super(`Invalid config mode: ${modeName}`);
        this.name = "InvalidConfigModeError";
    }
}

/**
 * Gets the current configuration mode from settings
 * @returns The current configuration mode
 */
export function getConfigMode(): ConfigMode {
    const config = vscode.workspace.getConfiguration('sortmyfiles');
    const configModeString = config.get<string>('configMode', ConfigMode.ORDER);
    if (Object.values(ConfigMode).includes(configModeString as ConfigMode)) {
        return configModeString as ConfigMode;
    }
    throw new InvalidConfigModeError(configModeString || 'undefined');
}

function configReader(): string[] {
    // Only read from file in .order mode
    let configMode = getConfigMode();

    if (configMode === ConfigMode.HUGO) {
        // In Hugo mode, we don't read a config file
        return [];
    }

    let customOrderPath = getProjectPath() + configMode;
    let fileContent = readFileSync(customOrderPath, 'utf-8');
    let lines = fileContent.split(/\r?\n/); // Handles both Windows and Unix line endings
    let removedEmptyLines = lines.filter(item => item !== '');
    let trimmed = removedEmptyLines.map(file => file.trim());
    trimmed.reverse();
    //let filePaths = prefixWithProjectPath(trimmed);
    return trimmed;
}

export function getRegexLines(lines: string[]): string[] {
    let regexLines = lines.filter(line => line.startsWith(regularExpressionTag));
    return regexLines;
}

export function getConfig(): string[] {
    // Public function with exception handling
    let fileOrder: string[];

    // If in Hugo mode, don't try to read a config file
    if (getConfigMode() === ConfigMode.HUGO) {
        return [];
    }

    try {
        fileOrder = configReader();
        return fileOrder;
    } catch (error) {
        if (error instanceof URIError) {
            outputChannel.appendLine("Workspace path not detected. Please open a workspace.");
        } else if (error instanceof Error && error.message.includes('ENOENT')) {
            const configMode = getConfigMode();
            outputChannel.appendLine(`Config file "${configMode}" not found.`);
        } else if (error instanceof Error) {
            outputChannel.appendLine(`Failed to load configuration: ${error.message}`);
        } else {
            outputChannel.appendLine('An unknown error occurred.');
        }
        return [] as string[]; // Exit the function if the config could not be loaded
    }
}