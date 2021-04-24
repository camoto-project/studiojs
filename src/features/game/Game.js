import React, { useState, useEffect } from 'react';
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
import iconImage from '@iconify/icons-fa-solid/image';
import iconInstruments from '@iconify/icons-fa-solid/drum';
import iconMap from '@iconify/icons-fa-solid/drafting-compass';
import iconMenu from '@iconify/icons-fa-solid/bars';
import iconMusic from '@iconify/icons-fa-solid/music';
import iconPalette from '@iconify/icons-fa-solid/palette';
import iconSave from '@iconify/icons-fa-solid/download';

import Document from '../Document.js';
import SaveFile from '../SaveFile.js';

import './Game.css';

function Game(props) {
	const [ gameItemsTree, setGameItemsTree ] = useState([]);
	const [ openInstance, setOpenInstance ] = useState({});
	const [ saveVisible, setSaveVisible ] = useState(false);
	const [ treeVisible, setTreeVisible ] = useState(true);
	// The docOpenState increments each time the open document changes.  This
	// value is passed to the document's error boundary as a `key` prop, which
	// will cause it to re-render every time a new document is opened.  Without
	// this, the error state is never reset so once an error happens, the error
	// message can never be closed.
	const [ docOpenCount, setDocOpenCount ] = useState(0);

	// When a 'game' is passed through in the props, update the list of items in
	// the tree view.
	useEffect(async () => {
		let items;
		try {
			items = await props.game.items();
		} catch (e) {
			// TODO: handle error
			console.log(e);
		}

		function addChildren(items) {
			let treeItems = [];
			for (const [id, desc] of Object.entries(items)) {
				treeItems.push({
					id,
					...desc,
					children: desc.children && addChildren(desc.children),
				});
			}
			return treeItems;
		}
		const treeItems = addChildren(items);
		setGameItemsTree(treeItems);
	}, [
		props.game,
	]);

	function openItem(d) {
		if (d.disabled) return;
		if (!d.fnOpen) return; // folders
		try {
			let doc = d.fnOpen();
			setOpenInstance({
				type: d.type,
				document: doc,
			});
		} catch (e) {
			console.error(e);
			setOpenInstance({
				type: 'error',
				document: e,
			});
		}
		setDocOpenCount(docOpenCount + 1);
	}

	function toggleTree() {
		setTreeVisible(!treeVisible);
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
		const content = (
			<span onClick={() => openItem(d)} className={d.disabled ? 'disabled' : ''}>
				<Icon icon={iconItemType} style={{marginRight: 6, marginBottom: -1}} />
				{d.title}
			</span>
		);
		if (d.disabled && d.disabledReason) {
			return (
				<Tooltip tip={d.disabledReason} position="top">
					{content}
				</Tooltip>
			);
		} else {
			return content;
		}
	}

	return (
		<div className="root">
			<div className="toolbar">
				<button onClick={toggleTree} className={treeVisible ? 'hold' : '' }>
					<Icon icon={iconMenu} />
				</button>
				<button type="primary" onClick={() => setSaveVisible(true)}>
					<Icon icon={iconSave} />
				</button>
				<div className="separator" />
				<RRLink to="/" className="exit">
					<Icon icon={iconClose} style={{marginBottom: -1}} />
				</RRLink>
			</div>
			<div className="body">
				<span className="itemList" style={{display: treeVisible ? 'block' : 'none'}}>
					<Tree
						data={gameItemsTree}
						keygen="id"
						renderItem={renderGameItem}
					/>
				</span>
				<Document docOpenCount={docOpenCount} {...openInstance} />
			</div>
			{saveVisible && (
				<SaveFile
					category="archive"
					document={props.game}
					title="Save game"
					onClose={() => setSaveVisible(false)}
				/>
			)}
		</div>
	);
}

export default Game;
