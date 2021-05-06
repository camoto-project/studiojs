import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
	Input,
} from 'shineout';

import { Icon } from '@iconify/react';
import iconSave from '@iconify/icons-fa-solid/save';
import iconZoom from '@iconify/icons-fa-solid/search-plus';

import {
	Image,
	img_png,
	pal_vga_8bit,
} from '@camoto/gamegraphics';
import { saveAs } from 'file-saver';

import HiddenUpload from '../../components/HiddenUpload.js';
import MessageBox from '../../components/MessageBox.js';
import Tooltip from '../../components/Tooltip.js';
import WarningListModal from '../../components/WarningListModal.js';

import drawLayer2DTiled from './drawLayer2DTiled.js';
import drawLayer2DList from './drawLayer2DList.js';

import './Map.css';

function Map(props) {
	const refCanvas = useRef(null);

	const [ map, setMap ] = useState(props.document);

	const [ errorPopup, setErrorPopup ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	const [ zoom, setZoom ] = useState(2);

	function onZoom() {
		switch (zoom) {
			default: setZoom(2); break;
			case 2: setZoom(4); break;
			case 4: setZoom(1); break;
		}
	}

	function onSave() {
		try {
			props.cbSave(map);
			props.setUnsavedChanges(false);
		} catch (e) {
			console.error(e);
			setErrorPopup('Unable to put the map back into the game.  The '
				+ 'reason given for the failure is: ' + e.message);
			return;
		}
	}

	const mapSize = useMemo(() => map.getSize());

	useEffect(() => {
		// Abort early in the render when we don't have enough data yet.
		if (!map) return;
		if (!refCanvas.current) return [];

		const canvas = refCanvas.current;
		const ctx = canvas.getContext('2d');

		// Cache the tiles between subsequent animation renders.
		const imgCache = [];
		for (let l = 0; l < map.layers.length; l++) {
			imgCache[l] = [];
		}
		let layerError = [];

		// Callback to draw one of the above frames onto the HTML canvas.
		const draw = (ctx, frameIndex) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let l = 0; l < map.layers.length; l++) {
				switch (map.layers[l].type) {
					case '2d.tiled':
						drawLayer2DTiled(ctx, map.layers[l], imgCache[l], frameIndex);
						break;

					case '2d.list':
						drawLayer2DList(ctx, map.layers[l], imgCache[l], frameIndex);
						break;

					default:
						if (!layerError[l]) {
							console.error(`Layer ${l} is an unknown type: ${l.type}.`);
							layerError[l] = true;
						}
						break;
				}
			}
		}

		let frameCount = -1;
		let animationFrameId;
		let timerId;

		const render = () => {
			frameCount++;
			/*
			if (props.animation.length > 0) {
				frameCount = (frameCount + 1) % props.animation.length;
				const frameInfo = props.animation[frameCount];
				draw(ctx, frameInfo.index);
				if (props.frames.length > 1) {
					timerId = setTimeout(() => {
						animationFrameId = window.requestAnimationFrame(render);
					}, frameInfo.postDelay || 1000);
				}
			} else {
				// Non-animation.
*/
				draw(ctx, frameCount);
//			}

			if (map.animationDelay) {
				timerId = setTimeout(() => {
					animationFrameId = window.requestAnimationFrame(render);
				}, map.animationDelay);
			}
		}
		render();

		return () => {
			clearTimeout(timerId);
			window.cancelAnimationFrame(animationFrameId);
		}
	}, [
		map,
		mapSize,
	])

	return (
		<>
			<div className="toolbar">
				<button onClick={onSave}>
					<Tooltip>
						Save map back to the game.
					</Tooltip>
					<Icon icon={iconSave} />
				</button>

				<span className="separator"/>

				<button onClick={onZoom}>
					<Tooltip>
						Cycle through zoom levels in the preview only (100%, 200%, 400%)
					</Tooltip>
					<Icon icon={iconZoom} />
				</button>

			</div>
			<div className="content">
				<canvas
					ref={refCanvas}
					width={mapSize.x}
					height={mapSize.y}
					style={{width: mapSize.x * zoom, height: mapSize.y * zoom}}
				/>
			</div>
			<MessageBox
				icon="error"
				visible={errorPopup !== null}
				onClose={() => setErrorPopup(null)}
			>
				<p>
					{errorPopup}
				</p>
				<small>
					A stack trace may be available in the browser console.
				</small>
			</MessageBox>
			<WarningListModal
				warnings={warnings}
				onClose={() => setWarnings([])}
			>
				<p>
					The following issues were encountered:
				</p>
			</WarningListModal>
		</>
	);
}

export default Map;
