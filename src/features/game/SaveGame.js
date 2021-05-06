import React, { useState, useEffect } from 'react';

import {
	Button,
	Modal,
	Spin,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconDownload from '@iconify/icons-fa-solid/download';

import { saveAs } from 'file-saver';

import ErrorBox from '../../components/ErrorBox.js';
import Tip from '../../components/Tip.js';

function SaveGame(props) {
	const [ downloads, setDownloads ] = useState({});
	const [ downloadsComplete, setDownloadsComplete ] = useState({});
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	function onDownload(filename, content) {
		const blobContent = new Blob([content]);
		saveAs(blobContent, filename.toLowerCase(), { type: 'application/octet-stream' });
		setDownloadsComplete({
			...downloadsComplete,
			[filename]: true,
		});
	}

	useEffect(() => {
		if (!props.visible) {
			// Don't regenerate the game if the dialog isn't visible.
			setDownloads({});
			return;
		}

		async function regenerateGame() {
			setDownloads({});

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

			let dlc = {};
			for (const filename of Object.keys(files)) {
				dlc[filename] = false;
			}
			setDownloadsComplete(dlc);
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
		setDownloadsComplete({});

		props.onClose();
	}

	// The close button is primary only if all downloads are complete.
	const closeButtonPrimary = !Object.values(downloadsComplete).includes(false);

	const downloadEntries = Object.entries(downloads);

	return (
		<Modal
			visible={props.visible}
			width={600}
			title={props.title || 'Save game'}
			onClose={props.onClose}
			footer={(
				<>
					<span className="flex-spacer"/>
					<Button
						onClick={onClose}
						type={closeButtonPrimary ? 'primary' : 'default'}
					>
						Done
					</Button>
				</>
			)}
		>
			<p>
				Download these files to save your modifications to the game.  You can
				later start a new mod, and select these files instead of the original
				game files, to create an independent copy of the mod (or if you want to
				transfer the mod to Camoto running on a different device).
			</p>

			<ErrorBox
				summary={`Error`}
				style={{display: errorMessage === null ? 'none' : 'block' }}
			>
				<p>
					{errorMessage}
				</p>
			</ErrorBox>

			<div style={{display: warnings.length ? 'block' : 'none' }}>
				<Tip icon="warning">
					<p>
						The following issues were found while saving this game.  You should
						address these issues and save again.
					</p>
					<ul>
						{warnings.map((warning, index) => (
							<li key={index}>
								{warning}
							</li>
						))}
					</ul>
					<p>
						You can save anyway but you may get incomplete or incorrect data
						saved if one of the above messages is warning you of this.
					</p>
				</Tip>
			</div>

			<h4>Files to download</h4>

			{props.unsavedChanges && (
				<Tip icon="warning">
					<p>
						You have unsaved changes in the item currently open.  These changes
						won't be included in the files below!
					</p>
				</Tip>
			)}

			<div style={{marginLeft: '1em'}}>
				{(downloadEntries.length === 0) && (errorMessage === null) && (
					<Spin name="four-dots" />
				)}
				{downloadEntries.map(([filename, content]) => (
					<div key={filename}>
						<Button
							onClick={() => onDownload(filename, content)}
							type={downloadsComplete[filename] ? 'default' : 'primary'}
							style={{marginBottom: '1ex'}}
						>
							<Icon icon={iconDownload} className="icon" />
							{(filename && filename.toLowerCase()) || 'Download'}
						</Button>
					</div>
				))}
			</div>

		</Modal>
	);
}

export default SaveGame;
