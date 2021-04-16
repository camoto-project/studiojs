import {
	List,
} from 'shineout';

import {
	all as gameinfoFormats,
} from '@camoto/gameinfo';

import './GameList.css';

const cbSort = (a, b) => {
	if (a.id < b.id) return -1;
	if (a.id > b.id) return 1;
	return 0;
};

const games = gameinfoFormats.map(f => {
	const md = f.metadata();
	return {
		id: md.id,
		title: md.title,
	};
}).sort(cbSort);

function GameList(props) {
	return (
		<List
			data={games}
			keygen="id"
			bordered
			renderItem={d => (
				<span className={`gameItem ${props.value && props.value.id === d.id ? 'selected' : ''}`}>
					<img src={`/game-icons/${d.id}.png`} />
					{d.title}
				</span>
			)}
			{...props}
		/>
	);
}

export default GameList;
