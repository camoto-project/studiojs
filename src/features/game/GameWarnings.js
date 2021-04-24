import React from 'react';

import MessageBox from '../../components/MessageBox.js';

function GameWarnings(props) {
	return (
		<MessageBox
			icon="warning"
			visible={props.warnings.length > 0}
			onClose={props.onClose}
		>
			<p>
				The following issues were encountered when opening this game:
			</p>

			<ul>
				{props.warnings.map((warning, index) => (
					<li key={index}>
						{warning}
					</li>
				))}
			</ul>

		</MessageBox>
	);
}

export default GameWarnings;
