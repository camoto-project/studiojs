import React, { useState, useEffect, useRef } from 'react';
import {
	Tooltip,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconImport from '@iconify/icons-fa-solid/file-import';
import iconExport from '@iconify/icons-fa-solid/file-export';
import iconZoom from '@iconify/icons-fa-solid/search-plus';

import './Image.css';

function Image(props) {
	const refCanvas = useRef(null);
	const [ zoom, setZoom ] = useState(2);

	const img = props.document;

	let extentX = img.width || 0, extentY = img.height || 0;
	for (const frame of img.frames) {
		if (frame.width && frame.height) {
			extentX = Math.max(extentX, frame.offsetX + frame.width);
			extentY = Math.max(extentY, frame.offsetY + frame.height);
		}
	}

	useEffect(() => {
		const draw = (ctx, frameCount) => {
			if (!img) return;

			const frame = img.frames[frameCount % img.frames.length];
			const frameWidth = (frame.width === undefined) ? img.width : frame.width;
			const frameHeight = (frame.height === undefined) ? img.height : frame.height;
			const pal = img.palette; // TODO: or default EGA pal

			let pxCanvas = ctx.createImageData(frameWidth, frameHeight);
			for (let i = 0; i < frameWidth * frameHeight; i++) {
				const px = frame.pixels[i];
				for (let j = 0; j < 4; j++) {
					pxCanvas.data[i * 4 + j] = pal[px][j];
				}
			}
			ctx.putImageData(pxCanvas, 0, 0);
		}

		const canvas = refCanvas.current;
		const context = canvas.getContext('2d');
		let frameCount = 0;
		let animationFrameId;
		let timerId;

		const render = () => {
			frameCount = (frameCount + 1) % img.frames.length;
			draw(context, frameCount);
			if (img.frames.length > 1) {
				timerId = setTimeout(() => {
					animationFrameId = window.requestAnimationFrame(render);
				}, img.frames[frameCount].postDelay || 300);
			}
		}
		render();

		return () => {
			clearTimeout(timerId);
			window.cancelAnimationFrame(animationFrameId);
		}
	}, [img])

	function onZoom() {
		switch (zoom) {
			default: setZoom(2); break;
			case 2: setZoom(4); break;
			case 4: setZoom(1); break;
		}
	}

	return (
		<>
			<div className="toolbar">
				<Tooltip tip="Save this image to a file" position="bottom">
					<button>
						<Icon icon={iconExport} />
					</button>
				</Tooltip>
				<Tooltip tip="Replace this image with one loaded from a file" position="bottom">
					<button>
						<Icon icon={iconImport} />
					</button>
				</Tooltip>
				<Tooltip tip="Adjust zoom level in the preview only" position="bottom">
					<button onClick={onZoom}>
						<Icon icon={iconZoom} />
					</button>
				</Tooltip>
			</div>
			<div className="content">
				<canvas
					ref={refCanvas}
					width={extentX}
					height={extentY}
					style={{width: extentX * zoom, height: extentY * zoom}}
				/>
			</div>
		</>
	);
}

export default Image;
