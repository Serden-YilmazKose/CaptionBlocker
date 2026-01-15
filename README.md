# CaptionBlocker
Block or blurr unnecessary captions and subtitles.

# Purpose
Hard-coded captions and subtitles, when not needed, can decrease the viewing experience. This extension seeks to mitigate that problem by placing a black rectangle over the captions.

# Tools
The location and dimensions of the caption blocker are submitted by users. It would simply be too expensive to run code to find the location of the captions.

The following are the languages and tools used in the development of the project:
* JavaScript: Used to write the source code of the extension.
* Python: Used to build a server, using Flask, that handles GET and POST requests.
* MariaDB: Used to host the database of videos, insertions are made from the Python Flask server.

# Note
As may be evident from the quality and structure of the code, not one line of this project was written by a generative artificial intelligence. Prior to this, I had almost zero experience using JavaScript.
