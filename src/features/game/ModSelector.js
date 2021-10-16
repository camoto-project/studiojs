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

import React, { useState, useEffect } from 'react';

import {
	Table,
	Spin,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconDelete from '@iconify/icons-fa-solid/trash-alt';

import Storage from '../../util/storage.js';
import ErrorBox from '../../components/ErrorBox.js';
import MessageBox from '../../components/MessageBox.js';

import './OpenGame.css';

function ModSelector(props) {
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ mods, setMods ] = useState(null);
	const [ modToDelete, setModToDelete ] = useState(null);
	const [ deleteInProgress, setDeleteInProgress ] = useState(false);

	useEffect(() => {
		async function populateMods() {
			setErrorMessage(null);
			try {
				setMods(await Storage.getMods());
			} catch (e) {
				console.error(e);
				setErrorMessage('Unable to load mod list: ' + e.message);
			}
		}
		populateMods();
	}, []);

	function deleteMod(mod, event) {
		event.stopPropagation(); // prevent mod from being opened
		setDeleteInProgress(false);
		setModToDelete(mod); // confirm with user
	}

	async function performDelete() {
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
	}

	let jsxMods;
	if (mods) {
		if (mods.length) {
			jsxMods = (
				<Table
					style={{maxHeight: '25em'}}
					fixed="y"
					data={mods}
					keygen="id"
					format="id"
					columns={[
						{
							title: 'Name',
							render: d => (
								<div className="modItem">
									<img src={`/game-icons/${d.idGame}.png`} alt="" className="icon" />
									{d.title || 'Untitled'}
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
					onRowClick={d => props.onModChange(d.id)}
					value={props.value}
				/>
			);
		} else {
			jsxMods = (
				<p>
					No existing mods found.  Create a new mod below.
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
			{errorMessage && (
				<ErrorBox summary={`Error`}>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
			)}

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
				<p>
					Are you sure you want to delete the mod
					&quot;{modToDelete && modToDelete.title}&quot;?
				</p>
				<p>
					This cannot be undone.  Make sure you have downloaded/saved your mod
					before deleting it, just in case.
				</p>
			</MessageBox>

			{jsxMods}
		</div>
	);
}

export default ModSelector;
