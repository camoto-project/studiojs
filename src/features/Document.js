import React, { Suspense, lazy, useCallback, useState, useMemo } from 'react';
import {
	useParams,
} from 'react-router-dom';

import ErrorBox from '../components/ErrorBox.js';
import Initial from './initial/Initial.js';
import Loading from './Loading.js';

const Archive = lazy(() => import('./archive/Archive.js'));
const Attributes = lazy(() => import('./attributes/Attributes.js'));
const Image = lazy(() => import('./image/Image.js'));
const Map = lazy(() => import('./map/Map.js'));
const Music = lazy(() => import('./music/Music.js'));
const Palette = lazy(() => import('./palette/Palette.js'));

function Document(props) {
	const { idDocument } = useParams();

	// Keep useMemo() and useCallback() happy.
	const {
		cbSaveMod: props_cbSaveMod,
		gameItems: props_gameItems,
		savePrefs: props_savePrefs,
		setSaving: props_setSaving,
	} = props;
	const type = props.item.type;

	// Save the user's preferences for the current editor to IndexedDB.
	const savePrefs = useCallback((key, value) => {
		// This will update props.mod.
		props_savePrefs(type, key, value);
	}, [
		props_savePrefs,
		type,
	]);

	const childProps = {
		mod: props.mod,
		setUnsavedChanges: props.setUnsavedChanges,
		savePrefs,
		prefs: (props.mod && props.mod.prefs && props.mod.prefs[type]) || {},
		...props,
	};

	let element;
	switch (type) {
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
				<ErrorBox summary={`Unknown document type "${type}"`}>
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
