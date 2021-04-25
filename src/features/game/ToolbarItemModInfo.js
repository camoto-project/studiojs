import React, { useState, useRef } from 'react';

import {
	Input,
} from 'shineout';

import Storage from '../../util/storage.js';

import './ToolbarItemModInfo.css';

function ToolbarItemModInfo(props) {
	const [ renamingMod, setRenamingMod ] = useState(false);
	const refInput = useRef();

	function onRenameMod() {
		setRenamingMod(true);
		if (refInput.current) {
			refInput.current.focus();
		}
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

	function setInputRef(ref) {
		refInput.current = ref;
		if (ref) {
			refInput.current.addEventListener('focusout', () => {
				renameMod(refInput.current.value);
			});
		}
	}

	if (!props.mod) return null;

	return (
		<div className="modInfoItem" onClick={onRenameMod}>
			<img src={`/game-icons/${props.mod.idGame}.png`} alt="" className="icon" />
			{renamingMod && (
				<Input
					defaultValue={props.mod.title}
					onEnterPress={renameMod}
					onBlur={() => console.log('a')}
					forwardedRef={setInputRef}
					tip="Type the new mod name and press Enter to save."
					popover="bottom"
				/>
			) || props.mod.title}
		</div>
	);
}

export default ToolbarItemModInfo;
