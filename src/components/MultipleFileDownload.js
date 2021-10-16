import React, { useCallback, useMemo, useState } from 'react';

import {
	Button,
	Modal,
	Spin,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconDownload from '@iconify/icons-fa-solid/download';

import { saveAs } from 'file-saver';

import ErrorBox from './ErrorBox.js';
import Tip from './Tip.js';

import './MultipleFileDownload.css';

function SaveGame(props) {
	const [ downloadsComplete, setDownloadsComplete ] = useState({});

	const {
		downloads: props_downloads,
	} = props;

	const onDownload = useCallback((filename, content) => {
		const blobContent = new Blob([content]);
		saveAs(blobContent, filename.toLowerCase(), { type: 'application/octet-stream' });
		setDownloadsComplete({
			...downloadsComplete,
			[filename]: true,
		});
	});

	const onClose = useCallback(() => {
		setDownloadsComplete({});

		props.onClose();
	});

	useMemo(() => {
		let dlc = {};
		for (const filename of Object.keys(props_downloads)) {
			dlc[filename] = false;
		}
		setDownloadsComplete(dlc);
	}, [
		props_downloads,
	]);

	// The close button is primary only if all downloads are complete.
	const closeButtonPrimary = !Object.values(downloadsComplete).includes(false);

	const downloadEntries = useMemo(() => (
		Object.entries(props_downloads || {})
	), [
		props_downloads,
	]);

	return (
		<Modal
			visible={props.visible}
			width={600}
			className="multiple-file-download"
			title={props.title || 'Download'}
			onClose={onClose}
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
			{props.children}

			<ErrorBox
				summary={`Error`}
				style={{display: props.errorMessage ? 'block' : 'none' }}
			>
				<p>
					{props.errorMessage}
				</p>
			</ErrorBox>

			<div style={{display: props.warnings.length ? 'block' : 'none' }}>
				<Tip icon="warning">
					<p>
						The following issues were found while saving this game.  You should
						address these issues and save again.
					</p>
					<ul>
						{props.warnings.map((warning, index) => (
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
				{(downloadEntries.length === 0) && (!props.errorMessage) && (
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
