/*
 * Camoto Studio Online - StandaloneItem
 *
 * Corresponding to the GameItem component, only this loads a file and renders
 * a document without a corresponding mod, allowing files outside of known
 * games to be edited using the same UI components.
 *
 * Copyright (C) 2010-2021 Adam Nielsen <malvineous@shikadi.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
	HashRouter as Router,
	Prompt,
	Route,
	Switch,
	useHistory,
	useParams,
	useRouteMatch,
} from 'react-router-dom';

import {
	Icon,
	iconArchive,
	iconAttributes,
	iconAudio,
	iconB800,
	iconClose,
	iconImage,
	iconInstruments,
	iconMap,
	iconMenu,
	iconMusic,
	iconPalette,
} from '../../util/icons.js';

import Document from '../Document.js';
import ErrorBox from '../../components/ErrorBox.js';
import MessageBox from '../../components/MessageBox.js';
import MultipleFileDownload from '../../components/MultipleFileDownload.js';
import Storage from '../../util/storage.js';
import Tooltip from '../../components/Tooltip.js';
import setPageTitle from '../../util/setPageTitle.js';
import useUnload from '../../util/useUnload.js';

import './StandaloneItem.css';

import {
	all as gamemusicFormats,
	findHandler as gamemusicFindHandler,
} from '@camoto/gamemusic';

import {
	all as gamearchiveFormats,
	findHandler as gamearchiveFindHandler,
} from '@camoto/gamearchive';

const allFormats = {
	music: gamemusicFormats,
	archive: gamearchiveFormats,
};

// Take the return value from a game*.js generation function, and use the
// supp() call to figure out what the filename is for each file.
function contentToFiles(content, handler, mainFilename) {
	let result = {};
	const supps = handler.supps(mainFilename);
	for (const [id, data] of Object.entries(content)) {
		let filename;
		if (id === 'main') {
			filename = mainFilename;
		} else {
			filename = (supps && supps[id]) || id;
		}
		result[filename] = data;
	}
	return result;
}

async function openItem({ idEditor, idFormat, mainFilename }, fs) {
	const catFormats = allFormats[idEditor];
	if (!catFormats) {
		throw new Error(`Somehow selected a format category ("${idEditor}") that doesn't exist!`);
	}

	const handler = catFormats.find(h => h.metadata().id === idFormat);
	if (!handler) {
		throw new Error(`Somehow selected a file handler ("${idFormat}") that doesn't exist!`);
	}

	// Load main file.
	let content = {};
	content['main'] = await fs.read(mainFilename);

	// Load any supps.
	const handlerSupps = handler.supps(mainFilename) || {};
	for (const [id, filename] of Object.entries(handlerSupps)) {
		if (id === 'main') continue;
		content[id] = await fs.read(filename);
	}

	switch (idEditor) {
		case 'archive': {
			const cbGenerateFiles = archive => {
				const content = handler.generate(archive);
				return {
					files: contentToFiles(content, handler, mainFilename),
					warnings: [],
				};
			};
			return {
				instance: handler.parse(content, mainFilename),
				cbGenerateFiles,
			};
		}

		case 'music': {
			const cbGenerateFiles = music => {
				const output = handler.generate(music);
				return {
					files: contentToFiles(output.content, handler, mainFilename),
					warnings: output.warnings,
				};
			};
			return {
				instance: handler.parse(content, mainFilename),
				cbGenerateFiles,
			};
		}

		default:
			throw new Error(`Unable to open files of type "${idEditor}".`);
	}
}

function StandaloneItem(props) {
	const history = useHistory();
	const match = useRouteMatch();
	const { idItem } = useParams();
	const idItemKey = +idItem; // must be integer for IndexedDB key

	// Error message to display instead of content area.
	const [ errorMessage, setErrorMessage ] = useState(null);

	const [ downloads, setDownloads ] = useState();
	const [ saveErrorMessage, setSaveErrorMessage ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	// Are we currently waiting for a save-to-IndexedDB operation to complete?
	const [ saving, setSaving ] = useState(false);

	// Document children components set this to true when they are first modified,
	// so we know to prompt before loading a different item.
	const [ unsavedChanges, setUnsavedChanges ] = useState(false);

	// Filename of open document, for display in the heading.
	const [ docFilename, setDocFilename ] = useState('');

	const [ openInstance, setOpenInstance ] = useState({
		item: {
			type: undefined,
		},
		document: undefined,
	});

	// Prompt if the page changes while there are unsaved changes.
	useUnload(e => {
		if (unsavedChanges) {
			e.preventDefault();
			e.returnvalue = 'The current item has not yet been saved!';
			return e.returnValue;
		}
	});

	useEffect(() => {
		async function loadMod() {
			try {
				if (!idItemKey) {
					setErrorMessage(`The ID "${idItemKey}" in the URL is not valid.`);
					return;
				}
				const mod = await Storage.getMod(idItemKey);
				setDocFilename(mod.mainFilename);
				const fs = Storage.filesystemForMod(idItemKey);
				if (!mod) {
					setErrorMessage(`Unable to open item: ID "${idItemKey}" does not exist in this browser's local storage area.`);
					return;
				}
				const item = await openItem(mod, fs);
				setOpenInstance({
					item: {
						type: mod.idEditor,
					},
					document: item.instance,
					cbGenerateFiles: item.cbGenerateFiles,
				});
			} catch (e) {
				console.error(e);
				setErrorMessage(`Unable to open item: ${e.message}`);
			}
		}
		loadMod();
	}, [
		idItemKey,
	]);

	// Update the browser page/tab title to include this document name.
	useEffect(() => {
		setPageTitle({
			docTitle: docFilename,
		});
	}, [
		docFilename,
	]);

	// Work out which icon to show in the top left.
	const itemIcon = useMemo(() => (
		{
			'archive': iconArchive,
			'music': iconMusic,
		}[openInstance.item.type]
	), [
		openInstance,
	]);
	/*
	const saveDocumentPrefs = useCallback(async (type, key, value) => {
		// Update the state, which will pass the prefs down to the document through
		// the 'mod' prop.
		const newMod = {
			...mod,
			prefs: {
				...mod.prefs,
				[type]: {
					...(mod.prefs || {})[type],
					[key]: value,
				},
			},
		};
		setMod(newMod);

		// Save the prefs to IndexedDB.
		await Storage.updateMod(props.idMod, newMod);
	}, [
		mod,
		props.idMod,
	]);
	*/

	// Callback when browser back/forward buttons are pressed.  Due to a many
	// year old bug in React Router, returning false to cancel the navigation
	// still results in the browser URL updating and no longer matching the
	// displayed content.  Hopefully the bug will be fixed one day.
	function onNavigatePrompt(location, action) {
		const proceed = window.confirm('Discard unsaved changes to open item?');
		if (proceed) {
			// Don't want to keep prompting for unsaved changes on the
			// next document.
			setUnsavedChanges(false);
		}
		return proceed;
	}

	const onSave = useCallback(async updatedDocument => {
		const output = openInstance.cbGenerateFiles(updatedDocument);
		if (!output.files) {
			setSaveErrorMessage('Something went wrong - no files were generated!  This should not happen!');
		} else {
			setDownloads(output.files || {});
			setWarnings(output.warnings);
			// Also save back to browser storage so changes won't be lost if the page
			// gets reloaded.
			await Storage.setFiles(idItemKey, output.files);
		}
	}, [
		idItemKey,
		openInstance,
	]);

	const onSaveClose = useCallback(() => {
		setDownloads(null);
		setSaveErrorMessage(null);
	});

	// TODO: useCallback?
	function saveDocumentPrefs() {
	}

	return (
		<div className="root">
			<div className="toolbar">

				<span className="filename">
					<Icon icon={itemIcon} className="icon" />
					{docFilename}
				</span>

				<span className="flex-spacer" />

				<button onClick={() => history.push('/')}>
					<Tooltip>
						Close this item and return to the main menu
					</Tooltip>
					<Icon icon={iconClose} />
				</button>

			</div>

			<Prompt
				when={unsavedChanges}
				message={onNavigatePrompt}
			/>

			{errorMessage && (
				<ErrorBox
					summary={`Error`}
				>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
			) || /* Only display the document when there's no error message */ (
				<Document
					cbSave={onSave}
					setUnsavedChanges={setUnsavedChanges}
					setSaving={setSaving}
					savePrefs={saveDocumentPrefs}
					setErrorMessage={setErrorMessage}
					{...openInstance}
				/>
			)}

			<MultipleFileDownload
				visible={!!downloads || saveErrorMessage}
				title="Save"
				onClose={onSaveClose}
				unsavedChanges={props.unsavedChanges}
				warnings={warnings || []}
				errorMessage={saveErrorMessage}
				downloads={downloads || {}}
			>
				<p>
					Download these files to save your changes.
				</p>
			</MultipleFileDownload>
		</div>
	);
}

export default StandaloneItem;
