import React, { useState, useEffect } from 'react';

import {
	Button,
	Modal,
	Spin,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconDownload from '@iconify/icons-fa-solid/download';

import { saveAs } from 'file-saver';

import MultipleFileDownload from '../../components/MultipleFileDownload.js';

function SaveGame(props) {
	const [ downloads, setDownloads ] = useState({});
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	useEffect(() => {
		if (!props.visible) {
			// Don't regenerate the game if the dialog isn't visible.
			setDownloads({});
			return;
		}

		async function regenerateGame() {
			setDownloads({});
			setErrorMessage(null);

			let output, preflight;
			try {
				preflight = await props.game.preflight();
				output = await props.game.save();
			} catch (e) {
				console.error(e);
				setErrorMessage(`Unable to save: ${e.message}`);
				return;
			}
			const { files, warnings } = output;
			setDownloads(files || {});
			setWarnings([
				...preflight.map(pf => pf.detail) || [],
				...warnings || [],
			]);
		}
		regenerateGame();
	}, [
		props.game,
		props.visible,
	]);

	function onClose() {
		// Erase the downloads first, otherwise they are still visible (instead of
		// the 'loading' animation) when the dialog appears a second time.
		setDownloads({});

		props.onClose();
	}

	return (
		<MultipleFileDownload
			visible={props.visible}
			title="Save game"
			onClose={onClose}
			unsavedChanges={props.unsavedChanges}
			errorMessage={errorMessage}
			warnings={warnings}
			downloads={downloads}
		>
			<p>
				Download these files to save your modifications to the game.  You can
				later start a new mod, and select these files instead of the original
				game files, to create an independent copy of the mod (or if you want to
				transfer the mod to Camoto running on a different device).
			</p>
		</MultipleFileDownload>
	);
}

export default SaveGame;
