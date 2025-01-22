### Sort rest of the files alphabetically - DONE
- Sort the files not listed in the .order file alphabetically.
- Get all files and FOLDERS from workspace. Substact the files from order file.
- Call changeModifyDate function in alpabetical order
### Add custom sort function selector (Maybe)
- Users can contribute to the code and add their custom sort functions to sortingFunctions.ts
- Add a selector to VS code to change the active sorting function.
### Catch common exceptions. 
- Like if the user enters wrong name. Or what happens if there is no order file. 
- Some exception handling implemented.
### Send some files to the bottom.
- Add a tag after the file name in the .order file. Some tag ideas (END), [BOTTOM], _REVERSE_, \<DOWN>,(BACKWARD), (last), @last. 
- Specify this tag in a variable.
- Example: UnwantedFile.py(BOTTOM)
- Check for regular expression before changing the file modify date. If has the tag make the modify date an old date like 2001.
- For the next file add 1 second to the file
### Make sort order default in setting json when extension is disabled
- When user disables the extension "explorer.sortOrder": "modified" shoud set to "default".
- I tried but cant make it work. Deactivate gets called when I close the VsCode but it wont get called when I disable the extension. I tried subscribing to some events but I could not make it work. I dont think its a very important feature.
### Write Tests
- So I dont have to test the extension manually when adding new features
### Fix autosave issues - DONE (probably)
- Auto save might say file contents are newer do you want to override it. Maybe increasing autosave delay a few second in vscode settings can mitigate the issue. Or maybe I can put miliseconds between files instead of seconds
### Probably wont work if multiple workspaces are open in the same editor
- I dont think many people use multiple workspaces in the same editor anyways
### Test on Linux
- I am not sure if line endings are all working on linux
### Update screenshots
- After sort alphabetical order I need to update the screenshots
---
Read the guidelines one day.
* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)