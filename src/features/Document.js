import React, { Suspense, lazy, useState } from 'react';

import {
	Button,
	Tooltip,
	Tree,
} from 'shineout';

import ErrorBox from '../components/ErrorBox.js';

const Image = lazy(() => import('./image/Image.js'));
const Music = lazy(() => import('./music/Music.js'));

function Document(props) {
	let element;
	const docType = props.doc && props.doc.constructor.name || 'null';
	switch (docType) {
		case 'null':
			element = (
				<>
					<h3>
						Welcome to Camoto Studio Online!
					</h3>
					<p>
						Please select an item to start editing.
					</p>
				</>
			);
			break;

		case 'Image':
			element = <Image doc={props.doc} />;
			break;

		case 'TypeError':
			element = (
				<ErrorBox summary={`Error opening item`}>
					The item could not be opened.  The reason given was:
					{" "}<b>{props.doc.message}</b>
				</ErrorBox>
			);
			break;

		default:
			element = (
				<ErrorBox summary={`Unknown document type "${docType}"`}>
					Editing items of this type is not yet implemented.
				</ErrorBox>
			);
			break;
	}

	return element;
}

export default Document;
