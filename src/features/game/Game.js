import React, { useEffect, useRef, useState } from 'react';
import { Link as RRLink } from 'react-router-dom';

import {
	Button,
	Tooltip,
	Tree,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconAudio from '@iconify/icons-fa-solid/volume-down';
import iconB800 from '@iconify/icons-fa-solid/th';
import iconClose from '@iconify/icons-fa-solid/times';
import iconFile from '@iconify/icons-fa-solid/file';
import iconFolder from '@iconify/icons-fa-solid/folder';
import iconFolderOpen from '@iconify/icons-fa-solid/folder-open';
import iconImage from '@iconify/icons-fa-solid/image';
import iconInstruments from '@iconify/icons-fa-solid/drum';
import iconMap from '@iconify/icons-fa-solid/drafting-compass';
import iconMusic from '@iconify/icons-fa-solid/music';
import iconPalette from '@iconify/icons-fa-solid/palette';
import iconSave from '@iconify/icons-fa-solid/download';

import { saveAs } from 'file-saver';
import { File } from '@camoto/gamearchive';

import OpenGame from './OpenGame.js';
import SaveFile from '../SaveFile.js';

import './Game.css';

// https://stackoverflow.com/a/20732091/308237
function humanFileSize(size) {
	if (size === undefined) return '?';
	if (size < 0) return '!!';
	let i = (size === 0) ? 0 : Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(1) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function Game() {
	const [ gameId, setGameId ] = useState(null);
	const [ game, setGame ] = useState(null);
	const [ gameItems, setGameItems ] = useState({});
	const [ gameItemsTree, setGameItemsTree ] = useState([]);
	const [ saveVisible, setSaveVisible ] = useState(false);
	const elRename = useRef(null);

	async function openGame(newGame, idGame) {
		setGameId(idGame);
		setGame(newGame);
		let items = await newGame.items();
		setGameItems(items);

		function addChildren(items) {
			let treeItems = [];
			for (const [id, desc] of Object.entries(items)) {
				treeItems.push({
					id,
					title: desc.title,
					type: desc.type,
					children: desc.children && addChildren(desc.children),
				});
			}
			return treeItems;
		}
		const treeItems = addChildren(items);
		setGameItemsTree(treeItems);
	}

	// If no game has been opened, prompt for one.
	if (!game) {
		return (
			<OpenGame
				onOpen={openGame}
				renderCancel={(
					<RRLink to="/">
						Cancel
					</RRLink>
				)}
			/>
		);
	}

	function renderGameItem(d) {
		const iconItemType = {
			b800: iconB800,
			folder: iconFolder,
			image: iconImage,
			instruments: iconInstruments,
			map: iconMap,
			music: iconMusic,
			palette: iconPalette,
			sound: iconAudio,
		}[d.type] || iconFile;
		return (
			<span>
				<Icon icon={iconItemType} style={{marginRight: 6, marginBottom: -1}} />
				{d.title}
			</span>
		);
	}

	return (
		<div className="root">
			<div className="toolbar">
				<Button type="secondary" onClick={() => setGame(null)}>
					<Icon icon={iconFolderOpen} style={{marginRight: 6, marginBottom: -1}} />
					Open new game
				</Button>
				<Button type="primary" onClick={() => setSaveVisible(true)}>
					<Icon icon={iconSave} style={{marginRight: 6, marginBottom: -1}} />
					Save
				</Button>
				<div className="separator" />
				<RRLink to="/" className="exit">
					<Icon icon={iconClose} style={{marginBottom: -1}} />
				</RRLink>
			</div>
			<Tree
				data={gameItemsTree}
				keygen="id"
				renderItem={renderGameItem}
			/>
			{saveVisible && (
				<SaveFile
					category="archive"
					document={game}
					title="Save game"
					defaultFormat={gameId}
					onClose={() => setSaveVisible(false)}
				/>
			)}
		</div>
	);
}

export default Game;
