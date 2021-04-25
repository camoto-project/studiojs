import React, { useState, useRef } from 'react';

import {
	Input,
} from 'shineout';

import Storage from '../../util/storage.js';

import './ToolbarItemModInfo.css';

function ToolbarItemModInfo(props) {
	const [ renamingMod, setRenamingMod ] = useState(false);

	function onRenameMod() {
		setRenamingMod(true);
	}

	function renameMod(newTitle) {
		setRenamingMod(false);
		if (newTitle !== props.mod.title) {
			props.onChange({
				...props.mod,
				title: newTitle,
			});
		}
	}

	function onRenameKeyDown(keyCode, value) {
		switch (keyCode) {
			case 27: // Escape
				setRenamingMod(false);
				break;

			case 13: // Enter
				setRenamingMod(false);
				renameMod(value);
				break;

			default: // ignore any other key
				break;
		}
	}

	if (!props.mod) return null;

	return (
		<div className="modInfoItem" onClick={onRenameMod}>
			<img src={`/game-icons/${props.mod.idGame}.png`} alt="" className="icon" />
			{renamingMod && (
				<Input
					autoFocus
					defaultValue={props.mod.title}
					onEnterPress={renameMod}
					onKeyDown={ev => onRenameKeyDown(ev.keyCode, ev.target.value)}
					onBlur={ev => renameMod(ev.target.value)}
					tip="Type the new mod name and press Enter to save."
					popover="bottom"
				/>
			) || props.mod.title}
		</div>
	);
}

export default ToolbarItemModInfo;
