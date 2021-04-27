import React, { Suspense, lazy } from 'react';

import ErrorBoundary from '../components/ErrorBoundary.js';
import ErrorBox from '../components/ErrorBox.js';
import Initial from './initial/Initial.js';
import Loading from './Loading.js';

const Image = lazy(() => import('./image/Image.js'));
const Music = lazy(() => import('./music/Music.js'));
const Palette = lazy(() => import('./palette/Palette.js'));

function Document(props) {
	let element;
	const type = (props.item && props.item.type) || undefined;
	switch (type) {
		case undefined:
			// No game loaded yet.
			element = null;
			break;

		case '_new':
			// Game loaded, no item selected.
			element = <Initial {...props} />;
			break;

		case 'image':
			element = <Image {...props} />;
			break;

		case 'music':
			element = <Music {...props} />;
			break;

		case 'palette':
			element = <Palette {...props} />;
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
				<ErrorBoundary key={props.docOpenCount}>
					{element}
				</ErrorBoundary>
			</Suspense>
		</div>
	);
}

export default Document;
