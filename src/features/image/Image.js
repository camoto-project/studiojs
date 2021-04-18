import React, { useEffect, useRef, useState } from 'react';
import { Link as RRLink } from 'react-router-dom';

import {
	Button,
	Table,
	Tooltip,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconCompressed from '@iconify/icons-fa-solid/file-archive';

//import { img_png } from '@camoto/gamegraphics';

import { saveAs } from 'file-saver';

import OpenFile from '../OpenFile.js';
import SaveFile from '../SaveFile.js';

//import './Image.css';

function Image(props) {
	const refCanvas = useRef(null);

	const img = props.document;

	let extentX = img.width || 0, extentY = img.height || 0;
	for (const frame of img.frames) {
		if (frame.width && frame.height) {
			extentX = Math.max(extentX, frame.offsetX + frame.width);
			extentY = Math.max(extentX, frame.offsetY + frame.height);
		}
	}

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

	useEffect(() => {
		const canvas = refCanvas.current;
		const context = canvas.getContext('2d');
		let frameCount = 0;
		let animationFrameId;

		//Our draw came here
		const render = () => {
			frameCount++;
			draw(context, frameCount);
			if (img.frames.length > 1) {
				animationFrameId = window.requestAnimationFrame(render);
			}
		}
		render();

		return () => {
			window.cancelAnimationFrame(animationFrameId)
		}
	}, [img])

	return (
		<canvas
			ref={refCanvas}
			width={extentX}
			height={extentY}
		/>
	);
}

export default Image;
