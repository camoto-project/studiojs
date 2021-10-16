/*
 * Camoto Studio Online - GameItem
 *
 * GameItem reads an item from the parent <Game/> and passes the details on to
 * a child <Document/>.  It provides the same service as <StandaloneItem/> only
 * that component loads the item from user-supplied values, while this component
 * loads the item from the supplied <Game/>.
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

import React, { useEffect, useState, useMemo } from 'react';
import {
	useParams,
} from 'react-router-dom';

import ErrorBoundary from '../../components/ErrorBoundary.js';
import MessageBox from '../../components/MessageBox.js';
import Document from '../Document.js';

function GameItem(props) {
	const [ errorPopup, setErrorPopup ] = useState(null);

	const { idDocument } = useParams();

	// Keep useMemo() and useCallback() happy.
	const {
		cbSaveMod: props_cbSaveMod,
		gameItems: props_gameItems,
		setDocTitle: props_setDocTitle,
		setSaving: props_setSaving,
	} = props;

	// Open the game item and return a key/value object, which will be expanded
	// and passed as props to <Document/>.
	const openInstance = useMemo(() => {
		if (!props_gameItems) {
			// Game hasn't loaded yet, don't render anything.
			return {
				item: {
					type: undefined,
				},
				document: undefined,
			};
		}

		// No document ID, show the initial tips page.
		if (!idDocument) {
			return {
				item: props_gameItems['_new'],
				document: undefined,
			};
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

						// Hack to slightly improve UI performance.  Should probably think
						// about moving this stuff into Web Workers.
						await(new Promise(resolve => setTimeout(resolve, 0)));

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
			console.log('Above exception caught while trying to open item:', d);
			return {
				item: {
					type: 'error',
				},
				document: e,
			};
		}
	}, [
		idDocument,
		props_cbSaveMod,
		props_gameItems,
		props_setSaving,
	]);

	// Update the browser page/tab title to include this document name.
	useEffect(() => {
		const item = props_gameItems && props_gameItems[idDocument];
		props_setDocTitle(item && item.title);
	}, [
		props_gameItems,
		props_setDocTitle,
		idDocument,
	]);

	return (
		<>
			<ErrorBoundary key={idDocument}>
				<Document
					{...props}
					{...openInstance}
				/>
			</ErrorBoundary>
			<MessageBox
				icon="error"
				visible={errorPopup !== null}
				onClose={() => setErrorPopup(null)}
			>
				<p>
					{errorPopup}
				</p>
			</MessageBox>
		</>
	);
}

export default GameItem;
