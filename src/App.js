import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import Loading from './features/Loading.js';
import Welcome from './features/Welcome.js';
import Error404 from './features/Error404.js';

import './App.css';

const Music = lazy(() => import('./features/music/Music.js'));
const Archive = lazy(() => import('./features/archive/Archive.js'));
const Game = lazy(() => import('./features/game/Game'));

function App() {
	return (
		<Router>
			<Suspense fallback={<Loading/>}>
				<Switch>
					<Route exact path="/" component={Welcome}/>
					<Route path="/game" component={Game}/>
					<Route path="/music" component={Music}/>
					<Route path="/archive" component={Archive}/>
					<Route component={Error404}/>
				</Switch>
			</Suspense>
		</Router>
	);
}

export default App;
