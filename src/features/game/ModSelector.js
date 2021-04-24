import React, { useState, useEffect } from 'react';

import {
	Button,
	Form,
	Table,
	Modal,
	Spin,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconEdit from '@iconify/icons-fa-solid/edit';

import Storage from '../../util/storage.js';
import ErrorBox from '../../components/ErrorBox.js';
import GameList from './GameList.js';
import Loading from '../Loading.js';
import VirtualUpload from '../../components/VirtualUpload.js';

import './OpenGame.css';

function ModSelector(props) {
	const [ errorMessage, setErrorMessage ] = useState(null);
	const [ mods, setMods ] = useState(null);

	useEffect(async () => {
		setErrorMessage(null);
		try {
			setMods(await Storage.getMods());
		} catch (e) {
			console.error(e);
			setErrorMessage('Unable to load mod list: ' + e.message);
		}
	}, []);

	let jsxMods;
	if (mods) {
		if (mods.length) {
			jsxMods = (
				<Table
					style={{maxHeight: '25em'}}
					fixed="y"
					data={mods}
					keygen="id"
					format="id"
					columns={[
						{
							title: 'Name',
							render: d => (
								<>
									<img src={`/game-icons/${d.idGame}.png`} alt="" className="icon" />
									{d.title || 'Untitled'}
								</>
							),
						},
					]}
					hover={false}
					radio
					onRowClick={d => props.onModChange(d.id)}
					value={props.value}
				/>
			);
		} else {
			jsxMods = (
				<p>
					No existing mods found.  Create a new mod below.
				</p>
			);
		}
	} else {
		jsxMods = <Spin name="four-dots" />;
	}

	return (
		<div
			className="previousMod"
			style={{display: props.visible ? 'block' : 'none'}}
		>
			{errorMessage && (
				<ErrorBox summary={`Error`}>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
			)}
			{jsxMods}
		</div>
	);
}

export default ModSelector;
