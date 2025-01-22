export function alpahabeticalllySortFiles(files: string[]): string[] {
    // Just sort uses ascii codes. Capital letters come before lowercase letters
    // So Z is before a. To prevent this, we can use localeCompare
    // Also handles non ascii character like ç, ö, ü
    let sorted = files.sort((a, b) => a.localeCompare(b));
    return sorted.reverse();
}