import React from 'react';

import {
	Spin,
} from 'shineout';

import './Loading.css';

function Loading() {
	return (
		<div className="loading">
			<Spin name="ring" />
			<div className="text">
				Loading
			</div>
		</div>
	);
}

export default Loading;
