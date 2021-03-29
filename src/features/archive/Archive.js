import React, { useState } from 'react';
import { Link as RRLink } from 'react-router-dom';

import {
	Button,
	Table,
	Tooltip,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconCompressed from '@iconify/icons-fa-solid/file-archive';
import iconEncrypted from '@iconify/icons-fa-solid/key';
import iconFile from '@iconify/icons-fa-solid/file';
import iconFolderOpen from '@iconify/icons-fa-solid/folder-open';
import iconSave from '@iconify/icons-fa-solid/download';
import iconClose from '@iconify/icons-fa-solid/times';

import OpenFile from '../OpenFile.js';

import './Archive.css';

// https://stackoverflow.com/a/20732091/308237
function humanFileSize(size) {
	if (size === undefined) return '?';
	if (size < 0) return '!!';
	let i = (size == 0) ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function Archive() {
	const [ archive, setArchive ] = useState(null);
	const [ archiveFiles, setArchiveFiles ] = useState([]);

	function openArchive(newArchive) {
		setArchive(newArchive);
		setArchiveFiles(newArchive.files);
	}

	// If no archive has been opened, prompt for one.
	if (!archive) {
		return (
			<OpenFile
				category="archive"
				title="Select an archive file"
				onOpen={newArchive => openArchive(newArchive)}
				renderCancel={(
					<RRLink to="/">
						Cancel
					</RRLink>
				)}
			/>
		);
	}

	// Save the archive with any modifications.
	function save() {
	}

	// Render the value for the 'Attributes' column.
	function renderAttributes(d) {
		let attrC = null;
		if (d.attributes.compressed) {
			attrC = (
				<Tooltip tip={'Compressed; ' + humanFileSize(d.diskSize)} position="top">
					<Icon icon={iconCompressed} style={{marginRight: 6, marginBottom: -1}} />
				</Tooltip>
			);
		}

		let attrE = null;
		if (d.attributes.encrypted) {
			attrE = (
				<Tooltip tip="Encrypted" position="top">
					<Icon icon={iconEncrypted} style={{marginRight: 6, marginBottom: -1}} />
				</Tooltip>
			);
		}

		return (
			<>
				{attrC}
				{attrE}
			</>
		);
	}

	function renderName(d) {
		return (
			<>
				<Icon icon={iconFile} style={{marginRight: 6, marginBottom: -1}} />
				{d.name}
			</>
		);
	}

	return (
		<div className="root">
			<div className="toolbar">
				<Button type="secondary" onClick={() => setArchive(null)}>
					<Icon icon={iconFolderOpen} style={{marginRight: 6, marginBottom: -1}} />
					Open new archive
				</Button>
				<Button type="primary" onClick={() => save()}>
					<Icon icon={iconSave} style={{marginRight: 6, marginBottom: -1}} />
					Save
				</Button>
				<div className="separator" />
				<RRLink to="/" className="exit">
					<Icon icon={iconClose} style={{marginBottom: -1}} />
				</RRLink>
			</div>
			<Table
				className="fileList"
				keygen={(d, i) => `${i}.${d.name}`}
				data={archiveFiles}
				columns={[
					{title: 'Filename', render: renderName},
					{title: 'Size', render: d => humanFileSize(d.nativeSize)},
					{title: 'Attributes', render: renderAttributes},
				]}
			/>
		</div>
	);
}

export default Archive;
