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

 - gamearchive.js handles reading and writing of any archive files, including
   extracting large data chunks out of .exe files.

 - gamecomp.js handles applying and removing any compression or encryption.  It
   is mostly used by gamearchive.js to decompress files inside archives, but
   the algorithms are available for use by all libraries.  gamecode.js for
   example, uses them to decompress .exe files.

 - gamegraphics.js handles decoding and encoding images, palettes, tilesets and
   animations.

 - gamemaps.js handles the levels themselves, including how to map tiles back
   to the images and tilesets provided by gamegraphics.js.

 - gamecode.js handles extracting small amounts of information from game .exe
   files.  Things like text strings for the game's user interface, and filenames
   the game uses to load data are made available for modification through this
   library.

 - gameinfo.js ties everything together, providing a list of items that can be
   edited in each game.  It handles things like loading the right tilesets for
   a level editor to use, knowing which palettes to use for which images,
   splitting or combining tilesets into a more logical arrangement, and so on.
   It relies on all the other libraries for reading information from games and
   for actually loading and saving them as class instances.

 - studio.js is this project, which uses gameinfo.js to load and save game
   items.  It also provides a set of editors, such as a level editor that can
   modify the `Map` class instances returned by gameinfo.js.  It does not have
   any knowledge of any specific games - at this point it's all generic, with
   the differences between games abstracted away by gameinfo.js.

In order to add support for a new game, first all the file formats must be
implemented in the various libraries - any archives in gamearchive.js, the
images in gamegraphics.js, and so on.  Last of all, the game can be added to
gameinfo.js, at which point it will be available for editing in Camoto Studio.

### Running locally

Use `npm start` to run the site locally at http://localhost:3000.

### Debugging

In the browser console, run:

    localStorage.debug = 'game*';

This enables all the `debug()` calls which will appear in the browser console.
