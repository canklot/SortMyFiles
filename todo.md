Maybe sort rest of the files alphabetically
Catch common exceptions. 
- Like if the user enters wrong name. Or what happens if there is no order file. 
-- Some exception handling implemented.
Send some files to the bottom.
- Add a tag after the file name in the .order file. Some tag ideas (END), [BOTTOM], _REVERSE_, <DOWN>,<BACKWARD>, (last), @BASE. Specify this tag in a variable.
- Example UnwantedFile.py(BOTTOM)
- Before changing the file modify date check for regular expression. If has the tag remove the tag from file name. Make the modify date 2001.
- For the next bottom element add 1 second to the file
---
Read the guidelines one day.
* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)