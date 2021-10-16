import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
	Button,
	Table,
} from 'shineout';
import Tooltip from '../../components/Tooltip.js';
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

import HiddenUpload from '../../components/HiddenUpload.js';
import SaveFile from '../SaveFile.js';

import './Archive.css';

const COL_ATTR_ICON = {
	width: 24,
	align: 'center',
};

// https://stackoverflow.com/a/20732091/308237
function humanFileSize(size) {
	if (size === undefined) return '?';
	if (size < 0) return '!!';
	let i = (size === 0) ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

// Generate a table column for each attribute.
const attributeColumns = [0, 1].map(i => (
	{
		title: (
			<>
				<Tooltip>
					{[
						'Compressed?',
						'Encrypted?',
					][i]}
				</Tooltip>
				{[
					'C',
					'E',
				][i]}
			</>
		),
		render: d => (
			<span style={{
				visibility: d.attributes[[
					'compressed',
					'encrypted',
				][i]] ? 'visible' : 'hidden',
			}}>
				<Icon icon={[iconCompressed, iconEncrypted][i]} className="icon alone"/>
				<Tooltip>
					{[
						`Compressed; ${humanFileSize(d.diskSize)}`,
						`Encrypted`,
					][i]}
				</Tooltip>
			</span>
		),
		...COL_ATTR_ICON,
	}
));

function Archive(props) {
	const history = useHistory();

	const [ archive, setArchive ] = useState(props.document);
	const [ errorPopup, setErrorPopup ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	const [ archiveFiles, setArchiveFiles ] = useState([]);
	const [ idxRename, setIdxRename ] = useState(null);
	const [ renameNewName, setRenameNewName ] = useState(null);
	const [ saveVisible, setSaveVisible ] = useState(false);

	// True if the browse dialog is visible for file replacement.
	const [ importVisible, setImportVisible ] = useState(false);

	const elRename = useRef(null);

	// Focus the text box on rename.
	useEffect(() => {
		if (elRename && elRename.current) elRename.current.focus();
	});

	function updateFiles(arch) {
		setArchiveFiles(arch.files.map((f, i) => ({index: i, ...f})));
	}

	useEffect(() => {
		updateFiles(archive);
	}, [
		archive,
	]);

	function onExtract(d, i) {
		const blobContent = new Blob([d.getContent()]);
		saveAs(blobContent, d.name, { type: d.type || 'application/octet-stream' });
	}

	function onReplaceAvailable(index, newFile) {
		setImportVisible(false);
		if (newFile.error) {
			setErrorPopup(`Error reading file: ${newFile.error}`);
			return;
		}

		let f = archive.files[index];
		f.getContent = () => newFile.content;
		f.diskSize = f.nativeSize = newFile.content.length;

		updateFiles(archive);
		props.setUnsavedChanges(true);
	}

	// Make the rename text box visible.
	function onRename(d, i) {
		setIdxRename(i);
		setRenameNewName(d.name);
	}

	function onDelete(d, i) {
		archive.files.splice(i, 1);
		updateFiles(archive);
		props.setUnsavedChanges(true);
	}

	function onInsertBeforeAvailable(index, newFile) {
		setImportVisible(false);

		if (newFile.error) {
			setErrorPopup(`Error reading file: ${newFile.error}`);
			return;
		}

		let f = new File();
		f.name = newFile.name;
		f.diskSize = f.nativeSize = newFile.content.length;
		f.getContent = () => newFile.content;
		archive.files.splice(index, 0, f);
		updateFiles(archive);
		props.setUnsavedChanges(true);
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
						if (archive.files[i].name !== ev.target.value) {
							archive.files[i].name = ev.target.value;
							updateFiles(archive);
							props.setUnsavedChanges(true);
						}
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
			<div className="filename" onClick={() => onRename(d, i)}>
				{d.name}
			</div>
		);
	}

	function onSave() {
		try {
			props.cbSave(archive);
			props.setUnsavedChanges(false);
		} catch (e) {
			console.error(e);
			setErrorPopup('Unable to generate the archive file.  The reason given '
				+ 'for the failure is: ' + e.message);
			return;
		}
	}

	function renderActions(d, i) {
		return (
			<span className="hover toolbar">

				<button className="text" onClick={() => onExtract(d, i)}>
					<Icon icon={iconExtract} className="icon" />
					Extract
				</button>

				<HiddenUpload
					visible={importVisible}
					onChange={newFile => onReplaceAvailable(i, newFile)}
				>
					<button className="text">
						<Icon icon={iconReplace} className="icon" />
						Replace
					</button>
				</HiddenUpload>

				<button className="text" onClick={() => onRename(d, i)}>
					<Icon icon={iconRename} className="icon" />
					Rename
				</button>

				<button className="text" onClick={() => onDelete(d, i)}>
					<Icon icon={iconDelete} className="icon" />
					Delete
				</button>

				<HiddenUpload
					visible={importVisible}
					onChange={newFile => onInsertBeforeAvailable(i, newFile)}
				>
					<button className="text">
						<Icon icon={iconInsertBefore} className="icon" />
						Insert
						<Tooltip>
							Add a new file before this one
						</Tooltip>
					</button>
				</HiddenUpload>
			</span>
		);
	}

	return (
		<>
			<div className="toolbar">
				<button onClick={onSave}>
					<Tooltip>
						Download archive with any modifications.
					</Tooltip>
					<Icon icon={iconSave} />
				</button>
			</div>
			<div className="archive content-container">
				<div className="content">
					<Table
						className="camoto"
						keygen={d => `${d.index}.${d.name}`}
						data={archiveFiles}
						columns={[
							{
								render: d => (
									<Icon icon={iconFile} className="icon alone" />
								),
								...COL_ATTR_ICON,
							},
							{title: 'Filename', render: renderName},
							{title: 'Size', render: d => humanFileSize(d.nativeSize)},
							...attributeColumns,
							{title: 'Actions', render: renderActions},
						]}
					/>
				</div>
			</div>
		</>
	);
}

export default Archive;
