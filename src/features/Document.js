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
	switch (props.type) {
		case undefined:
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

		case 'image':
			element = <Image doc={props.document} />;
			break;

		case 'error':
			element = (
				<ErrorBox summary={`Error opening item`}>
					<p>
						The item could not be opened.  The reason given was:
						{" "}<b>{props.document.message}</b>
					</p>
				</ErrorBox>
			);
			break;

		default:
			element = (
				<ErrorBox summary={`Unknown document type "${props.type}"`}>
					Editing items of this type is not yet implemented.
				</ErrorBox>
			);
			break;
	}

	return element;
}

export default Document;
