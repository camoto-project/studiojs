import React from 'react';

import {
	Form,
	Input,
} from 'shineout';

import GameList from './GameList.js';
import Tip from '../../components/Tip.js';
import VirtualUpload from '../../components/VirtualUpload.js';

function NewMod(props) {
	function onGameChange(idGame) {
		props.onChange({
			...props.value,
			idGame,
		});
	}

	function onTitleChange(title) {
		props.onChange({
			...props.value,
			title,
		});
	}

	function onFileChange(files) {
		props.onChange({
			...props.value,
			files,
		});
	}

	return (
		<Form>

			<Form.Item label="Game to edit">
				<GameList
					onChange={onGameChange}
					value={props.value.idGame}
				/>
			</Form.Item>

			<Form.Item label="Working title for the new mod">
				<Input
					onChange={onTitleChange}
					value={props.value.title || 'Untitled'}
				/>
			</Form.Item>

			<Form.Item label="Game files">
				<p>
					Select all the files that belong to this game.
				</p>
				<VirtualUpload
					onChange={onFileChange}
					value={props.value.files}
					multiple
					type="primary"
				/>
				<Tip icon="info">
					The web browser will not allow these files to be changed, so it is
					safe to select your original game files.  If you decide to save any
					changes, you will "download" the modified files and can choose where
					to save them at that time.
				</Tip>
				<Tip icon="info">
					If there are extra files in your game folder and you are not sure
					whether they are required or not, select them anyway - extra files
					won't hurt and will just be ignored.
				</Tip>
			</Form.Item>

		</Form>
	);
}

export default NewMod;
