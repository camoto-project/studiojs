/*
 * Camoto Studio Online - OpenItem
 *
 * UI for opening one or more files, saving them to local storage, then pushing
 * the browser to a <Document/> accessing the item.  This provides a method for
 * opening individual files outside of a game/mod, and is used for the archive
 * and music file editors.
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

import React, { useEffect, useRef, useState } from 'react';
import {
	useHistory,
	useParams,
	useRouteMatch,
} from 'react-router-dom';

import {
	Button,
	Table,
	Tooltip,
} from 'shineout';

import MessageBox from '../../components/MessageBox.js';
import OpenFile from '../OpenFile.js';
import Storage from '../../util/storage.js';

function OpenItem(props) {
	const history = useHistory();
	const match = useRouteMatch();
	const { idEditor } = useParams();

	const [ errorPopup, setErrorPopup ] = useState(null);
	const [ newMod, setNewMod ] = useState({});

	// Create a new "mod" for this item.
	async function createNewMod(newMod) {
		console.log('createNewMod', newMod);
		const files = newMod.files;
		//delete newMod.files;
		const idNewMod = await Storage.addMod({
			...newMod,
			dateCreated: new Date(),
		}, files);

		/*
		let storedFiles = {};
		for (const f of newMod.files) {
			storedFiles[f.name] = f.content;
		}

		const idNewMod = await Storage.addMod({
			idEditor: idEditor,
			dateCreated: new Date(),
		}, storedFiles);
		*/
		return idNewMod;
	}

	async function onOpen(newMod) {
		try {
			const idTargetMod = await createNewMod(newMod);

			// Open the new item by moving to its URL.
			history.push(`../item/${idTargetMod}`);
		} catch (e) {
			console.error(e);
			setErrorPopup("Unable to save the files to the browser's "
				+ "IndexedDB storage area.  The reason given was: " + e.message);
			return;
		}
	}

	return (
		<>
			<OpenFile
				category={idEditor}
				title="Select a file"
				onOpen={onOpen}
				renderCancel={(
					<button onClick={() => history.push('/')} className="link">
						Cancel
					</button>
				)}
			/>
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

export default OpenItem;
