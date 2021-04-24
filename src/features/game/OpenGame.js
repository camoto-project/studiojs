import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import {
	Button,
	Divider,
	Form,
	List,
	Modal,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconEdit from '@iconify/icons-fa-solid/edit';

import ErrorBox from '../../components/ErrorBox.js';
import ModSelector from './ModSelector.js';
import NewMod from './NewMod.js';
import Storage from '../../util/storage.js';

import './OpenGame.css';

function OpenGame(props) {
	const history = useHistory();

	// State for creating a new mod.
	const [ newMod, setNewMod ] = useState({});
	//const [ selectedGame, setSelectedGame ] = useState(null);
	//const [ files, setFiles ] = useState([]);


	// Shared state.
	const [ errorMessage, setErrorMessage ] = useState(null);

	// Create a new mod.
	async function createNewMod(newMod) {
		let storedFiles = {};
		for (const f of newMod.files) {
			storedFiles[f.name] = f.content;
		}

		const idNewMod = await Storage.addMod({
			idGame: newMod.idGame,
			title: newMod.title || 'Untitled',
			dateCreated: new Date(),
		}, storedFiles);

		return idNewMod;
	}

	function onModChange(mod) {
		// Open the mod as soon as it's selected.
		history.push(`/game/${mod}`);
	}

	function onCancel() {
		history.push('/');
	}

	async function onOpen() {
		setErrorMessage(null);
		try {
			const idTargetMod = await createNewMod(newMod);

			// Open the new game by moving to its URL.
			history.push(`/game/${idTargetMod}`);
		} catch (e) {
			console.error(e);
			setErrorMessage("Unable to save the game's files to the browser's "
				+ "IndexedDB storage area.  The reason given was: " + e.message);
			return;
		}
	}

	// Only enable the 'new' (open) button if a game has been selected as well
	// as files chosen.
	let openEnabled = (
		(newMod.game !== null)
		&& (newMod.files && (newMod.files.length > 0))
	);

	return (
		<Modal
			visible={true}
			width={600}
			title={props.title || 'Get started'}
			onClose={onCancel}
			footer={(
				<>
					<a onClick={onCancel} className="cancel">
						Cancel
					</a>
					<Button
						disabled={!openEnabled}
						onClick={onOpen}
						type="primary"
					>
						<Icon icon={iconEdit} style={{marginRight: 6, marginBottom: -1}} />
						New
					</Button>
				</>
			)}
		>
			<h3>
				Resume work on a previous mod
			</h3>
			<div className="postH3">
				<ModSelector
					visible={true}
					onModChange={onModChange}
				/>
			</div>

			<Divider />

			<h3>
				Start a new mod
			</h3>
			<div className="postH3">
				<NewMod
					visible={true}
					onChange={setNewMod}
					value={newMod}
				/>
			</div>

			{errorMessage && (
				<ErrorBox summary={`Error`}>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
			)}

		</Modal>
	);
}

export default OpenGame;
