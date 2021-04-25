import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import {
	all as gameinfoFormats,
} from '@camoto/gameinfo';

import Game from './Game.js';
import WarningListModal from '../../components/WarningListModal.js';
import Loading from '../Loading.js';
import MessageBox from '../../components/MessageBox.js';
import Storage from '../../util/storage.js';

function GameHandler(props) {
	const history = useHistory();

	const [ game, setGame ] = useState(null);
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ overlayErrorMessage, setOverlayErrorMessage ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	const idMod = parseInt(props.match.params.id, 10);

	// If the mod ID changes in the URL (or on first load), open that mod.
	useEffect(() => {
		async function loadMod() {
			let mod;
			try {
				mod = await Storage.getMod(idMod);
			} catch (e) {
				console.error(e);
				setErrorMessage("Unexpected error when trying to load this mod from the "
					+ "browser's IndexedDB storage: " + e.message);
				return;
			}
			if (!mod) {
				console.log(`Invalid mod ID ${idMod}`);
				setErrorMessage('This mod ID is not valid.  If it was valid in the past, '
					+ 'your web browser may have removed it to reclaim disk space.');
				return;
			}

			const idGame = mod.idGame;
			const handler = gameinfoFormats.find(h => h.metadata().id === idGame);
			if (!handler) {
				setErrorMessage(`The game used by this mod ("${idGame}") is no longer `
					+ `supported.`);
				return;
			}

			const filesystem = Storage.filesystemForMod(idMod);
			let gameHandler = new handler(filesystem);
			try {
				const warnings = await gameHandler.open();
				setWarnings(warnings);
				setGame(gameHandler);
			} catch (e) {
				console.error('Error loading mod:', e);
				setErrorMessage(e.message);
				return;
			}
		}
		loadMod();
	}, [
		props.match.params.id
	]);

	// Save the game back to the original files and update IndexedDB.
	async function saveMod() {
		let output;
		try {
			output = await game.save();
		} catch (e) {
			console.error('Error saving mod:', e);
			setOverlayErrorMessage(`Unable to save: ${e.message}`);
			return;
		}

		const { files, warnings } = output;
		setWarnings(warnings || []);
		await Storage.setFiles(idMod, files);
	}

	function onDismissWarnings() {
		setWarnings([]);
	}

	if (errorMessage) {
		// TODO: Make this look nice and give a back button to go home.
		return (
			<MessageBox
				icon="error"
				visible={true}
				onClose={() => history.push('/')}
			>
				<p>
					The game could not be opened.  It reported the following reason:
				</p>
				<p>
					{errorMessage}
				</p>
			</MessageBox>
		);
	}

	if (!game) {
		return (
			<Loading/>
		);
	}

	return (
		<>
			<Game
				key={idMod}
				idMod={idMod}
				game={game}
				cbSaveMod={saveMod}
			/>

			<WarningListModal
				warnings={warnings}
				onClose={onDismissWarnings}
			>
				<p>
					The following issues were encountered:
				</p>
			</WarningListModal>

			<MessageBox
				icon="error"
				visible={overlayErrorMessage !== null}
				onClose={() => setOverlayErrorMessage(null)}
			>
				<p>
					{overlayErrorMessage}
				</p>
			</MessageBox>
		</>
	);
}

export default GameHandler;
