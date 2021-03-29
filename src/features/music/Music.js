import React from 'react';
import { Link as RRLink } from 'react-router-dom';

import OpenFile from '../OpenFile.js';
import './Music.css';

function Music() {
	return (
		<div className="Music">
			<OpenFile
				category="music"
				title="Select a music file"
				renderCancel={(
					<RRLink to="/">
						Cancel
					</RRLink>
				)}
			/>
		</div>
	);
}

export default Music;
