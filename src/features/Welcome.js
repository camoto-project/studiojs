/*
 * Camoto Studio Online - Welcome
 *
 * Initial page shown when accessing the app.
 *
 * Copyright (C) 2010-2021 Adam Nielsen <malvineous@shikadi.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useCallback } from 'react';
import { Link as RRLink, useHistory } from 'react-router-dom';

import {
	Card,
} from 'shineout';
import {
	Icon,
	iconArchive,
	iconEdit,
	iconMusic,
} from '../util/icons.js';

import ModSelector from './game/ModSelector.js';
import setPageTitle from '../util/setPageTitle.js';
import './Welcome.css';

function Welcome() {
	const history = useHistory();

	const onModChange = useCallback(mod => {
		// Open the mod as soon as it's selected.
		if (mod.standalone) {
			history.push(`/item/${mod.id}`);
		} else {
			history.push(`/game/${mod.id}`);
		}
	}, [
		history,
	]);

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
						<li>
							<ModSelector
								visible={true}
								includeMods={false}
								includeStandalone={true}
								limit={3}
								onModChange={onModChange}
								heading="Recently opened items"
								hideOnEmpty={true}
							/>
						</li>
						<li>
							<ModSelector
								visible={true}
								includeMods={true}
								includeStandalone={false}
								onModChange={onModChange}
								heading="Resume work on a previous mod"
								hideOnEmpty={true}
							/>
						</li>
					</ul>
				</Card.Body>
			</Card>
		</div>
	);
}

export default Welcome;
