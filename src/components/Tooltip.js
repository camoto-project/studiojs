import React from 'react';

import {
	Popover,
} from 'shineout';

export default (props) => (
	<Popover
		style={{ color: "#fff" }}
		background="rgba(20, 23, 55, 0.9)"
		border="transparent"
		mouseEnterDelay={1000}
		{...props}
	/>
);
