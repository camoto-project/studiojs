# Camoto Studio Online
Copyright 2010-2021 Adam Nielsen <<malvineous@shikadi.net>>  

This is a web application for editing MS-DOS games from the 1990s.  It runs in
a web browser and lets you create your own levels, change the music and
graphics, and make other changes to games.

## Users

If you want to use this to edit games, you probably don't want to run this code,
but rather visit the site at https://camoto.shikadi.net where this code runs.

## Development

If you want to add support for more games or improve the editors in some way,
great!  Depending on what you want to do, the code might belong in another
repository (perhaps more than one):

 - [gamearchive.js](https://github.com/camoto-project/gamearchivejs)
   handles reading and writing of any archive files, including extracting large
   data chunks out of .exe files.

 - [gamecomp.js](https://github.com/camoto-project/gamecompjs) handles applying
   and removing any compression or encryption.  It is mostly used by
   gamearchive.js to decompress files inside archives, but the algorithms are
   available for use by all libraries.  gamecode.js for example, uses them to
   decompress .exe files.

 - [gamegraphics.js](https://github.com/camoto-project/gamegraphicsjs)
   handles decoding and encoding images, palettes, tilesets and animations.

 - [gamemaps.js](https://github.com/camoto-project/gamegraphicsjs)
   handles the levels themselves, including how to map tiles back to the images
   and tilesets provided by gamegraphics.js.

 - [gamecode.js](https://github.com/camoto-project/gamecodejs)
   handles extracting small amounts of information from game .exe files.
   Things like text strings for the game's user interface, and filenames the
   game uses to load data are made available for modification through this
   library.

 - [gameinfo.js](https://github.com/camoto-project/gameinfojs)
   ties everything together, providing a list of items that can be edited in
   each game.  It handles things like loading the right tilesets for a level
   editor to use, knowing which palettes to use for which images, splitting or
   combining tilesets into a more logical arrangement, and so on.  It relies on
   all the other libraries for reading information from games and for actually
   loading and saving them as class instances.

 - [studio.js](https://github.com/camoto-project/studiojs)
   is this project, which uses gameinfo.js to load and save game items.  It
   also provides a set of editors, such as a level editor that can modify the
   `Map` class instances returned by gameinfo.js.  It does not have any
   knowledge of any specific games - at this point it's all generic, with the
   differences between games abstracted away by gameinfo.js.

In order to add support for a new game, first all the file formats must be
implemented in the various libraries - any archives in gamearchive.js, the
images in gamegraphics.js, and so on.  Last of all, the game can be added to
gameinfo.js, at which point it will be available for editing in Camoto Studio.

### Running locally

  1. `npm install` to download dependencies
  2. `npm start` to run the web server locally
  3. Open http://localhost:3000 in a browser.

If you will be doing development on the underlying libraries as well (adding new
file formats) you may wish to have the local Camoto Studio access local
development versions of the other Camoto libraries as well to assist with
development.  Assuming all the git repos are cloned into subfolders in the
same parent directory, you can do this:

  1. `cd studiojs`
  2. `npm uninstall @camoto/gamearchive`
  3. `npm install ../gamearchivejs/`
  4. Repeat for whichever libraries are available locally.

If you do this, remember not to include the `package*.json` files in any PRs as
they will now refer to your local installs.

You can easily undo the above changes by performing it in reverse, to switch
from local versions to the lastest published version:

  1. `npm uninstall @camoto/gamearchive` (yes even for the local version)
  2. `npm install @camoto/gamearchive`

### Debugging

In the browser console, run:

    localStorage.debug = 'game*';

This enables all the `debug()` calls which will appear in the browser console.

## Credits

[Joystick favicon](https://commons.wikimedia.org/wiki/File:Twemoji2_1f579.svg)
by [Twitter twemoji](https://github.com/twitter/twemoji).
