import React from 'react';

import MessageBox from './MessageBox.js';

function WarningList(props) {
	return (
		<MessageBox
			icon="warning"
			visible={props.warnings.length > 0}
			onClose={props.onClose}
		>
			{props.children}

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

export default WarningList;
