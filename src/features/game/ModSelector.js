/*
 * Camoto Studio Online - ModSelector
 *
 * Present a list of mods retrieved from browser storage.
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

import React, { useCallback, useEffect, useState } from 'react';

import {
	Table,
	Spin,
} from 'shineout';
import {
	Icon,
	iconDelete,
	getIconFromEditorId,
} from '../../util/icons.js';

import Storage from '../../util/storage.js';
import ErrorBox from '../../components/ErrorBox.js';
import MessageBox from '../../components/MessageBox.js';

import './OpenGame.css';

function ModSelector(props) {
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ mods, setMods ] = useState(null);
	const [ modToDelete, setModToDelete ] = useState(null);
	const [ deleteInProgress, setDeleteInProgress ] = useState(false);

	const {
		includeMods: props_includeMods,
		includeStandalone: props_includeStandalone,
	} = props;

	useEffect(() => {
		async function populateMods() {
			setErrorMessage(null);
			setMods(null);
			let loadedMods;
			try {
				loadedMods = await Storage.getMods();
			} catch (e) {
				console.error(e);
				setErrorMessage('Unable to load mod list: ' + e.message);
			}
			if (loadedMods && ((!props_includeMods) || (!props_includeStandalone))) {
				// Have to filter out some mods.
				loadedMods = loadedMods.filter(m => (
					(props_includeMods && !m.standalone)
					|| (props_includeStandalone && m.idEditor/*m.standalone*/)
				));
			}
			setMods(loadedMods);
		}
		populateMods();
	}, [
		props_includeMods,
		props_includeStandalone,
	]);

	const deleteMod = useCallback((mod, event) => {
		event.stopPropagation(); // prevent mod from being opened
		setDeleteInProgress(false);
		setModToDelete(mod); // confirm with user
	});

	const performDelete = useCallback(async () => {
		try {
			setDeleteInProgress(true);
			await Storage.deleteMod(modToDelete.id);
			setModToDelete(null);
			// Remove from the in-memory list so the UI updates.
			setMods(mods.filter(m => m.id !== modToDelete.id));
			setDeleteInProgress(false);
		} catch (e) {
			setErrorMessage('Delete failed: ' + e.message);
		}
	});

	let jsxMods;
	if (mods) {
		if (mods.length) {
			jsxMods = (
				<Table
					style={{maxHeight: '25em'}}
					fixed="y"
					data={props.limit ? mods.slice(0, props.limit) : mods}
					keygen="id"
					format="id"
					columns={[
						{
							title: 'Name',
							render: d => (
								<div className="modItem">
									{d.idEditor && (
										<>
											<Icon icon={getIconFromEditorId(d.idEditor)} className="icon" />
											{d.mainFilename || '(no filename)'}
										</>
									) || (
										<>
											<img src={`/game-icons/${d.idGame}.png`} alt="" className="icon" />
											{d.title || 'Untitled'}
										</>
									)}
									<span className="modActions">
										<span className="deleteAction" onClick={ev => deleteMod(d, ev)}>
											<Icon icon={iconDelete} />
										</span>
									</span>
								</div>
							),
						},
					]}
					hover={false}
					radio
					onRowClick={d => props.onModChange(d)}
					value={props.value}
				/>
			);
		} else {
			if (props.hideOnEmpty) {
				// No mods, caller doesn't want anything visible.
				return null;
			}
			jsxMods = (
				<p>
					No existing mods found.
				</p>
			);
		}
	} else {
		jsxMods = <Spin name="four-dots" />;
	}

	return (
		<div
			className="previousMod"
			style={{display: props.visible ? 'block' : 'none'}}
		>
			<h3>
				{props.heading}
			</h3>

			<MessageBox
				visible={!!modToDelete}
				icon="warning"
				onClose={() => setModToDelete(null)}
				onOK={performDelete}
				confirm
				okIcon={iconDelete}
				okBusy={deleteInProgress}
				okText="Delete"
				buttonTypeOK="danger"
			>
				{modToDelete && modToDelete.standalone && (
					<>
						<p>
							Are you sure you want to delete
							&quot;{modToDelete.mainFilename || '(no filename)'}&quot; from the
							browser cache?  Any files you have downloaded won't be affected.
						</p>
						<p>
							This cannot be undone.  Make sure you have downloaded/saved this
							file before deleting it.
						</p>
					</>
				) || (
					<>
						<p>
							Are you sure you want to delete the mod
							&quot;{(modToDelete && modToDelete.title) || 'Untitled'}&quot;?
						</p>
						<p>
							This cannot be undone.  Make sure you have downloaded/saved your
							mod before deleting it, just in case.
						</p>
					</>
				)}
			</MessageBox>

			<div className="postH3">
				{errorMessage && (
					<ErrorBox summary={`Error`}>
						<p>
							{errorMessage}
						</p>
					</ErrorBox>
				) || jsxMods}
			</div>

		</div>
	);
}

export default ModSelector;
