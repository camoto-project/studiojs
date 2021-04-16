import React, { useEffect, useRef, useState } from 'react';
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
import iconExtract from '@iconify/icons-fa-solid/file-export';
import iconReplace from '@iconify/icons-fa-solid/file-import';
import iconRename from '@iconify/icons-fa-solid/edit';
import iconDelete from '@iconify/icons-fa-solid/trash-alt';
import iconInsertBefore from '@iconify/icons-fa-solid/level-up-alt';

import { saveAs } from 'file-saver';
import { File } from '@camoto/gamearchive';

import OpenFile from '../OpenFile.js';
import SaveFile from '../SaveFile.js';

import './Archive.css';

// https://stackoverflow.com/a/20732091/308237
function humanFileSize(size) {
	if (size === undefined) return '?';
	if (size < 0) return '!!';
	let i = (size === 0) ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function Archive() {
	const [ archiveFormat, setArchiveFormat ] = useState(null);
	const [ archive, setArchive ] = useState(null);
	const [ archiveFiles, setArchiveFiles ] = useState([]);
	const [ originalFilenames, setOriginalFilenames ] = useState({});
	const [ idxRename, setIdxRename ] = useState(null);
	const [ renameNewName, setRenameNewName ] = useState(null);
	const [ saveVisible, setSaveVisible ] = useState(false);
	const elRename = useRef(null);

	// Focus the text box on rename.
	useEffect(() => {
		if (elRename && elRename.current) elRename.current.focus();
	});

	function updateFiles(arch) {
		setArchiveFiles(arch.files.map((f, i) => ({index: i, ...f})));
	}

	function openArchive(newArchive, idFormat, filenames) {
		setArchiveFormat(idFormat);
		setArchive(newArchive);
		setOriginalFilenames(filenames);
		updateFiles(newArchive);
	}

	// If no archive has been opened, prompt for one.
	if (!archive) {
		return (
			<OpenFile
				category="archive"
				title="Select an archive file"
				onOpen={openArchive}
				renderCancel={(
					<RRLink to="/">
						Cancel
					</RRLink>
				)}
			/>
		);
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

	function onExtract(d, i) {
		const blobContent = new Blob([d.getContent()]);
		saveAs(blobContent, d.name, { type: d.type || 'application/octet-stream' });
	}

	function onReplace(d, i) {
		updateFiles(archive);
	}

	function onRename(d, i) {
		setIdxRename(i);
		setRenameNewName(d.name);
	}

	function onDelete(d, i) {
		archive.files.splice(i, 1);
		updateFiles(archive);
	}

	function onInsertBefore(d, i) {
		let f = new File();
		f.name = 'todo';
		f.diskSize = f.nativeSize = 0;
		f.getContent = () => null;
		archive.files.splice(i, 0, f);
		updateFiles(archive);
	}

	function renderName(d, i) {
		if (idxRename === i) {
			return (
				<input
					type="text"
					ref={elRename}
					value={renameNewName}
					onChange={ev => setRenameNewName(ev.target.value)}
					size="small"
					onBlur={ev => {
						archive.files[i].name = ev.target.value;
						updateFiles(archive);
						setIdxRename(null);
					}}
					onKeyDown={ev => {
						if (ev.key === 'Escape') {
							setIdxRename(null);
							setRenameNewName(d.name);
						}
					}}
				/>
			);
		}
		return (
			<span onClick={() => onRename(d, i)}>
				{d.name}
			</span>
		);
	}

	function renderActions(d, i) {
		return (
			<span className="hover actions">
				<span className="action" onClick={() => onExtract(d, i)}>
					<Icon icon={iconExtract} style={{marginRight: 6, marginBottom: -1}} />
					Extract
				</span>
				<span className="action" onClick={() => onReplace(d, i)}>
					<Icon icon={iconReplace} style={{marginRight: 6, marginBottom: -1}} />
					Replace
				</span>
				<span className="action" onClick={() => onRename(d, i)}>
					<Icon icon={iconRename} style={{marginRight: 6, marginBottom: -1}} />
					Rename
				</span>
				<span className="action" onClick={() => onDelete(d, i)}>
					<Icon icon={iconDelete} style={{marginRight: 6, marginBottom: -1}} />
					Delete
				</span>
				<Tooltip tip="Add a new file before this one">
					<span className="action" onClick={() => onInsertBefore(d, i)}>
						<Icon icon={iconInsertBefore} style={{marginRight: 6, marginBottom: -1}} />
						Insert before
					</span>
				</Tooltip>
			</span>
		);
	}

	return (
		<div className="root">
			<div className="toolbar">
				<Button type="secondary" onClick={() => setArchive(null)}>
					<Icon icon={iconFolderOpen} style={{marginRight: 6, marginBottom: -1}} />
					Open new archive
				</Button>
				<Button type="primary" onClick={() => setSaveVisible(true)}>
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
				keygen={d => `${d.index}.${d.name}`}
				data={archiveFiles}
				columns={[
					{render: d => (
						<Icon icon={iconFile} style={{marginRight: 6, marginBottom: -1}} />
					)},
					{title: 'Filename', render: renderName},
					{title: 'Size', render: d => humanFileSize(d.nativeSize)},
					{title: 'Attributes', render: renderAttributes},
					{title: 'Actions', render: renderActions},
				]}
			/>
			{saveVisible && (
				<SaveFile
					category="archive"
					document={archive}
					title="Save archive"
					defaultFormat={archiveFormat}
					originalFilenames={originalFilenames}
					onClose={() => setSaveVisible(false)}
				/>
			)}
		</div>
	);
}

export default Archive;
