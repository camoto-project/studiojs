import React, { Suspense, lazy } from 'react';

import Loading from './Loading.js';
import ErrorBoundary from '../components/ErrorBoundary.js';
import ErrorBox from '../components/ErrorBox.js';

const Image = lazy(() => import('./image/Image.js'));
const Music = lazy(() => import('./music/Music.js'));

function Document(props) {
	let element;
	switch (props.type) {
		case undefined:
			// No game loaded yet.
			element = null;
			break;

		case '_new':
			// Game loaded, no item selected.
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
			element = <Image document={props.document} />;
			break;

		case 'music':
			element = <Music document={props.document} />;
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
				<ErrorBoundary key={props.docOpenCount}>
					{element}
				</ErrorBoundary>
			</Suspense>
		</div>
	);
}

export default Document;
