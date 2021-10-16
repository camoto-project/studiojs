/*
 * Camoto Studio Online - main entry point
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

import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Loading from './features/Loading.js';
import Welcome from './features/Welcome.js';
import Error404 from './features/Error404.js';

import './App.css';

const GameHandler = lazy(() => import('./features/game/GameHandler.js'));
const OpenGame = lazy(() => import('./features/game/OpenGame.js'));
const OpenItem = lazy(() => import('./features/standalone-item/OpenItem.js'));
const StandaloneItem = lazy(() => import('./features/standalone-item/StandaloneItem.js'));

function App() {
	return (
		<Router>
			<Suspense fallback={<Loading/>}>
				<Switch>
					<Route exact path="/" component={Welcome} />
					<Route exact path="/game" component={OpenGame} />
					<Route path="/game/:id" component={GameHandler} />
					<Route path="/item/:idItem" component={StandaloneItem} />
					<Route path="/open/:idEditor" component={OpenItem} />
					<Route component={Error404}/>
				</Switch>
			</Suspense>
		</Router>
	);
}

export default App;
