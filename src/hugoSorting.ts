import * as fs from 'fs';
import * as path from 'path';
import { outputChannel } from './logging';

interface FileMetadata {
    path: string;
    isDirectory: boolean;
    weight: number | null;
    isIndexFile: boolean;
}

/**
 * Extract YAML frontmatter from a markdown file and get the weight value.
 * @param filePath Path to the markdown file
 * @returns The weight value if found, otherwise null
 */
function extractWeightFromFrontmatter(filePath: string): number | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check if file has YAML frontmatter (between --- markers)
        const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) {
            return null;
        }

        const frontmatter = frontmatterMatch[1];

        // Look for weight: value in the frontmatter
        const weightMatch = frontmatter.match(/weight\s*:\s*(\d+)/);
        if (weightMatch && weightMatch[1]) {
            return parseInt(weightMatch[1], 10);
        }

        return null;
    } catch (error) {
        outputChannel.appendLine(`Error reading weight from ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
}

/**
 * Get the weight of a directory by looking for _index.md file inside it.
 * @param dirPath Path to the directory
 * @returns The weight from _index.md if found, otherwise null
 */
function getDirectoryWeight(dirPath: string): number | null {
    const indexPath = path.join(dirPath, '_index.md');

    if (fs.existsSync(indexPath)) {
        return extractWeightFromFrontmatter(indexPath);
    }

    return null;
}

/**
 * Get metadata for a file or directory, including weight information.
 * @param filePath Path to the file or directory
 * @returns Metadata object with path, type, and weight information
 */
function getFileMetadata(filePath: string): FileMetadata {
    const stats = fs.statSync(filePath);
    const isDirectory = stats.isDirectory();
    const filename = path.basename(filePath);
    const isIndexFile = filename === '_index.md';

    let weight: number | null = null;

    if (isDirectory) {
        weight = getDirectoryWeight(filePath);
    } else if (path.extname(filePath) === '.md') {
        weight = extractWeightFromFrontmatter(filePath);
    }

    return {
        path: filePath,
        isDirectory,
        weight,
        isIndexFile
    };
}

/**
 * Sort files according to Hugo conventions:
 * 1. _index.md files first within their directory
 * 2. Files with weight sorted by weight
 * 3. Everything else sorted alphabetically
 * @param files Array of file paths to sort
 * @returns Sorted array of file paths
 */
export function hugoSortFiles(files: string[]): string[] {
    // Get metadata for all files
    const fileMetadata = files.map(getFileMetadata);

    // Group files by directory to ensure _index.md is at the top of its own directory
    const filesByDirectory = new Map<string, FileMetadata[]>();

    fileMetadata.forEach(metadata => {
        const dirPath = path.dirname(metadata.path);
        if (!filesByDirectory.has(dirPath)) {
            filesByDirectory.set(dirPath, []);
        }
        filesByDirectory.get(dirPath)!.push(metadata);
    });

    // Sort files within each directory
    for (const [dirPath, files] of filesByDirectory.entries()) {
        files.sort((a, b) => {
            // Rule 1: _index.md files always at the top of its directory
            // Since we're reversing other sorts for VSCode, we need to reverse this logic too
            if (a.isIndexFile && !b.isIndexFile) {
                return 1;  // Reversed to put _index.md at top with VSCode's sorting
            }
            if (!a.isIndexFile && b.isIndexFile) {
                return -1; // Reversed to put _index.md at top with VSCode's sorting
            }

            // Rule 2: Files with weight sorted by weight (lower numbers first, but reverse for VSCode)
            if (a.weight !== null && b.weight !== null) {
                return b.weight - a.weight;
            }

            // Files with weight come before files without weight (reverse for VSCode)
            if (a.weight !== null && b.weight === null) {
                return 1;
            }
            if (a.weight === null && b.weight !== null) {
                return -1;
            }

            // Rule 3: Alphabetical sorting for ties (reverse for VSCode)
            return b.path.localeCompare(a.path);
        });
    }

    // Now sort directories based on their _index.md weight if available
    const sortedDirs = Array.from(filesByDirectory.keys()).sort((dirA, dirB) => {
        // Special case for the root directory, which should come first
        if (dirA === '.' || dirA === '/') return -1;
        if (dirB === '.' || dirB === '/') return 1;

        // Try to get the weight of each directory from its _index.md
        const dirAWeight = getDirectoryWeight(dirA);
        const dirBWeight = getDirectoryWeight(dirB);

        // If both directories have a weight, sort by weight (reverse for VSCode)
        if (dirAWeight !== null && dirBWeight !== null) {
            return dirBWeight - dirAWeight;
        }

        // Directories with weight come before directories without weight (reverse for VSCode)
        if (dirAWeight !== null && dirBWeight === null) {
            return 1;
        }
        if (dirAWeight === null && dirBWeight !== null) {
            return -1;
        }

        // Default to alphabetical sorting (reverse for VSCode)
        return dirB.localeCompare(dirA);
    });

    // Collect all sorted files from all directories
    const result: string[] = [];

    for (const dir of sortedDirs) {
        result.push(...filesByDirectory.get(dir)!.map(metadata => metadata.path));
    }

    return result;
}