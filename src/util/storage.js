import { openDB } from 'idb';

export default class Storage
{
	/**
	 * Internal function for accessing local storage.
	 * Users of this class should not call this function.
	 */
	static async openDB() {
		return await openDB('main', 1, {
			upgrade(db) {
				console.log('Upgrading DB');
				if (!db.objectStoreNames.contains('mods')) {
					db.createObjectStore('mods', {
						keyPath: 'id',
						autoIncrement: true,
					});
				}
				if (!db.objectStoreNames.contains('files')) {
					db.createObjectStore('files', {
						keyPath: [ 'idMod', 'filename' ],
					});
				}
			}
		});
	}

	/**
	 * Get a list of all mods stored in the browser's local storage.
	 *
	 * @return Array of objects, with each object being the same as what was
	 *   originally passed to addMod().  File names and content is not included.
	 */
	static async getMods() {
		let mods = [];
		let db;
		try {
			db = await this.openDB();
		} catch (e) {
			console.error('storage.openDB() failed:', e);
			throw e;
		}
		if (!db.objectStoreNames.contains('mods')) return [];
		let cursor = await db.transaction('mods').store.openCursor();
		while (cursor) {
			mods.push(cursor.value);
			cursor = await cursor.continue();
		}
		return mods;
	}

	/**
	 * Add a new mod to the browser's local storage.
	 *
	 * @param {Object} newMod
	 *   Details about the mod.  This object will later be returned by getMod().
	 *
	 * @param {Object} files
	 *   Key/value object.  Key is the filename, value is a Uint8Array of the
	 *   file content.  Passed directly to setFiles() with the newly allocated
	 *   ID of the mod.
	 *
	 * @return A newly allocated unique mod ID as a Number.
	 */
	static async addMod(newMod, files) {
		const db = await this.openDB();
		const tx = db.transaction('mods', 'readwrite');
		const idNewMod = await tx.store.add(newMod);
		await tx.done;
		await this.setFiles(idNewMod, files);
		return idNewMod;
	}

	/**
	 * Retrieve information about the given mod, such as its title and which game
	 * it is modifying.
	 *
	 * @param {Number} idMod
	 *   ID for the mod in question.
	 *
	 * @return Object containing various details.  The files and file content are
	 *   not included.
	 */
	static async getMod(idMod) {
		const db = await this.openDB();
		const tx = db.transaction('mods', 'readonly');
		const mod = await tx.store.get(idMod);

		return mod;
	}

	/**
	 * Update non-file related data about the mod, such as its working title and
	 * other user preferences.
	 *
	 * @param {Number} idMod
	 *   ID number of the mod to change.
	 *
	 * @param {Object} modInfo
	 *   Object to set.  Replaces the existing object.  This object is what will
	 *   be returned by getMods()/getMod().
	 *
	 * @return No return value.
	 */
	static async updateMod(idMod, modInfo) {
		const db = await this.openDB();
		const tx = db.transaction('mods', 'readwrite');
		await tx.store.put({
			...modInfo,
			id: idMod,
		});
		await tx.done;
	}

	/**
	 * Permanently remove the mod and all its files.
	 *
	 * @param {Number} idMod
	 *   ID number of the mod to delete.
	 *
	 * @return No return value.
	 */
	static async deleteMod(idMod) {
		const db = await this.openDB();
		const tx = db.transaction(['mods', 'files'], 'readwrite');

		// Delete the files first in case there is an error.  Unfortunately there
		// doesn't seem to be a way to use an unbounded range with a composite key,
		// so we have to iterate through the items manually.
		let cursor = await tx.objectStore('files').openCursor();
		while (cursor) {
			// Only process files for this mod.
			if (cursor.key[0] === idMod) {
				cursor.delete();
			}
			cursor = await cursor.continue();
		}

		// Then get rid of the mod last, so it remains in the list for future
		// delete attempts.
		await tx.objectStore('mods').delete(idMod);

		await tx.done;
	}

	/**
	 * @param {Number} idMod
	 *   ID number for the mod the files are associated with, to allow different
	 *   mods to use files with the same name.
	 *
	 * @param {Object} files
	 *   Key/value object.  Key is the filename, value is a Uint8Array of the
	 *   file content.
	 *
	 * @postconditions New files are added, existing files are updated.
	 */
	static async setFiles(idMod, files) {
		const db = await this.openDB();
		const tx = db.transaction('files', 'readwrite');
		let promises = [tx.done];
		for (const [ filename, content ] of Object.entries(files)) {
			promises.push(
				tx.store.put({
					idMod,
					filename: filename.toLowerCase(),
					content,
				})
			);
		}
		return await Promise.all(promises);
	}

	/**
	 * Get a gameinfo.js `Filesystem` compatible interface to the stored files.
	 *
	 * @param {Number} idMod
	 *   ID of the mod for which the files being accessed belong to.
	 *
	 * @return gameinfo.js Filesystem interface.
	 */
	static filesystemForMod(idMod) {
		return {
			findFile: async filename => {
				const db = await this.openDB();
				const tx = db.transaction('files', 'readonly');
				const key = await tx.store.getKey([ idMod, filename.toLowerCase() ]);

				return key !== undefined;
			},
			read: async filename => {
				const db = await this.openDB();
				const tx = db.transaction('files', 'readonly');
				const targetFilename = filename.toLowerCase();
				const obj = await tx.store.get([ idMod, targetFilename ]);

				if (!obj) {
					throw new Error(`File ${targetFilename} was requested by the game, but `
						+ `was not included when the game was opened.  Please select this `
						+ `file above and try again.`);
				}
				return obj.content;
			},
		};
	}
}
