import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
	Button,
	Card,
	Divider,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconEdit from '@iconify/icons-fa-solid/edit';

import ErrorBox from '../../components/ErrorBox.js';
import ModSelector from './ModSelector.js';
import NewMod from './NewMod.js';
import Storage from '../../util/storage.js';
import setPageTitle from '../../util/setPageTitle.js';

import './OpenGame.css';

function OpenGame(props) {
	const history = useHistory();

	const [ newMod, setNewMod ] = useState({});
	const [ errorMessage, setErrorMessage ] = useState(null);

	// Create a new mod.
	async function createNewMod(newMod) {
		if (!newMod.idGame) {
			console.error('Bad new-mod data:', newMod);
			throw new Error('Missing game ID.');
		}

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
		(newMod.idGame !== undefined)
		&& (newMod.files && (newMod.files.length > 0))
	);

	setPageTitle();
	return (
		<div className="mainCard">
			<Card>
				<Card.Header>
					Get started
				</Card.Header>
				<Card.Body>
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
				</Card.Body>

				<Card.Footer>
					<button onClick={onCancel} className="link">
						Cancel
					</button>
					<span className="flex-spacer"/>
					<Button
						disabled={!openEnabled}
						onClick={onOpen}
						type="primary"
					>
						<Icon icon={iconEdit} className="icon" />
						New
					</Button>
				</Card.Footer>

			</Card>
		</div>
	);
}

export default OpenGame;
