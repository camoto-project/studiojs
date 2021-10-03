/*
 * Camoto Studio Online - Game
 *
 * The <Game/> component provides the list of game items from the parent
 * <GameHandler/> and a means of opening editors to access each item.
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

import React, { useCallback, useEffect, useState } from 'react';
import {
	HashRouter as Router,
	Prompt,
	Route,
	Switch,
	useHistory,
	useRouteMatch,
} from 'react-router-dom';

import {
	Spin,
	Tree,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconAudio from '@iconify/icons-fa-solid/volume-down';
import iconAttributes from '@iconify/icons-fa-solid/list-alt';
import iconB800 from '@iconify/icons-fa-solid/th';
import iconClose from '@iconify/icons-fa-solid/times';
import iconDelete from '@iconify/icons-fa-solid/trash-alt';
import iconFile from '@iconify/icons-fa-solid/file';
import iconFolder from '@iconify/icons-fa-solid/folder';
import iconImage from '@iconify/icons-fa-solid/image';
import iconInstruments from '@iconify/icons-fa-solid/drum';
import iconMap from '@iconify/icons-fa-solid/drafting-compass';
import iconMenu from '@iconify/icons-fa-solid/bars';
import iconMusic from '@iconify/icons-fa-solid/music';
import iconPalette from '@iconify/icons-fa-solid/palette';
import iconSave from '@iconify/icons-fa-solid/download';

import GameItem from './GameItem.js';
import MessageBox from '../../components/MessageBox.js';
import SaveGame from './SaveGame.js';
import Storage from '../../util/storage.js';
import ToolbarItemModInfo from './ToolbarItemModInfo.js';
import Tooltip from '../../components/Tooltip.js';
import useUnload from '../../util/useUnload.js';

import './Game.css';

function Game(props) {
	const history = useHistory();

	const [ mod, setMod ] = useState(null);

	// The list of game items to pass to <Document/>.  Must be null initially,
	// otherwise <Document/> will briefly render an error saying the document ID
	// in the URL doesn't exist in the game, before replacing it with the document
	// one the game items have loaded.
	const [ gameItems, setGameItems ] = useState(null);

	// A tree-view compatible version of the game items.  This defaults to [] so
	// the tree view just renders an empty tree.
	const [ gameItemsTree, setGameItemsTree ] = useState([]);

	// Is the save-game dialog/download box visible?
	const [ saveVisible, setSaveVisible ] = useState(false);

	// Is the tree view showing game items visible?
	const [ treeVisible, setTreeVisible ] = useState(true);

	// Are we currently waiting for a save-to-IndexedDB operation to complete?
	const [ saving, setSaving ] = useState(false);

	// Document children components set this to true when they are first modified,
	// so we know to prompt before loading a different item.
	const [ unsavedChanges, setUnsavedChanges ] = useState(false);

	// Set when we have an item to load if the user opts to discard changes in the
	// current document.  This also shows the confirmation box.
	const [ pendingItem, setPendingItem ] = useState(null);

	// Show an error if the game couldn't be loaded, and redirect back to the main
	// page when closed.
	const [ gameLoadError, setGameLoadError ] = useState(null);

	// Prompt if the page changes while there are unsaved changes.
	useUnload(e => {
		if (unsavedChanges) {
			e.preventDefault();
			e.returnvalue = 'The current item has not yet been saved!';
			return e.returnValue;
		}
	});

	// When a 'game' is passed through in the props, update the list of items in
	// the tree view.
	useEffect(() => {
		async function loadItems() {
			let items;
			try {
				items = await props.game.items();
			} catch (e) {
				console.log('Error opening game:');
				console.error(e);
				setGameItems(null);
				setGameLoadError(e.message);
				return;
			}

			const flatItems = {};
			function addChildren(items) {
				let treeItems = [];
				for (const [id, desc] of Object.entries(items)) {
					flatItems[id] = desc;
					flatItems[id].id = id; // keep the ID so documents can access it

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

			// Add our default item.  We do this after generating the tree items so
			// it doesn't get added to the tree.
			const md = props.game.constructor.metadata();
			flatItems['_new'] = {
				id: '_new',
				type: '_new',
				gameTitle: md.title,
				tipsSource: {
					title: 'ModdingWiki',
					url: `https://moddingwiki.shikadi.net/wiki/${md.title}`,
				},
				tipsContentURL: `https://moddingwiki.shikadi.net/w/api.php?action=parse&prop=text&format=json&formatversion=2&origin=*&errorformat=html&page=${md.title}/Modding Tips`,
			};

			setGameItems(flatItems);
		}
		loadItems();
	}, [
		props.game,
		props.idMod,
	]);

	useEffect(() => {
		async function loadMod() {
			try {
				setMod(await Storage.getMod(props.idMod));
			} catch (e) {
				// Just ignore, it's only for niceties.
			}
		}
		loadMod();
	}, [
		props.idMod,
	]);

	function onItemClick(d) {
		// Do nothing if folders are clicked.
		if (d.type === 'folder') return;

		// Can't open disabled items.
		if (d.disabled) return;

		if (unsavedChanges) {
			setPendingItem(d);
		} else {
			history.push(`${match.url}/${d.id}`);
		}
	}

	function discardChanges() {
		setUnsavedChanges(false);
		history.push(`${match.url}/${pendingItem.id}`);
		setPendingItem(null);
	}

	function toggleTree() {
		setTreeVisible(!treeVisible);
	}

	function renderGameItem(d) {
		const iconItemType = {
			attributes: iconAttributes,
			b800: iconB800,
			folder: iconFolder,
			image: iconImage,
			instruments: iconInstruments,
			map: iconMap,
			music: iconMusic,
			palette: iconPalette,
			sound: iconAudio,
		}[d.type] || iconFile;

		let disabledTooltip = null;
		if (d.disabled && d.disabledReason) {
			disabledTooltip = (
				<Tooltip>
					{d.disabledReason}
				</Tooltip>
			);
		}

		return (
			<span className={d.disabled ? 'disabled' : ''}>
				<Icon icon={iconItemType} className="icon" />
				{d.title}
				{disabledTooltip}
			</span>
		);
	}

	async function onUpdateMod(updatedMod) {
		try {
			setSaving(true);
			await Storage.updateMod(props.idMod, updatedMod);
			setMod(updatedMod);
			setSaving(false);
		} catch (e) {
			console.error(e);
		}
	}

	const saveDocumentPrefs = useCallback(async (type, key, value) => {
		// Update the state, which will pass the prefs down to the document through
		// the 'mod' prop.
		const newMod = {
			...mod,
			prefs: {
				...mod.prefs,
				[type]: {
					...(mod.prefs || {})[type],
					[key]: value,
				},
			},
		};
		setMod(newMod);

		// Save the prefs to IndexedDB.
		await Storage.updateMod(props.idMod, newMod);
	}, [
		mod,
		props.idMod,
	]);

	// Callback when browser back/forward buttons are pressed.  Due to a many
	// year old bug in React Router, returning false to cancel the navigation
	// still results in the browser URL updating and no longer matching the
	// displayed content.  Hopefully the bug will be fixed one day.
	function onNavigatePrompt(location, action) {
		const proceed = window.confirm('Discard unsaved changes to open item?');
		if (proceed) {
			// Don't want to keep prompting for unsaved changes on the
			// next document.
			setUnsavedChanges(false);
		}
		return proceed;
	}

	const match = useRouteMatch();

	if (gameLoadError) {
		return (
			<div className="root">
				<MessageBox
					visible={true}
					icon="error"
					onClose={() => history.push('/')}
					onOK={() => history.push('/')}
			xxokIcon={iconDelete}
			xxokText="Discard"
			xxbuttonTypeOK="danger"
				>
					<p>
						This game could not be opened due to an unrecoverable error:
					</p>
					<p>
						<b>{gameLoadError}</b>
					</p>
				</MessageBox>
			</div>
		);
	}

	return (
		<div className="root">
			<div className="toolbar">

				<button onClick={toggleTree} className={treeVisible ? 'hold' : '' }>
					<Tooltip>
						Show/hide the list of items
					</Tooltip>
					<Icon icon={iconMenu} />
				</button>

				<button onClick={() => setSaveVisible(true)}>
					<Tooltip>
						Save/download to this device
					</Tooltip>
					<Icon icon={iconSave} />
				</button>

				<span className="separator" />

				<ToolbarItemModInfo
					mod={mod}
					onChange={onUpdateMod}
				/>

				{saving && (
					<span className="toolbarItemSaving">
						<Spin name="ring" size={16} />
						Saving to browser cache...
					</span>
				)}

				<span className="flex-spacer" />

				<button onClick={() => history.push('/')}>
					<Tooltip>
						Close this mod and return to the main menu
					</Tooltip>
					<Icon icon={iconClose} />
				</button>

			</div>

			<div className="game">
				<div className="itemList content-container" style={{display: treeVisible ? 'block' : 'none'}}>
					<div className="content">
						<Tree
							data={gameItemsTree}
							keygen="id"
							renderItem={renderGameItem}
							defaultExpandAll
							onClick={onItemClick}
						/>
					</div>
				</div>

				<Router>
					<Switch>
						<Route path={`${match.url}/:idDocument?`}>
							<Prompt
								when={unsavedChanges}
								message={onNavigatePrompt}
							/>
							<GameItem
								gameItems={gameItems}
								mod={mod}
								cbSaveMod={props.cbSaveMod}
								setUnsavedChanges={setUnsavedChanges}
								setSaving={setSaving}
								savePrefs={saveDocumentPrefs}
							/>
						</Route>
					</Switch>
				</Router>
			</div>

			<SaveGame
				visible={saveVisible}
				game={props.game}
				onClose={() => setSaveVisible(false)}
				unsavedChanges={unsavedChanges}
			/>

			<MessageBox
				visible={!!pendingItem}
				icon="warning"
				onClose={() => setPendingItem(null)}
				onOK={discardChanges}
				confirm
				okIcon={iconDelete}
				okText="Discard"
				buttonTypeOK="danger"
			>
				<p>
					The open item has unsaved changes.  Do you want to discard the
					changes you have made to this item?
				</p>
			</MessageBox>

		</div>
	);
}

export default Game;
