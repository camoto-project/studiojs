function createGenericImage(ctx, width, height) {
	let n = ctx.createImageData(width, height);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			n.data[(y * width + x) * 4 + 0] = 255;
			n.data[(y * width + x) * 4 + 1] = 0;
			n.data[(y * width + x) * 4 + 2] = 255;
			n.data[(y * width + x) * 4 + 3] = 255;
		}
	}
	return n;
}

export default function drawLayer2DTiled(ctx, layer, imgCache, frameIndex) {
	const tiles = layer.tiles;
	const tileW = layer.tileW;
	const tileH = layer.tileH;

	function loadTile(t) {
		const img = layer.imageFromCode(t);
		if (!img) {
			// No code here, show through to layer behind.
			return null;
		}
		if (img === undefined) {
			console.error(`BUG: gamemaps.js Map instance did not return an image for tile code ${t}`);
			// Create a generic 'unknown'
			return [
				createGenericImage(ctx, tileW, tileH),
			];
		}
		if (!img.frames) {
			console.error(`BUG: imageFromCode() for ${layer.title} returned a non-Image object.`);
			return [
				createGenericImage(ctx, tileW, tileH),
			];
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

	let errCount = 0;
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

			// No tile (e.g. default background tile).
			if (ti === null) continue;

			const src = ti[frameIndex % ti.length];
			if (!src) continue;

			try {
				ctx.putImageData(src, pixelX, pixelY);
			} catch (e) {
				console.error(`putImageData() failed at (${x}, ${y}): ${e.message}`);
				if (errCount++ > 5) {
					console.log('Too many errors, aborting render.');
					return;
				}
				continue;
			}
		}
	}
}
