import React, { useEffect, useRef } from 'react';

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

	useEffect(() => {
		const draw = (ctx, frameIndex) => {
			if (!props.frames) return;

			// Just abort if we get a frame that's out of range.
			if (frameIndex > props.frames.length) return;
			const frame = props.frames[frameIndex];
			const frameWidth = (frame.width === undefined) ? props.imgWidth : frame.width;
			const frameHeight = (frame.height === undefined) ? props.imgHeight : frame.height;
			const pal = props.palette;

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
