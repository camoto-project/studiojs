import React from 'react';
import { Link as RRLink } from 'react-router-dom';

import {
	Card,
} from 'shineout';

import { Icon } from '@iconify/react';
import iconMusic from '@iconify/icons-fa-solid/music';
import iconEdit from '@iconify/icons-fa-solid/edit';
import iconArchive from '@iconify/icons-fa-solid/archive';

import setPageTitle from '../util/setPageTitle.js';
import './Welcome.css';

function Welcome() {
	setPageTitle();
	return (
		<div className="mainCard welcome">
			<Card style={{ width: 600 }}>
				<Card.Header>
					Camoto
				</Card.Header>

				<Card.Body>
					<p>
						Select an action to get started.
					</p>
					<ul>
						<li>
							<RRLink to="/game">
								<Icon icon={iconEdit} className="icon" />
								Edit a game
							</RRLink>
						</li>
						<li>
							<RRLink to="/open/music">
								<Icon icon={iconMusic} className="icon" />
								Convert a music file
							</RRLink>
						</li>
						<li>
							<RRLink to="/open/archive">
								<Icon icon={iconArchive} className="icon" />
								Examine an archive file
							</RRLink>
						</li>
					</ul>
				</Card.Body>
			</Card>
		</div>
	);
}

export default Welcome;
