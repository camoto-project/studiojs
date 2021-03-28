import React from 'react';
import { Link } from 'react-router-dom';

import './Error404.css';

function Error404() {
	return (
		<div className="Error404">
			<h3>
				404 Not Found
			</h3>
			<p>
				Sorry, that page does not exist.
			</p>
			<p>
				Return to{' '}
				<Link to='/'>Camoto Studio</Link>
				.
			</p>
		</div>
	);
}

export default Error404;
