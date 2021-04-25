import React from 'react';

import { Icon } from '@iconify/react';
import iconError from '@iconify/icons-fa-solid/times-circle';
import iconExclamation from '@iconify/icons-fa-solid/exclamation-triangle';
import iconInfo from '@iconify/icons-fa-solid/info-circle';

import './Tip.css';

function Tip(props) {

	const icon = {
		error: iconError,
		warning: iconExclamation,
		info: iconInfo,
	}[props.icon] || iconInfo;

	const iconColour = {
		error: 'red',
		warning: 'orange',
		info: 'blue',
	}[props.icon] || iconInfo;

	const bgColour = {
		error: 'rgb(255, 220, 220)',
		warning: 'rgb(255, 240, 225)',
		info: 'rgb(220, 220, 255)',
	}[props.icon] || iconInfo;

	return (
		<div
			className="tip"
			style={{
				backgroundColor: bgColour,
				...props.style,
			}}
		>
			<Icon icon={icon} className="icon" style={{color: iconColour}} />
			<div>{props.children}</div>
		</div>
	);
}

export default Tip;
