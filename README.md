# CustomOrderFiles README

Re-order files and folder as you wish in VS Code. Create a file named `.order` in the root of your workspace.
List file names in the order you wish. One line for one file name. Example:

    ImportantFile.js
    LessImportantFile.js
    AnotherFile.js

## How it works

Add a custom string to end of the files listed in `.order` file.
Changes file sorting to last modified date.
Only works if you open a worspace (folder)

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.
You can change the default string added to the end of the files using the below
But in the future because I have not added that feature yet.

* `myExtension.enable`: Enable/disable this extension.

## Known Issues

You can create a issue on projects github page

## Release Notes

### 1.0.0

Initial release of extension

---

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
