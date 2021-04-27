import React, { useEffect, useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

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

	// This is the "item" passed to the <Document/> when a game is first opened.
	const initialItem = useMemo(() => {
		const md = props.game.constructor.metadata();
		return {
			type: '_new',
			gameTitle: md.title,
			tipsSource: {
				title: 'ModdingWiki',
				url: `https://moddingwiki.shikadi.net/wiki/${md.title}`,
			},
			tipsContentURL: `https://moddingwiki.shikadi.net/w/api.php?action=parse&prop=text&format=json&formatversion=2&origin=*&errorformat=html&page=${md.title}/Modding Tips`,
		};
	}, [
		props.game,
	]);

	const [ mod, setMod ] = useState(null);
	const [ gameItemsTree, setGameItemsTree ] = useState([]);
	const [ openInstance, setOpenInstance ] = useState({
		mod: mod,
		item: initialItem,
	});
	const [ saveVisible, setSaveVisible ] = useState(false);
	const [ treeVisible, setTreeVisible ] = useState(true);
	const [ errorPopup, setErrorPopup ] = useState(null);

	// Are we currently waiting for a save-to-IndexedDB operation to complete?
	const [ saving, setSaving ] = useState(false);

	// Document children set to true when they are first modified, so we know to
	// prompt before loading a different item.
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
				return;
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

			try {
				setMod(await Storage.getMod(props.idMod));
			} catch (e) {
				// Just ignore, it's only for niceties.
			}
		}
		loadItems();
	}, [
		props.game,
		props.idMod,
	]);

	function openItem(d) {
		if (d.disabled) return;
		if (!d.fnOpen) return; // folders
		try {
			let doc = d.fnOpen();
			setOpenInstance({
				mod: mod,
				item: d,
				document: doc,
				cbSave: async doc => {
					try {
						setSaving(true);

						if (!d.fnSave) {
							setErrorPopup('Sorry, the gameinfo.js handler for this game does '
								+ 'not yet support saving this item.');
							return;
						}

						// Save to the game.
						try {
							await d.fnSave(doc);
						} catch (e) {
							console.error(e);
							setErrorPopup(`Error saving this item: ${e.message}`);
							return;
						}

						// Update the stored files.
						try {
							await props.cbSaveMod();
						} catch (e) {
							console.error(e);
							setErrorPopup(`Error saving changes to the browser's IndexedDB: ${e.message}`);
							return;
						}

					} finally {
						setSaving(false);
					}
				},
			});
		} catch (e) {
			console.error(e);
			setOpenInstance({
				mod: mod,
				item: {
					type: 'error',
				},
				document: e,
			});
		}
		setDocOpenCount(docOpenCount + 1);
	}

	function onItemClick(d) {
		if (unsavedChanges) {
			setPendingItem(d);
		} else {
			openItem(d);
		}
	}

	function discardChanges() {
		setUnsavedChanges(false);
		openItem(pendingItem);
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
				<Document
					docOpenCount={docOpenCount}
					setUnsavedChanges={setUnsavedChanges}
					{...openInstance}
				/>
			</div>

			<SaveGame
				visible={saveVisible}
				game={props.game}
				onClose={() => setSaveVisible(false)}
			/>

			<MessageBox
				icon="error"
				visible={errorPopup !== null}
				onClose={() => setErrorPopup(null)}
			>
				<p>
					{errorPopup}
				</p>
			</MessageBox>

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
