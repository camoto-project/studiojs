import React, { useState } from 'react';

import {
	Button,
	Form,
	Modal,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconDownload from '@iconify/icons-fa-solid/download';

import { saveAs } from 'file-saver';
import {
	all as gamemusicFormats,
} from '@camoto/gamemusic';

import {
	all as gamearchiveFormats,
} from '@camoto/gamearchive';

import ErrorBox from '../components/ErrorBox.js';
import FormatList from '../components/FormatList.js';

const allFormats = {
	music: gamemusicFormats,
	archive: gamearchiveFormats,
};

function SaveFile(props) {
	const [ chosenFormat, setChosenFormat ] = useState(props.defaultFormat);
	const [ downloads, setDownloads ] = useState(null);
	const [ downloadsComplete, setDownloadsComplete ] = useState({});
	const [ errorMessage, setErrorMessage ] = useState(null);

	const catFormats = allFormats[props.category];

	// User changed the file format, so regenate it with the new handler.
	function onChosenFormatChange(idNewFormat) {
		setErrorMessage(null);
		setChosenFormat(idNewFormat);
		regenerate(idNewFormat);
	}

	function regenerate(idFormat) {
		setDownloads({});
		const handler = catFormats.find(h => h.metadata().id === idFormat);
		if (!handler) {
			setErrorMessage(`Unable to find handler for "${idFormat}".`);
			return;
		}

		let output;
		try {
			output = handler.generate(props.document);
		} catch (e) {
			console.error(e);
			setErrorMessage(`Unable to save: ${e.message}`);
			return;
		}

		// Recalculate the supp filenames based on whatever format we're now using.
		const suppFilenames = handler.supps(props.originalFilenames.main || 'untitled', output.main);

		let dl = {}, dlc = {};
		for (const [ id, content ] of Object.entries(output)) {
			dl[id] = content;
			dl[id].filename = suppFilenames[id] || props.originalFilenames[id] || id;
			dlc[id] = false;
		}
		setDownloads(dl);
		setDownloadsComplete(dlc);
	}
	// Generate on first run (downloads is only null on first run, after that
	// it's `{}` on error.
	if (downloads === null) regenerate(chosenFormat);

	function onDownload(id, dl) {
		const blobContent = new Blob([dl]);
		saveAs(blobContent, dl.filename, { type: 'application/octet-stream' });
		setDownloadsComplete({
			...downloadsComplete,
			[id]: true,
		});
	}

	// The close button is primary only if all downloads are complete.
	const closeButtonPrimary = !Object.values(downloadsComplete).includes(false);

	return (
		<Modal
			visible
			width={600}
			title={props.title || 'Save document'}
			onClose={props.onClose}
			footer={(
				<Button
					onClick={props.onClose}
					type={closeButtonPrimary ? 'primary' : 'default'}
				>
					Done
				</Button>
			)}
		>
			<Form>
				<p>
					Download these files to save your modifications.
				</p>

				<Form.Item label="File format">
					<FormatList
						category={props.category}
						onChange={onChosenFormatChange}
						value={chosenFormat}
					/>
				</Form.Item>


				{errorMessage && (
					<ErrorBox summary={`Error`}>
						<p>
							{errorMessage}
						</p>
					</ErrorBox>
				)}

				{downloads && (
					<Form.Item label="Files to download">
						{Object.entries(downloads).map(([id, dl]) => (
							<div key={id}>
								<Button
									onClick={() => onDownload(id, dl)}
									type={downloadsComplete[id] ? 'default' : 'primary'}
									style={{marginBottom: '1ex'}}
								>
									<Icon icon={iconDownload} className="icon" />
									{dl.filename || 'Download'}
								</Button>
							</div>
						))}
					</Form.Item>
				)}

			</Form>
		</Modal>
	);
}

export default SaveFile;
