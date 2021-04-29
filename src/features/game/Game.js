import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
	HashRouter as Router,
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

import Document from '../Document.js';
import MessageBox from '../../components/MessageBox.js';
import SaveGame from './SaveGame.js';
import Storage from '../../util/storage.js';
import ToolbarItemModInfo from './ToolbarItemModInfo.js';
import Tooltip from '../../components/Tooltip.js';

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

	// The docOpenState increments each time the open document changes.  This
	// value is passed to the document's error boundary as a `key` prop, which
	// will cause it to re-render every time a new document is opened.  Without
	// this, the error state is never reset so once an error happens, the error
	// message can never be closed.
	const [ docOpenCount, setDocOpenCount ] = useState(0);

	// The user's preferences for this mod.
	const [ prefs, setPrefs ] = useState({});

	// When a 'game' is passed through in the props, update the list of items in
	// the tree view.
	useEffect(() => {
		async function loadItems() {
			let items;
			try {
				items = await props.game.items();
			} catch (e) {
				// TODO: handle error
				console.log(e);
				setGameItems({});
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

	const match = useRouteMatch();

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

			<div className="body">
				<span className="itemList" style={{display: treeVisible ? 'block' : 'none'}}>
					<Tree
						data={gameItemsTree}
						keygen="id"
						renderItem={renderGameItem}
						defaultExpandAll
						onClick={onItemClick}
					/>
				</span>

				<Router>
					<Switch>
						<Route path={`${match.url}/:idDocument?`}>
							<Document
								game={props.game}
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
