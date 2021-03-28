import {
	Alert,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconError from '@iconify/icons-fa-solid/exclamation-triangle';

import './Error.css';

function Error(props) {
	return (
		<Alert type="danger" className="error">
			<h3>
			<Icon icon={iconError} style={{marginRight: 6, marginBottom: -1}}/>
				{props.summary}
			</h3>
			<p>
				{props.children}
			</p>
		</Alert>
	);
}

export default Error;
