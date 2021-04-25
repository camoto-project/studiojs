import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import iconImport from '@iconify/icons-fa-solid/file-import';
import iconExport from '@iconify/icons-fa-solid/file-export';
import iconZoom from '@iconify/icons-fa-solid/search-plus';
import iconFilm from '@iconify/icons-fa-solid/film';
import iconColInc from '@iconify/icons-fa-solid/plus-square';
import iconColDec from '@iconify/icons-fa-solid/minus-square';

import {
	frameFromTileset,
} from '@camoto/gamegraphics';

import Tooltip from '../../components/Tooltip.js';
import Frame from './Frame.js';
import './Image.css';

function Image(props) {
	const defaultImages = props.document.length ? props.document : [props.document];
	const [ zoom, setZoom ] = useState(2);
	const [ animation, setAnimation ] = useState(true);
	const [ animationAllowed, setAnimationAllowed ] = useState(true);
	const [ images, setImages ] = useState(defaultImages);
	const [ tilesetFixed, setTilesetFixed ] = useState(false);
	const [ fixedWidth, setFixedWidth ] = useState(defaultImages[0].fixedWidth || 8);
	const [ maxWidth, setMaxWidth ] = useState(1);

	function onZoom() {
		switch (zoom) {
			default: setZoom(2); break;
			case 2: setZoom(4); break;
			case 4: setZoom(1); break;
		}
	}

	// Figure out in the initial state whether we should enable animations or not.
	// If any image has animations they are enabled, but if none of them are
	// animated then they are disabled and all frames shown like a tileset.
	useEffect(() => {
		const defaultImages = props.document.length ? props.document : [props.document];
		for (const img of defaultImages) {
			if (img.animation.length > 0) {
				setAnimation(true);
				setAnimationAllowed(true);
				return;
			}
		}
		setAnimation(false);
		setAnimationAllowed(false);
	}, [
		props.document,
	]);

	useEffect(() => {
		const defaultImages = props.document.length ? props.document : [props.document];
		if (!animation) {
			// Convert any animations into fixed images.
			let imgsFixed = defaultImages.map(img => {
				if (img.frames.length > 1) {
					let i2 = img.clone(0, 0);
					i2.frames = [
						frameFromTileset(img, fixedWidth),
					];
					return i2;
				} else {
					// Nothing to do if there's only one frame.
					return img;
				}
			});
			setTilesetFixed(true);
			setImages(imgsFixed);
		} else {
			setTilesetFixed(false);
			setImages(defaultImages);
		}
		const newMaxWidth = defaultImages.reduce((a, v) => Math.max(a, v.frames.length), 1)
		setMaxWidth(newMaxWidth);
		// Clip the current value to the permitted range.
		setFixedWidth(
			Math.max(
				1,
				Math.min(
					newMaxWidth,
					fixedWidth
				)
			)
		);
	}, [
		animation,
		fixedWidth,
		props.document,
	]);

	function onToggleAnimation() {
		setAnimation(!animation);
	}

	function onColInc() {
		setFixedWidth(Math.min(maxWidth, fixedWidth + 1));
	}

	function onColDec() {
		setFixedWidth(
			Math.max(
				1,
				Math.min(
					maxWidth - 1,
					fixedWidth - 1
				)
			)
		);
	}

	return (
		<>
			<div className="toolbar">
				<button>
					<Tooltip>
						Save this image to a file
					</Tooltip>
					<Icon icon={iconExport} />
				</button>

				<button>
					<Tooltip>
						Replace this image with one loaded from a file
					</Tooltip>
					<Icon icon={iconImport} />
				</button>

				<button onClick={onZoom}>
					<Tooltip>
						Adjust zoom level in the preview only
					</Tooltip>
					<Icon icon={iconZoom} />
				</button>

				<button onClick={onToggleAnimation} disabled={!animationAllowed} className={animation ? 'hold' : ''}>
					<Tooltip>
						Toggle between animation and frame list
					</Tooltip>
					<Icon icon={iconFilm} />
				</button>

				<button onClick={onColInc} disabled={!tilesetFixed || (fixedWidth >= maxWidth)}>
					<Tooltip>
						Increase the frame list width
					</Tooltip>
					<Icon icon={iconColInc} />
				</button>

				<button onClick={onColDec} disabled={!tilesetFixed || (fixedWidth <= 1)}>
					<Tooltip>
						Decrease the frame list width
					</Tooltip>
					<Icon icon={iconColDec} />
				</button>

			</div>
			<div className="content">
				<div className="frames">
					{images.map((img, i) => (
						<Frame
							key={i}
							frames={img.frames}
							animation={img.animation}
							palette={img.palette}
							imgWidth={img.width}
							imgHeight={img.height}
							zoom={zoom}
						/>
					))}
				</div>
			</div>
		</>
	);
}

export default Image;
