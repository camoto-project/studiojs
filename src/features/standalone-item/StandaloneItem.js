import React, { useEffect, useState } from 'react';
import {
	HashRouter as Router,
	Prompt,
	Route,
	Switch,
	useHistory,
	useParams,
	useRouteMatch,
} from 'react-router-dom';

import Document from '../Document.js';
import ErrorBox from '../../components/ErrorBox.js';
import MessageBox from '../../components/MessageBox.js';
import Storage from '../../util/storage.js';
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
			return handler.parse(content, mainFilename);
		}

		case 'music': {
			return handler.parse(content, mainFilename);
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

	//const [ item, setItem ] = useState(null);
	const [ errorMessage, setErrorMessage ] = useState(null);

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
				console.log('opened item', item);
				setOpenInstance({
					item: {
						type: mod.idEditor,
					},
					document: item,
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

	// TODO: useCallback?
	function onSave() {
	}
	// TODO: useCallback?
	function saveDocumentPrefs() {
	}

	return (
		<div className="root">
			<Prompt
				when={unsavedChanges}
				message={onNavigatePrompt}
			/>
			{errorMessage && (
				<ErrorBox summary={`Error`}>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
			)}
			<Document
				cbSaveMod={onSave}
				setUnsavedChanges={setUnsavedChanges}
				setSaving={setSaving}
				savePrefs={saveDocumentPrefs}
				{...openInstance}
			/>
		</div>
	);
}

export default StandaloneItem;
