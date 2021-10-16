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
