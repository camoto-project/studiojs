import React from 'react';
import { Link as RRLink } from 'react-router-dom';

import {
	Card,
	Grid,
	Link,
	Menu,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconMusic from '@iconify/icons-fa-solid/music';
import iconEdit from '@iconify/icons-fa-solid/edit';
import iconArchive from '@iconify/icons-fa-solid/archive';

const menu = [
	{
		id: 'game',
		title: 'Edit a game',
		link: '/game',
		icon: iconEdit,
	}, {
		id: 'music',
		title: 'Convert a music file',
		link: '/music',
		icon: iconMusic,
	}, {
		id: 'archive',
		title: 'Examine an archive file',
		link: '/archive',
		icon: iconArchive,
	},
];

function Welcome() {
	return (
		<div style={{ display: 'flex', justifyContent: 'center', marginTop: '15%' }}>
			<Card style={{ width: 600 }}>
				<Card.Header>
					Camoto
				</Card.Header>

				<Card.Body>
					<p>
						Select an action to get started.
					</p>
					<Menu
						keygen="id"
						linkKey="link"
						data={menu}
						renderItem={d => (
							<RRLink to={d.link}>
								<Icon icon={d.icon} style={{marginRight: 6, marginBottom: -1}}/>
								{d.title}
							</RRLink>
						)}
					/>
				</Card.Body>
			</Card>
		</div>
	);
}

export default Welcome;
