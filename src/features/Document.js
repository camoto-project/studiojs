import React, { Suspense, lazy, useCallback, useState, useMemo } from 'react';
import {
	withRouter,
} from 'react-router-dom';

import ErrorBoundary from '../components/ErrorBoundary.js';
import ErrorBox from '../components/ErrorBox.js';
import Initial from './initial/Initial.js';
import Loading from './Loading.js';
import MessageBox from '../components/MessageBox.js';

const Attributes = lazy(() => import('./attributes/Attributes.js'));
const Image = lazy(() => import('./image/Image.js'));
const Map = lazy(() => import('./map/Map.js'));
const Music = lazy(() => import('./music/Music.js'));
const Palette = lazy(() => import('./palette/Palette.js'));

function Document(props) {
	const [ errorPopup, setErrorPopup ] = useState(null);

	const idDocument = props.match.params.idDocument;

	// This is the "item" passed to the <Document/> when a game is first opened.
	const initialItem = useMemo(() => {
		// Don't show anything if the game hasn't loaded.  It will re-render in a
		// moment so anything we render now is just a waste of time.
		if (!props.game) return {};

		const md = props.game.constructor.metadata();
		return {
			type: '_new',
			gameTitle: md.title,
			tipsSource: {
				title: 'ModdingWiki',
				url: `https://moddingwiki.shikadi.net/wiki/${md.title}`,
			},
			tipsContentURL: `https://moddingwiki.shikadi.net/w/api.php?action=parse&prop=text&format=json&formatversion=2&origin=*&errorformat=html&page=${md.title}/Modding Tips`,
		};
	}, [
		props.game,
	]);

	// Keep useMemo() and useCallback() happy.
	const {
		cbSaveMod: props_cbSaveMod,
		gameItems: props_gameItems,
		savePrefs: props_savePrefs,
		setSaving: props_setSaving,
	} = props;

	const openInstance = useMemo(() => {
		// Only render <Initial/> if we don't have a document ID.  Otherwise we'll
		// be rendering the document shortly, so no point firing off a fetch() for
		// the tips which we'll have to cancel almost immediately.
		if (idDocument === undefined) return {
			item: initialItem,
		};

		if (!props_gameItems) {
			// Game hasn't loaded yet, don't render anything.
			return {};
		}

		const d = props_gameItems[idDocument];
		if (!d) return {
			item: {
				type: 'error',
			},
			document: {
				message: `The document ID ${idDocument} is not valid for this game.`,
			},
		};

		// Folders can't be opened.
		if (d.type === 'folder') {
			return {
				item: {
					type: 'folder',
				},
				document: null,
			};
		}

		try {
			let doc = d.fnOpen();
			return {
				item: d,
				document: doc,
				cbSave: async doc => {
					try {
						props_setSaving(true);

						if (!d.fnSave) {
							setErrorPopup('Sorry, the gameinfo.js handler for this game does '
								+ 'not yet support saving this item.');
							return;
						}

						// Save to the game.
						try {
							await d.fnSave(doc);
						} catch (e) {
							console.error(e);
							setErrorPopup(`Error saving this item: ${e.message}`);
							return;
						}

						// Update the stored files.
						try {
							await props_cbSaveMod();
						} catch (e) {
							console.error(e);
							setErrorPopup(`Error saving changes to the browser's IndexedDB: ${e.message}`);
							return;
						}

					} finally {
						props_setSaving(false);
					}
				},
			};
		} catch (e) {
			console.error(e);
			return {
				item: {
					type: 'error',
				},
				document: e,
			};
		}
	}, [
		idDocument,
		initialItem,
		props_cbSaveMod,
		props_gameItems,
		props_setSaving,
	]);

	const type = (openInstance.item && openInstance.item.type) || undefined;

	// Save the user's preferences for the current editor to IndexedDB.
	const savePrefs = useCallback((key, value) => {
		// This will update props.mod.
		props_savePrefs(type, key, value);
	}, [
		props_savePrefs,
		type,
	]);

	const childProps = {
		mod: props.mod,
		setUnsavedChanges: props.setUnsavedChanges,
		savePrefs,
		prefs: (props.mod && props.mod.prefs && props.mod.prefs[type]) || {},
		...openInstance,
	};

	let element;
	switch (type) {
		case undefined:
			// No game loaded yet.
			element = null;
			break;

		case '_new':
			// Game loaded, no item selected.
			element = <Initial {...childProps} />;
			break;

		case 'image':
			element = <Image {...childProps} />;
			break;

		case 'attributes':
			element = <Attributes {...childProps} />;
			break;

		case 'map':
			element = <Map {...childProps} />;
			break;

		case 'music':
			element = <Music {...childProps} />;
			break;

		case 'palette':
			element = <Palette {...childProps} />;
			break;

		case 'error':
			element = (
				<ErrorBox summary={`Error opening item`}>
					<p>
						The item could not be opened.  The reason given was:
						{" "}<b>{childProps.document.message}</b>
					</p>
				</ErrorBox>
			);
			break;

		default:
			element = (
				<ErrorBox summary={`Unknown document type "${type}"`}>
					<p>
						Editing items of this type is not yet implemented.
					</p>
				</ErrorBox>
			);
			break;
	}

	return (
		<div className="document">
			<Suspense
				fallback={(
					<div className="middle">
						<div style={{width: '10em', height: '10em'}}>
							<Loading/>
						</div>
					</div>
				)}
			>
				<ErrorBoundary key={idDocument}>
					{element}
				</ErrorBoundary>
			</Suspense>
			<MessageBox
				icon="error"
				visible={errorPopup !== null}
				onClose={() => setErrorPopup(null)}
			>
				<p>
					{errorPopup}
				</p>
			</MessageBox>

		</div>
	);
}

export default withRouter(Document);
