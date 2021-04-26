import React, { useEffect, useRef, useMemo } from 'react';

function Frame(props) {
	if (!props.palette) {
		throw new Error('Unable to render an image without a palette.');
	}

	const refCanvas = useRef(null);

	let extentX = props.imgWidth || 0, extentY = props.imgHeight || 0;
	for (const frame of props.frames) {
		if (frame.width && frame.height) {
			extentX = Math.max(extentX, frame.offsetX + frame.width);
			extentY = Math.max(extentY, frame.offsetY + frame.height);
		}
	}

	// Make any frames with a zero dimension at least 1 or we get canvas errors.
	extentX = Math.max(1, extentX);
	extentY = Math.max(1, extentY);

	// Convert each frame from gamegraphics.js format into HTML canvas format.
	// This is done in a useMemo() so that it only runs when the source image
	// data changes, rather than running on every animation frame.
	const pxCanvasFrames = useMemo(() => {
		// Abort early in the render when we don't have enough data yet.
		if (!props.frames) return [];
		if (!refCanvas.current) return [];

		const canvas = refCanvas.current;
		const ctx = canvas.getContext('2d');

		let pxCanvasFrames = []
		for (let f = 0; f < props.frames.length; f++) {
			const frame = props.frames[f];
			const frameWidth = (frame.width === undefined) ? props.imgWidth : frame.width;
			const frameHeight = (frame.height === undefined) ? props.imgHeight : frame.height;

			// If the image is 0x0 just create a dummy 1x1 to avoid an exception.
			if ((frameWidth === 0) || (frameHeight === 0)) {
				return ctx.createImageData(1, 1);
			}

			const pal = props.palette;

			let pxCanvas = ctx.createImageData(frameWidth, frameHeight);
			for (let i = 0; i < frameWidth * frameHeight; i++) {
				const px = frame.pixels[i];
				const clr = pal[px] || [255, 0, 255, 255];
				for (let j = 0; j < 4; j++) {
					pxCanvas.data[i * 4 + j] = clr[j];
				}
			}
			pxCanvasFrames.push(pxCanvas);
		}

		return pxCanvasFrames;
	}, [
		props.frames,
		props.imgHeight,
		props.imgWidth,
		props.palette,
		refCanvas.current,
	]);

	useEffect(() => {
		const draw = (ctx, frameIndex) => {
			// Just abort if we get a frame that's out of range.
			if (frameIndex >= pxCanvasFrames.length) return;
			ctx.putImageData(pxCanvasFrames[frameIndex], 0, 0);
		}

		const canvas = refCanvas.current;
		const context = canvas.getContext('2d');
		let frameCount = -1;
		let animationFrameId;
		let timerId;

		const render = () => {
			if (props.animation.length > 0) {
				frameCount = (frameCount + 1) % props.animation.length;
				const frameInfo = props.animation[frameCount];
				draw(context, frameInfo.index);
				if (props.frames.length > 1) {
					timerId = setTimeout(() => {
						animationFrameId = window.requestAnimationFrame(render);
					}, frameInfo.postDelay || 1000);
				}
			} else {
				// Non-animation.
				draw(context, 0);
			}
		}
		render();

		return () => {
			clearTimeout(timerId);
			window.cancelAnimationFrame(animationFrameId);
		}
	}, [
		props.animation,
		props.frames,
		props.imgHeight,
		props.imgWidth,
		props.palette,
		pxCanvasFrames,
	])

	return (
		<canvas
			ref={refCanvas}
			width={extentX}
			height={extentY}
			style={{width: extentX * props.zoom, height: extentY * props.zoom}}
		/>
	);
}

export default Frame;
