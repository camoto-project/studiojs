import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Loading from './features/Loading.js';
import Welcome from './features/Welcome.js';
import Error404 from './features/Error404.js';

import './App.css';

const OpenMusic = lazy(() => import('./features/music/OpenMusic.js'));
const OpenArchive = lazy(() => import('./features/archive/OpenArchive.js'));
const Game = lazy(() => import('./features/game/Game'));

function App() {
	return (
		<Router>
			<Suspense fallback={<Loading/>}>
				<Switch>
					<Route exact path="/" component={Welcome}/>
					<Route path="/game" component={Game}/>
					<Route path="/music" component={OpenMusic}/>
					<Route path="/archive" component={OpenArchive}/>
					<Route component={Error404}/>
				</Switch>
			</Suspense>
		</Router>
	);
}

export default App;
