# CustomOrderFiles VSCode Extension

Re-order files and folders in VS Code explorer. Create a file named `.order` in the root of your workspace.
List the file names in the order you wish. One line for a file. Example:

    VeryImportantFolder
    MyFolder/MyCode.js
    MyFolder/MyLibrary.js
    ImportantFile.js
    LessImportantFile.js


## How it works

Changes file sorting to last modified date.
Everytime a save detected extension activates.
Changes the last modified date of the files specified in the `.order` file.
Only works if you open a worspace (folder)

[VSCode Marketplace Page](https://marketplace.visualstudio.com/items?itemName=CanklotSoftware.CustomOrderFiles)

## Known Issues

Folders are always displayed first.

If you face any problems in `OUTPUT` tab you can select `CustomOrderExtension` from the drop-down menu and check the logs.

## Release Notes

### 0.0.3

Initial release of extension


