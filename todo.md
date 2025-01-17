### Sort rest of the files alphabetically
- Sort the files not listed in the .order file alphabetically.
- Get all files from workspace. Substact the files from order file.
- Call changeModifyDate function in alpabetical order
### Catch common exceptions. 
- Like if the user enters wrong name. Or what happens if there is no order file. 
- Some exception handling implemented.
### Send some files to the bottom.
- Add a tag after the file name in the .order file. Some tag ideas (END), [BOTTOM], _REVERSE_, \<DOWN>,(BACKWARD), (last), @last. 
- Specify this tag in a variable.
- Example: UnwantedFile.py(BOTTOM)
- Check for regular expression before changing the file modify date. If has the tag make the modify date an old date like 2001.
- For the next file add 1 second to the file
### Make sort order default in setting json on extension disable
- When user disables the extension "explorer.sortOrder": "modified" shoud set to default.
- I tried but cant make it work. Deactivate gets called when I close the VsCode but it wont get called when I disable the extension. I tried subscribing to some events but I could not make it work. I dont think its a very important feature.
---
Read the guidelines one day.
* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)