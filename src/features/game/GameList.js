import {
	Table,
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
		<Table
			style={{maxHeight: '25em'}}
			fixed="y"
			data={games}
			keygen="id"
			format="id"
			columns={[
				{
					title: 'Name',
					render: d => (
						<>
							<img src={`/game-icons/${d.id}.png`} alt="" className="icon" />
							{d.title || '?'}
						</>
					),
				},
			]}
			hover={false}
			radio
			onRowClick={d => props.onChange(d.id)}
			value={props.value}
		/>
	);
}

export default GameList;
