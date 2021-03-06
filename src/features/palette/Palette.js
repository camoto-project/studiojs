import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import iconExport from '@iconify/icons-fa-solid/file-export';
import iconImport from '@iconify/icons-fa-solid/file-import';
import iconSave from '@iconify/icons-fa-solid/save';

import {
	Input,
} from 'shineout';

import {
	Image,
	img_png,
	pal_vga_8bit,
} from '@camoto/gamegraphics';
import { saveAs } from 'file-saver';

import HiddenUpload from '../../components/HiddenUpload.js';
import MessageBox from '../../components/MessageBox.js';
import Tooltip from '../../components/Tooltip.js';
import WarningListModal from '../../components/WarningListModal.js';

import './Palette.css';

function Palette(props) {
	// Actual palette set being shown.  This will change if a replacement is
	// imported.
	const [ palette, setPalette ] = useState(props.document);
	const [ selectedColour, setSelectedColour ] = useState(null);

	const [ errorPopup, setErrorPopup ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	function onColourClick(i, ev) {
		setSelectedColour(i);
		ev.stopPropagation();
	}

	function onExport() {
		const imgTemp = new Image({palette});
		const output = pal_vga_8bit.write(imgTemp);
		setWarnings(output.warnings);

		const blobContent = new Blob([output.content.main]);
		const targetFilename = (
			props.mod.idGame
			+ '.'
			+ props.item.id
			+ '.pal'
		);
		saveAs(blobContent, targetFilename, { type: 'application/octet-stream' });
	}

	function onImportAvailable(file) {
		let newImg;
		// Try .png first
		try {
			newImg = img_png.read({
				main: file.content,
			});
		} catch (e) {
			console.log('Reading as .png failed, trying .pal');
			try {
				newImg = pal_vga_8bit.read({
					main: file.content,
				});
			} catch (e) {
				setErrorPopup('Error decoding .pal file: ' + e.message);
				return;
			}
		}

		if (!newImg.palette || newImg.palette.length === 0) {
			setErrorPopup('This file was read successfully but it does not have a '
				+ 'palette to import!');
			return;
		}

		// Truncate the palette if the new one is longer than the existing one.
		newImg.palette = newImg.palette.slice(0, palette.length);

		props.setUnsavedChanges(true);
		setPalette(newImg.palette);
	}

	function onSave() {
		try {
			props.cbSave(palette);
			props.setUnsavedChanges(false);
		} catch (e) {
			console.error(e);
			setErrorPopup('Unable to put the palette back into the game.  The '
				+ 'reason given for the failure is: ' + e.message);
			return;
		}
	}

	function onChangeEntry(componentIndex, value) {
		if (selectedColour === null) return;

		let newPal = palette.clone();
		const cleanValue = Math.max(0, Math.min(255, parseInt(value)));
		newPal[selectedColour][componentIndex] = cleanValue;

		props.setUnsavedChanges(true);
		setPalette(newPal);
	}

	function onChangeEntryHTML(value) {
		if (selectedColour === null) return;

		if (value.length !== 9) return;
		if (value[0] !== '#') return;

		const newEntry = [
			parseInt(value.substr(1, 2), 16),
			parseInt(value.substr(3, 2), 16),
			parseInt(value.substr(5, 2), 16),
			parseInt(value.substr(7, 2), 16),
		];

		// Abort on an incomplete string, the user might be in the process of
		// typing it and not finished yet.
		if (newEntry.includes(undefined)) return;
		if (newEntry.includes(NaN)) return;

		let newPal = palette.clone();
		newPal[selectedColour] = newEntry;
		setPalette(newPal);

		props.setUnsavedChanges(true);
	}

	const selectedComponents = (
		(selectedColour !== null) && (palette[selectedColour])
	) || [null, null, null, null]; // nulls for no selection

	return (
		<>
			<div className="toolbar">
				<button onClick={onSave}>
					<Tooltip>
						Save palette back to the game.
					</Tooltip>
					<Icon icon={iconSave} />
				</button>

				<span className="separator"/>

				<button onClick={onExport}>
					<Tooltip>
						Save the whole palette to a file in 8-bit VGA *.pal format.  To
						export as .png, open and export an image instead.
					</Tooltip>
					<Icon icon={iconExport} />
				</button>

				<HiddenUpload
					onChange={onImportAvailable}
				>
					<button>
						<Tooltip>
							Replace the whole palette with one loaded from a file
							(only PNG and 8-bit VGA *.PAL supported)
						</Tooltip>
						<Icon icon={iconImport} />
					</button>
				</HiddenUpload>

				<span className="separator"/>

				{['R', 'G', 'B', 'A'].map((label, i) => (
					<span key={label} className="toolbarPalComponent">
						{label}:
						<Input.Number
							min={0}
							max={255}
							disabled={selectedColour === null}
							value={selectedComponents[i]}
							onChange={value => onChangeEntry(i, value)}
						/>
					</span>
				))}

				<span className="toolbarPalComponent">
					HTML:
					<Input
						className="html"
						disabled={selectedColour === null}
						value={(
							(selectedColour !== null)
							&& (
								'#' + selectedComponents.map(rgb => (rgb || '??').toString(16).toUpperCase().padStart(2, '0')).join('')
							)
						) || null}
						onKeyDown={ev => onChangeEntryHTML(ev.target.value)}
					/>
				</span>

			</div>
			<div className="palette content-container">
				<div
					className="content"
					onClick={ev => onColourClick(null, ev)}
				>
					<div className="palette">
						{palette.map((c, i) => {
							const hexColourRGBA = '#' + c.map(rgb => rgb.toString(16).toUpperCase().padStart(2, '0')).join('');
							const hexColourRGB = hexColourRGBA.substring(0, 7);
							return (
								<div
									key={i}
									className={'colour' + ((selectedColour === i) ? ' selectedColour' : '')}
									onClick={ev => onColourClick(i, ev)}
									style={{backgroundColor: hexColourRGB}}
								>
									<span className="label top">{i}</span>
									<span className="label bottom">{hexColourRGBA}</span>
								</div>
							);
						})}
					</div>
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
			<WarningListModal
				warnings={warnings}
				onClose={() => setWarnings([])}
			>
				<p>
					The following issues were encountered:
				</p>
			</WarningListModal>
		</>
	);
}

export default Palette;
