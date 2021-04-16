import {
	Select,
} from 'shineout';

import {
	all as gamemusicFormats,
} from '@camoto/gamemusic';
import {
	all as gamearchiveFormats,
} from '@camoto/gamearchive';

import ErrorBox from './ErrorBox.js';

const cbSort = (a, b) => {
	if (a.id < b.id) return -1;
	if (a.id > b.id) return 1;
	return 0;
};

const formatLists = {
	music: gamemusicFormats.map(f => {
		const md = f.metadata();
		return {
			id: md.id,
			title: `${md.id} / ${md.title}`,
		};
	}).sort(cbSort),

	archive: gamearchiveFormats.map(f => {
		const md = f.metadata();
		return {
			id: md.id,
			title: `${md.id} / ${md.title}`,
		};
	}).sort(cbSort),
};

function FormatList(props) {
	let formats = formatLists[props.category];
	if (!formats) {
		return (
			<ErrorBox summary={`Unknown file format category "${props.category}".`}>
				The format category &quot;{props.category}&quot; was not recognised.
			</ErrorBox>
		);
	}

	if (props.showAutodetect) {
		formats = [
			{
				id: 'auto',
				title: 'Autodetect',
			},
			...formats
		];
	}

	return (
		<Select
			data={formats}
			keygen="id"
			format="id"
			autoAdapt
			renderItem="title"
			onFilter={text => d => (
				(d.title.indexOf(text) >= 0)
				|| (d.id.indexOf(text) >= 0)
			)}
			{...props}
		/>
	);
}

export default FormatList;
