import React, { useState, useEffect } from 'react';

import {
	all as gameinfoFormats,
} from '@camoto/gameinfo';

import ErrorBox from '../../components/ErrorBox.js';
import Game from './Game.js';
import Loading from '../Loading.js';
import Storage from '../../util/storage.js';

function GameHandler(props) {
	const [ game, setGame ] = useState(null);
	const [ errorMessage, setErrorMessage ] = useState(null);

	// If the mod ID changes in the URL (or on first load), open that mod.
	useEffect(async () => {
		const idMod = parseInt(props.match.params.id, 10);
		const mod = await Storage.getMod(idMod);
		if (!mod) {
			console.log(`Invalid mod ID ${idMod}`);
			setErrorMessage('This mod ID is not valid.  If it was valid in the past, '
				+ 'your web browser may have removed it to reclaim disk space.');
			return;
		}

		const idGame = mod.idGame;
		const handler = gameinfoFormats.find(h => h.metadata().id === idGame);
		if (!handler) {
			setErrorMessage(`The game used by this mod ("${idGame}") is no longer supported.`);
			return;
		}

		const filesystem = Storage.filesystemForMod(idMod);
		let gameHandler = new handler(filesystem);
		try {
			const warnings = await gameHandler.open();
			// TODO: Display warnings and let user retry or proceed
			setGame(gameHandler);
		} catch (e) {
			console.error('Error loading mod:', e);
			setErrorMessage(e.message);
			return;
		}
	}, [
		props.match.params.id
	]);

	if (errorMessage) {
		// TODO: Make this look nice and give a back button to go home.
		return (
			<ErrorBox summary="Error loading mod">
				{errorMessage}
			</ErrorBox>
		);
	}

	if (!game) {
		return (
			<Loading/>
		);
	}

	return (
		<Game
			key={props.match.params.id}
			game={game}
		/>
	);
}

export default GameHandler;
