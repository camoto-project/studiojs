import {
	Alert,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconError from '@iconify/icons-fa-solid/exclamation-triangle';

import './ErrorBox.css';

function ErrorBox(props) {
	return (
		<Alert
			type="danger"
			className="error"
			style={props.style}
		>
			<h3>
			<Icon icon={iconError} className="icon"/>
				{props.summary}
			</h3>
			{props.children}
		</Alert>
	);
}

export default ErrorBox;
