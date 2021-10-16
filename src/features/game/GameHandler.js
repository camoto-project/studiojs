/*
 * Camoto Studio Online - GameHandler
 *
 * This is the top-level component for a mod, handling loading it from browser
 * storage and passing it to the Game component.
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
			if (isNaN(idMod)) {
				console.log(`Invalid mod ID ${idMod}`);
				setErrorMessage('This mod ID is not valid.');
				return;
			}

			let mod;
			try {
				mod = await Storage.getMod(idMod);
			} catch (e) {
				console.error(`Error loading mod ${idMod}:`, e);
				setErrorMessage("Unexpected error when trying to load this mod from the "
					+ "browser's IndexedDB storage: " + e.message);
				return;
			}
			if (!mod) {
				console.log(`Loading mod ID ${idMod} returned blank`);
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
		idMod
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
