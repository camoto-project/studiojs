import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import {
	Button,
	Form,
	List,
	Modal,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconEdit from '@iconify/icons-fa-solid/edit';

import Storage from '../../util/storage.js';
import ErrorBox from '../../components/ErrorBox.js';
import GameList from './GameList.js';
import VirtualUpload from '../../components/VirtualUpload.js';

import './OpenGame.css';

function OpenGame(props) {
	const history = useHistory();

	const [ selectedGames, setSelectedGames ] = useState([]);
	const [ files, setFiles ] = useState([]);
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ selectedMod, setSelectedMod ] = useState(null);
	const [ mods, setMods ] = useState();

	// User opened the file
	async function onOpen() {
		setErrorMessage(null);

		const idGame = selectedGames[0].id;

		let storedFiles = {};
		for (const f of files) {
			storedFiles[f.name] = f.content;
		}
		try {
			const idNewMod = await Storage.addMod({
				idGame,
				title: 'Untitled',
				dateCreated: new Date(),
			}, storedFiles);

			// Open the new game by moving to its URL.
			history.push(`/game/${idNewMod}`);

		} catch (e) {
			console.error(e);
			setErrorMessage("Unable to save the game's files to the browser's "
				+ "IndexedDB storage area.  The reason given was: " + e.message);
			return;
		}
	}

	useEffect(async () => {
		setMods(await Storage.getMods());
	}, []);

	// User selected a game.
	function onGameChange(newGames) {
		setSelectedGames(newGames);
		setErrorMessage(null);
	}

	function onModChange(idNewMod) {
		setSelectedMod(idNewMod);
		setErrorMessage(null);
	}

	function onCancel() {
		history.push('/');
	}

	// Disable if no files to select (i.e. no game selected yet).
	let openEnabled = (selectedGames.length === 1) && files && files.length > 0;

	return (
		<Modal
			visible={true}
			width={600}
			title={props.title || 'Select a game'}
			onClose={onCancel}
			footer={(
				<>
					<a onClick={onCancel} className="cancel">
						Cancel
					</a>
					<Button
						disabled={!openEnabled}
						onClick={onOpen}
						type="primary"
					>
						<Icon icon={iconEdit} style={{marginRight: 6, marginBottom: -1}} />
						Open
					</Button>
				</>
			)}
		>
			<Form>

				<Form.Item label="Resume work on a previous mod">
					<List
						data={mods}
						keygen="id"
						bordered
						onChange={onModChange}
						renderItem={d => (
							<span className={`gameItem ${selectedMod === d.id ? 'selected' : ''}`}>
								<img src={`/game-icons/${d.idGame}.png`} alt="" />
								{d.title}
							</span>
						)}
					/>
				</Form.Item>

				<Form.Item label="Game">
					<GameList
						category={props.category}
						onChange={onGameChange}
						value={selectedGames}
					/>
				</Form.Item>

				<p>
					None of these files will be changed, so it is safe to choose your
					original game files.
				</p>

				<Form.Item label="Game files:">
					<VirtualUpload
						onChange={f => setFiles(f)}
						value={files}
						multiple
						type="primary"
					/>
				</Form.Item>

			</Form>

			{errorMessage && (
				<ErrorBox summary={`Error`}>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
			)}

		</Modal>
	);
}

export default OpenGame;
