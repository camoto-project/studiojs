/*
 * Camoto Studio Online - Archive editor
 *
 * UI for editing gamearchive.js instances.
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

import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
	Table,
} from 'shineout';

import Tooltip from '../../components/Tooltip.js';
import {
	Icon,
	iconCompressed,
	iconDelete,
	iconEncrypted,
	iconExtract,
	iconFile,
	iconInsertBefore,
	iconRename,
	iconReplace,
	iconSave,
} from '../../util/icons.js';

import { saveAs } from 'file-saver';
import { File } from '@camoto/gamearchive';

import HiddenUpload from '../../components/HiddenUpload.js';
import MessageBox from '../../components/MessageBox.js';

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

function onExtract(d, i) {
	const blobContent = new Blob([d.getContent()]);
	saveAs(blobContent, d.name, { type: d.type || 'application/octet-stream' });
}

function Archive(props) {
	const {
		setUnsavedChanges: props_setUnsavedChanges,
	} = props;

	const [ archive ] = useState(props.document);
	const [ errorPopup, setErrorPopup ] = useState(null);

	const [ archiveFiles, setArchiveFiles ] = useState(null);

	const [ idxRename, setIdxRename ] = useState(null);
	const [ renameNewName, setRenameNewName ] = useState(null);

	// True if the browse dialog is visible for file replacement.
	const [ importVisible, setImportVisible ] = useState(false);

	const elRename = useRef(null);

	// Focus the text box on rename.
	useEffect(() => {
		if (elRename && elRename.current) elRename.current.focus();
	});

	const updateFiles = useCallback(arch => {
		setArchiveFiles(arch.files.map((f, i) => ({index: i, ...f})));
	}, []);

	useEffect(() => {
		updateFiles(archive);
	}, [
		archive,
		updateFiles,
	]);

	const onReplaceAvailable = useCallback((index, newFile) => {
		setImportVisible(false);
		if (newFile.error) {
			setErrorPopup(`Error reading file: ${newFile.error}`);
			return;
		}

		let f = archive.files[index];
		f.getContent = () => newFile.content;
		f.diskSize = f.nativeSize = newFile.content.length;

		updateFiles(archive);
		props_setUnsavedChanges(true);
	}, [
		archive,
		updateFiles,
		props_setUnsavedChanges,
	]);

	// Make the rename text box visible.
	const onRename = useCallback((d, i) => {
		setIdxRename(i);
		setRenameNewName(d.name);
	}, []);

	const onDelete = useCallback((d, i) => {
		archive.files.splice(i, 1);
		updateFiles(archive);
		props_setUnsavedChanges(true);
	}, [
		archive,
		updateFiles,
		props_setUnsavedChanges,
	]);

	const onInsertBeforeAvailable = useCallback((index, newFile) => {
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
		props_setUnsavedChanges(true);
	}, [
		archive,
		updateFiles,
		props_setUnsavedChanges,
	]);

	const renderName = useCallback((d, i) => {
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
							props_setUnsavedChanges(true);
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
			<div className="filename" onClick={() => onExtract(d, i)}>
				{d.name}
			</div>
		);
	}, [
		elRename,
		idxRename,
		renameNewName,
		archive,
		updateFiles,
		props_setUnsavedChanges,
	]);

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

	const loading = (archiveFiles === null) || (archiveFiles === undefined);

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
						loading={loading}
						data={archiveFiles || []}
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
			<MessageBox
				icon="error"
				visible={errorPopup !== null}
				onClose={() => setErrorPopup(null)}
			>
				<p>
					{errorPopup}
				</p>
				<small>
					A stack trace may be available in the browser console.
				</small>
			</MessageBox>
		</>
	);
}

export default Archive;
