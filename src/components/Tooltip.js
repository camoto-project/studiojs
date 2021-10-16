import React from 'react';

import {
	Popover,
} from 'shineout';

const Tooltip = (props) => (
	<Popover
		style={{ color: "#fff" }}
		background="rgba(20, 23, 55, 0.9)"
		border="transparent"
		mouseEnterDelay={1000}
		clickToCancelDelay
		{...props}
	/>
);

export default Tooltip;
