export default function drawLayer2DList(ctx, layer, imgCache, frameIndex) {
	function loadTile(t) {
		const img = layer.imageFromCode(t);
		if (img === null) {
			// Use a fully-transparent image.
			let n = ctx.createImageData(1, 1);
			return [n];
		}
		if (img === undefined) {
			console.error(`BUG: gamemaps.js Map instance did not return an image for tile code ${t}`);
			// Create a generic 'unknown'
			const imgW = 8, imgH = 8;
			let n = ctx.createImageData(8, 8);
			for (let y = 0; y < imgH; y++) {
				for (let x = 0; x < imgW; x++) {
					n.data[(y * imgW + x) * 4 + 0] = 255;
					n.data[(y * imgW + x) * 4 + 1] = 0;
					n.data[(y * imgW + x) * 4 + 2] = 255;
					n.data[(y * imgW + x) * 4 + 3] = 255;
				}
			}
			return [n];
		}

		const canvasFrames = [];
		for (let f = 0; f < img.frames.length; f++) {
			const imgW = img.frames[f].width || img.width;
			const imgH = img.frames[f].height || img.height;
			let n = ctx.createImageData(imgW, imgH);
			const len = imgW * imgH;
			for (let i = 0; i < len; i++) {
				const srcPixel = img.frames[f].pixels[i];
				const pal = img.palette[srcPixel] || [255, 0, 255, 255];
				n.data[i * 4 + 0] = pal[0];
				n.data[i * 4 + 1] = pal[1];
				n.data[i * 4 + 2] = pal[2];
				n.data[i * 4 + 3] = pal[3];
			}
			canvasFrames.push(n);
		}
		return {
			img: canvasFrames,
			imgW: img.frames[0].width || img.width,
			imgH: img.frames[0].height || img.height,
		};
	}

	for (let i = 0; i < layer.items.length; i++) {
		const item = layer.items[i];

		if (item.code === undefined) continue;
		if (!imgCache[item.code]) {
			imgCache[item.code] = loadTile(item.code);
		}
		const ti = imgCache[item.code];
		let offsetX = 0, offsetY = 0;
		if (item.xAttach > 0) {
			offsetX = -ti.imgW * item.xAttach;
		}
		if (item.yAttach > 0) {
			offsetY = -ti.imgH * item.yAttach;
		}
		ctx.putImageData(ti.img[frameIndex % ti.img.length], item.x + offsetX, item.y + offsetY);
	}
}
