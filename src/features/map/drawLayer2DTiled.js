export default function drawLayer2DTiled(ctx, layer, imgCache, frameIndex) {
	const tiles = layer.tiles;
	const tileW = layer.tileW;
	const tileH = layer.tileH;

	function loadTile(t) {
		const img = layer.imageFromCode(t);
		if (img === null) {
			// Use a fully-transparent image.
			let n = ctx.createImageData(tileW, tileH);
			return [n];
		}
		if (img === undefined) {
			console.error(`BUG: gamemaps.js Map instance did not return an image for tile code ${t}`);
			// Create a generic 'unknown'
			let n = ctx.createImageData(tileW, tileH);
			for (let y = 0; y < tileH; y++) {
				for (let x = 0; x < tileW; x++) {
					n.data[(y * tileW + x) * 4 + 0] = 255;
					n.data[(y * tileW + x) * 4 + 1] = 0;
					n.data[(y * tileW + x) * 4 + 2] = 255;
					n.data[(y * tileW + x) * 4 + 3] = 255;
				}
			}
			return [n];
		}
		const canvasFrames = [];
		for (let f = 0; f < img.frames.length; f++) {
			let n = ctx.createImageData(tileW, tileH);
			for (let y = 0; y < tileH; y++) {
				for (let x = 0; x < tileW; x++) {
					const pixelOffset = (y * tileW + x);
					const srcPixel = img.frames[f].pixels[pixelOffset];
					const pal = img.palette[srcPixel] || [255, 0, 255, 255];
					n.data[pixelOffset * 4 + 0] = pal[0];
					n.data[pixelOffset * 4 + 1] = pal[1];
					n.data[pixelOffset * 4 + 2] = pal[2];
					n.data[pixelOffset * 4 + 3] = pal[3];
				}
			}
			canvasFrames.push(n);
		}
		return canvasFrames;
	}

	for (let y = 0; y < tiles.length; y++) {
		const pixelY = y * tileH;
		for (let x = 0; x < tiles[y].length; x++) {
			const pixelX = x * tileW;
			const tileCode = tiles[y][x];
			if (tileCode === undefined) continue;
			if (!imgCache[tileCode]) {
				imgCache[tileCode] = loadTile(tileCode);
			}
			const ti = imgCache[tileCode];
			ctx.putImageData(ti[frameIndex % ti.length], pixelX, pixelY);
		}
	}
}
