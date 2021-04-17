import React, { useState } from 'react';

import {
	Card,
	Form,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconEdit from '@iconify/icons-fa-solid/edit';

import {
	all as gameinfoFormats,
} from '@camoto/gameinfo';

import ErrorBox from '../../components/ErrorBox.js';
import GameList from './GameList.js';
import VirtualUpload from '../../components/VirtualUpload.js';

import './OpenGame.css';

function OpenGame(props) {
	const [ selectedGames, setSelectedGames ] = useState([]);
	const [ files, setFiles ] = useState([]);
	const [ errorMessage, setErrorMessage ] = useState(null);

	// User opened the file
	async function onOpen() {
		setErrorMessage(null);

		const gameId = selectedGames[0].id;
		const handler = gameinfoFormats.find(h => h.metadata().id === gameId);
		if (!handler) {
			setErrorMessage(`Somehow selected a game ("${gameId}") that doesn't exist!`);
			return;
		}

		const filesystem = {
			findFile: filename => {
				const target = filename.toLowerCase();
				return files.some(f => f.name.toLowerCase() === target);
			},
			read: filename => {
				const target = filename.toLowerCase();
				const file = files.find(f => f.name.toLowerCase() === target);
				if (!file) {
					throw new Error(`File ${filename} was requested by the game, but `
						+ `was not included when the game was opened.  Please select this `
						+ `file above and try again.`);
				}
				return file.content;
			},
		};
		let gameHandler = new handler(filesystem);
		try {
			const warnings = await gameHandler.open();
			// TODO: Display warnings and let user retry or proceed
			props.onOpen(gameHandler, gameId);
		} catch (e) {
			setErrorMessage(e.message);
		}
	}

	// User selected a game.
	function onGameChange(newGames) {
		setSelectedGames(newGames);
		setErrorMessage(null);
	}

	// Disable if no files to select (i.e. no game selected yet).
	let openEnabled = (selectedGames.length === 1) && files && files.length > 0;

	return (
		<div className="openDialog">
			<Card style={{ width: 600 }}>
				<Card.Header>
					Select a game
				</Card.Header>

				<Card.Body>
					<Form onSubmit={onOpen}>

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
							{errorMessage}
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
						<Icon icon={iconEdit} style={{marginRight: 6, marginBottom: -1}} />
						Open
					</Card.Submit>
				</Card.Footer>
			</Card>
		</div>
	);
}

export default OpenGame;
