import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
	Button,
	Card,
	Form,
	Grid,
	Input,
	Select,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconFolderOpen from '@iconify/icons-fa-solid/folder-open';
import iconEdit from '@iconify/icons-fa-solid/edit';

import {
	all as gamemusicFormats,
	findHandler as gamemusicFindHandler,
} from '@camoto/gamemusic';

import {
	all as gamearchiveFormats,
	findHandler as gamearchiveFindHandler,
} from '@camoto/gamearchive';

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

	// User supplied a main file to use.
	function onFileChanged(newFile) {
		if (!newFile) {
			setPossibleFormats(null);
			setChosenFormat(null);
			setSupps({});
		}
		setFile(newFile);
		if (manualFormat === 'auto'){
			autodetect(newFile);
		} else {
			prepareSupps(newFile);
		}
	}

	// User supplied one of the supplementary files we requested.
	function onSuppChanged(id, newFile) {
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
	function onChosenFormatChanged(idNewFormat) {
		setChosenFormat(idNewFormat);
		prepareSupps(idNewFormat, file);
	}

	// User changed the manual format dropdown (possibly changing it back to
	// 'Autodetect').
	function onManualFormat(idNewFormat) {
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
		setManualFormat('auto');
		let newSupps = {};
		if (mainFile) {
			const catFindHandler = findHandler[props.category];
			let handlers = [];
			if (catFindHandler) {
				handlers = catFindHandler(mainFile.content, mainFile.name);
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
		const catFormats = allFormats[props.category];
		if (catFormats && mainFile) {
			const handler = catFormats.find(h => h.metadata().id === targetFormat);
			if (handler) {
				const handlerSupps = handler.supps(mainFile.name) || {};
				for (const [id, filename] of Object.entries(handlerSupps)) {
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
					onChange={d => onChosenFormatChanged(d)}
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
								onChange={f => onSuppChanged(id, f)}
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
		<div style={{ display: 'flex', justifyContent: 'center', marginTop: '15%' }}>
			<Card style={{ width: 600 }}>
				<Card.Header>
					{props.title || 'Open a file'}
				</Card.Header>

				<Card.Body>
					<Form>

						<Form.Item label="File to open">
							<VirtualUpload
								onChange={onFileChanged}
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
				</Card.Body>

				<Card.Footer align="right">
					<Card.Submit disabled={!openEnabled}>
						<Icon icon={iconEdit} style={{marginRight: 6, marginBottom: -1}}/>
						Open
					</Card.Submit>
				</Card.Footer>
			</Card>
		</div>
	);
}

export default OpenFile;
