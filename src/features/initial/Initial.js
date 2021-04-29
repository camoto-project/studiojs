import React, { useEffect, useState } from 'react';

import {
	Spin,
} from 'shineout';

import ErrorBox from '../../components/ErrorBox.js';

import './Initial.css';

function Initial(props) {
	const [ tips, setTips ] = useState(null);
	const [ errorMessage, setErrorMessage ] = useState(null);

	// Download the tips content.
	useEffect(() => {
		const ac = new AbortController();
		async function run() {
			try {
				const req = await fetch(props.item.tipsContentURL, {
					headers: {
						'Accept': 'application/json',
					},
					signal: ac.signal,
				});
				const page = await req.json();
				if (page && !page.parse) {
					setTips('<p>There are no tips available for this game.</p>');
					return;
				}
				setTips(page.parse.text);
			} catch (e) {
				setTips(null);
				setErrorMessage('Error loading tips: ' + e.message);
			}
		}
		run();

		return function cleanup() {
			ac.abort();
		};
	}, [
		props.item,
	]);

	return (
		<div className="content">
			<div className="initial">
				<h1>
					Welcome to Camoto Studio Online!
				</h1>
				<p>
					Please select an item to start editing.
				</p>
				<h1>
					Modding tips for {props.item.gameTitle}
				</h1>
				<small>
					{/* eslint-disable-next-line react/jsx-no-target-blank */}
					From: <a href={props.item.tipsSource.url} target="_blank">{props.item.tipsSource.title}</a>
				</small>
				<ErrorBox
					summary={`Error`}
					style={{display: errorMessage === null ? 'none' : 'block' }}
				>
					<p>
						{errorMessage}
					</p>
				</ErrorBox>
				{(tips && (
					<div className="tips" dangerouslySetInnerHTML={{ __html: tips}} />
				)) || (
					<Spin name="ring"/>
				)}
			</div>
		</div>
	);
}

export default Initial;
