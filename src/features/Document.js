/*
 * Camoto Studio Online - Document
 *
 * UI wrapper around each editor.
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

import React, { Suspense, lazy, useCallback } from 'react';

import ErrorBox from '../components/ErrorBox.js';
import Initial from './initial/Initial.js';
import Loading from './Loading.js';

import './Document.css';

const Archive = lazy(() => import('./archive/Archive.js'));
const Attributes = lazy(() => import('./attributes/Attributes.js'));
const Image = lazy(() => import('./image/Image.js'));
const Map = lazy(() => import('./map/Map.js'));
const Music = lazy(() => import('./music/Music.js'));
const Palette = lazy(() => import('./palette/Palette.js'));

function Document(props) {
	// Keep useMemo() and useCallback() happy.
	const {
		savePrefs: props_savePrefs,
	} = props;
	const props_item_type = props.item.type;

	// Save the user's preferences for the current editor to IndexedDB.
	const savePrefs = useCallback((key, value) => {
		// This will update props.mod.
		props_savePrefs(props_item_type, key, value);
	}, [
		props_savePrefs,
		props_item_type,
	]);

	const childProps = {
		mod: props.mod,
		setUnsavedChanges: props.setUnsavedChanges,
		savePrefs,
		prefs: (props.mod && props.mod.prefs && props.mod.prefs[props_item_type]) || {},
		...props,
	};

	let element;
	switch (props_item_type) {
		case undefined:
			// No game loaded yet.
			element = null;
			break;

		case '_new':
			// Game loaded, no item selected.
			element = <Initial {...childProps} />;
			break;

		case 'archive':
			element = <Archive {...childProps} />;
			break;

		case 'attributes':
			element = <Attributes {...childProps} />;
			break;

		case 'image':
			element = <Image {...childProps} />;
			break;

		case 'map':
			element = <Map {...childProps} />;
			break;

		case 'music':
			element = <Music {...childProps} />;
			break;

		case 'palette':
			element = <Palette {...childProps} />;
			break;

		case 'error':
			element = (
				<ErrorBox summary={`Error opening item`}>
					<p>
						The item could not be opened.  The reason given was:
						{" "}<b>{childProps.document.message}</b>
					</p>
				</ErrorBox>
			);
			break;

		default:
			element = (
				<ErrorBox summary={`Unknown document type "${props_item_type}"`}>
					<p>
						Editing items of this type is not yet implemented.
					</p>
				</ErrorBox>
			);
			break;
	}

	return (
		<div className="document">
			<Suspense
				fallback={(
					<div className="middle">
						<div style={{width: '10em', height: '10em'}}>
							<Loading/>
						</div>
					</div>
				)}
			>
				{element}
			</Suspense>
		</div>
	);
}

export default Document;
