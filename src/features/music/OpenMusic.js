import React from 'react';

import OpenFile from '../OpenFile.js';
import './Music.css';

function OpenMusic() {
	return (
		<div className="Music">
			<OpenFile
				category="music"
				title="Select a music file"
			/>
		</div>
	);
}

export default OpenMusic;
