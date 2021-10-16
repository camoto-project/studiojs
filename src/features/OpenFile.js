/*
 * Camoto Studio Online - OpenFile
 *
 * Allow the user to select a file from disk supported by one of the game*.js
 * libraries, request any supplementary files, then open it and obtain an
 * instance to the supported object, such as `Archive` or `Music`.
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

import React, { useState } from 'react';

import {
	Card,
	Form,
	Select,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconEdit from '@iconify/icons-fa-solid/edit';

import {
	all as gamemusicFormats,
	findHandler as gamemusicFindHandler,
} from '@camoto/gamemusic';

import {
	all as gamearchiveFormats,
	findHandler as gamearchiveFindHandler,
} from '@camoto/gamearchive';

import ErrorBox from '../components/ErrorBox.js';
import FormatList from '../components/FormatList.js';
import VirtualUpload from '../components/VirtualUpload.js';

import './OpenFile.css';

const findHandler = {
	music: gamemusicFindHandler,
	archive: gamearchiveFindHandler,
};

const allFormats = {
	music: gamemusicFormats,
	archive: gamearchiveFormats,
};

function OpenFile(props) {
	const [ file, setFile ] = useState();
	const [ manualFormat, setManualFormat ] = useState('auto');
	const [ possibleFormats, setPossibleFormats ] = useState(null);
	const [ chosenFormat, setChosenFormat ] = useState();
	const [ supps, setSupps ] = useState([]);
	const [ errorMessage, setErrorMessage ] = useState(null);

	const catFindHandler = findHandler[props.category];
	const catFormats = allFormats[props.category];

	// User opened the file
	function onOpen() {
		let files = {};
		{
			const { name, content } = file[0];
			files[name] = content;
		}
		for (const [idSupp, s] of Object.entries(supps)) {
			const { name, content } = s.virtualUpload[0];
			files[name] = content;
		}

		props.onOpen({
			idEditor: props.category,
			idFormat: chosenFormat,
			mainFilename: file[0].name,
			files,
		});
	}

	// User supplied a main file to use.
	function onFileChange(newFile) {
		setErrorMessage(null);
		if (!newFile) {
			setPossibleFormats(null);
			setChosenFormat(null);
			setSupps({});
		}
		setFile(newFile);
		if (manualFormat === 'auto'){
			autodetect(newFile[0]);
		} else {
			prepareSupps(newFile[0]);
		}
	}

	// User supplied one of the supplementary files we requested.
	function onSuppChange(id, newFile) {
		setErrorMessage(null);
		if (!supps[id]) {
			console.error(`Tried to set a file for invalid supp ID "${id}"`);
			return;
		}
		let newSupps = {...supps};
		newSupps[id] = {...supps[id]};
		newSupps[id].virtualUpload = newFile;
		setSupps(newSupps);
	}

	// User changed the format suggested by the autodetect, for cases where the
	// autodetect algorithm matches multiple formats.
	function onChosenFormatChange(idNewFormat) {
		setErrorMessage(null);
		setChosenFormat(idNewFormat);
		prepareSupps(idNewFormat, file);
	}

	// User changed the manual format dropdown (possibly changing it back to
	// 'Autodetect').
	function onManualFormat(idNewFormat) {
		setErrorMessage(null);
		setPossibleFormats(null);
		setManualFormat(idNewFormat);
		setChosenFormat(idNewFormat);
		if (idNewFormat === 'auto') {
			autodetect(file);
		} else {
			prepareSupps(idNewFormat, file);
		}
	}

	// Run the autodetection code against the given file and set the state to
	// match the result.  The file passed in can come from the state or from a
	// value just set by the user that hasn't made it into the state yet.
	function autodetect(mainFile) {
		setErrorMessage(null);
		setManualFormat('auto');
		if (mainFile) {
			let handlers = [];
			if (catFindHandler) {
				try {
					handlers = catFindHandler(mainFile.content, mainFile.name);
				} catch (e) {
					console.error(e);
					setErrorMessage(`BUG: Autodetection crashed - please report this as a bug.  The error was: ${e.message}`);
				}
			}
			const pf = handlers.map(h => {
				const md = h.metadata();
				return {
					id: md.id,
					title: `${md.id} / ${md.title}`,
				};
			});
			setPossibleFormats(pf);
			const cf = pf && pf[0] && pf[0].id;
			setChosenFormat(cf);
			prepareSupps(cf, mainFile);
		} else {
			setChosenFormat(null);
		}
	}

	// Figure out which (if any) supplementary files are needed based on the
	// current state.
	function prepareSupps(targetFormat, mainFile) {
		let newSupps = {};
		if (catFormats && mainFile) {
			const handler = catFormats.find(h => h.metadata().id === targetFormat);
			if (handler) {
				const handlerSupps = handler.supps(mainFile.name) || {};
				for (const [id, filename] of Object.entries(handlerSupps)) {
					if (id === 'main') continue;
					newSupps[id] = {
						defaultFilename: filename,
						virtualUpload: supps[id] && supps[id].virtualUpload, // keep existing one if present
					};
				}
			}
		}
		setSupps(newSupps);
	}

	let openEnabled = !!file;

	let jsxAutodetect;
	if (possibleFormats) {
		if (possibleFormats.length === 0) {
			jsxAutodetect = (
				<span className="error">Unable to recognise this file format!</span>
			);
			openEnabled = false;

		} else {
			jsxAutodetect = (
				<Select
					data={possibleFormats}
					defaultValue={possibleFormats[0].id}
					keygen="id"
					format="id"
					renderItem="title"
					onChange={d => onChosenFormatChange(d)}
					value={chosenFormat}
					disabled={possibleFormats.length <= 1}
					autoAdapt
				/>
			);
		}
	} else {
		// Manual format specified
		jsxAutodetect = null;
	}

	// Get a list of required supps, if any.
	let jsxSupps = null;
	if (supps && (Object.keys(supps).length > 0)) {
		jsxSupps = (
			<Form.Item label={`Supplementary files:`}>
				{Object.entries(supps).map(([id, s]) => {
					if (!s.virtualUpload) {
						// Disable the open button if this supp has no file selected yet.
						openEnabled = false;
					}
					return (
						<Form.Item key={id} label={s.defaultFilename}>
							<VirtualUpload
								onChange={f => onSuppChange(id, f)}
								value={s.virtualUpload}
								type="primary"
							/>
						</Form.Item>
					);
				})}
			</Form.Item>
		);
	}

	return (
		<div className="openDialog">
			<Card style={{ width: 600 }}>
				<Card.Header>
					{props.title || 'Open a file'}
				</Card.Header>

				<Card.Body>
					<Form onSubmit={onOpen}>
						<p>
							None of these files will be changed, so it is safe to choose your
							original game files.
						</p>

						<Form.Item label="File to open">
							<VirtualUpload
								onChange={onFileChange}
								value={file}
								type="primary"
							/>
						</Form.Item>

						<Form.Item label="File format">
							<FormatList
								category={props.category}
								onChange={onManualFormat}
								value={manualFormat}
								showAutodetect
							/>
						</Form.Item>

						{jsxAutodetect && (
							<Form.Item label="Autodetected as:">
								{jsxAutodetect}
							</Form.Item>
						)}

						{jsxSupps}

					</Form>

					{errorMessage && (
						<ErrorBox summary={`Error`}>
							<p>
								{errorMessage}
							</p>
						</ErrorBox>
					)}

				</Card.Body>

				<Card.Footer>
					{props.renderCancel && (
						<span className="cancel">
							{props.renderCancel}
						</span>
					)}
					<Card.Submit disabled={!openEnabled}>
						<Icon icon={iconEdit} className="icon" />
						Open
					</Card.Submit>
				</Card.Footer>
			</Card>
		</div>
	);
}

export default OpenFile;
