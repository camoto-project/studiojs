import React, { useState } from 'react';
import { Link as RRLink } from 'react-router-dom';

import OpenFile from '../OpenFile.js';
import './Music.css';

function Music(props) {
	const [ music, setMusic ] = useState(props.document);
	if (!music) {
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

	return (
		<p>
			TODO: Music
		</p>
	);
}

export default Music;
