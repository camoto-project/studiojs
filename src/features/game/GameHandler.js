import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import {
	all as gameinfoFormats,
} from '@camoto/gameinfo';

import Game from './Game.js';
import GameWarnings from './GameWarnings.js';
import Loading from '../Loading.js';
import MessageBox from '../../components/MessageBox.js';
import Storage from '../../util/storage.js';

function GameHandler(props) {
	const history = useHistory();

	const [ game, setGame ] = useState(null);
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	// If the mod ID changes in the URL (or on first load), open that mod.
	useEffect(() => {
		async function loadMod() {
			const idMod = parseInt(props.match.params.id, 10);
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
				key={props.match.params.id}
				game={game}
			/>
			<GameWarnings
				warnings={warnings}
				onClose={onDismissWarnings}
			/>
		</>
	);
}

export default GameHandler;
