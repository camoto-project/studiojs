import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import iconColDec from '@iconify/icons-fa-solid/minus-square';
import iconColInc from '@iconify/icons-fa-solid/plus-square';
import iconExport from '@iconify/icons-fa-solid/file-export';
import iconFilm from '@iconify/icons-fa-solid/film';
import iconImport from '@iconify/icons-fa-solid/file-import';
import iconSave from '@iconify/icons-fa-solid/save';
import iconZoom from '@iconify/icons-fa-solid/search-plus';
import iconExclamation from '@iconify/icons-fa-solid/exclamation-triangle';

import {
	frameFromTileset,
	tilesetFromFrame,
	img_png,
} from '@camoto/gamegraphics';
import { saveAs } from 'file-saver';

import Frame from './Frame.js';
import HiddenUpload from '../../components/HiddenUpload.js';
import MessageBox from '../../components/MessageBox.js';
import Tooltip from '../../components/Tooltip.js';
import WarningListModal from '../../components/WarningListModal.js';

import './Image.css';

function Image(props) {
	// Images supplied from the game.  If the user has imported a replacement
	// image, this will still be the original unmodified one.
	const defaultImages = props.document.length ? props.document : [props.document];

	// Images being used.  Will be the same as defaultImages until the user
	// imports a replacement, then it will be that replacement, possibly split up
	// into tiles as per the original.
	const [ masterImages, setMasterImages ] = useState(defaultImages);

	// Actual image set being shown.  This will change as animations are converted
	// to single images and back again for view/export.
	const [ images, setImages ] = useState(defaultImages);

	const [ zoom, setZoom ] = useState(2);

	const [ animationAllowed, setAnimationAllowed ] = useState(true);
	const [ tilesetFixed, setTilesetFixed ] = useState(false);
	const [ fixedWidth, setFixedWidth ] = useState(defaultImages[0].fixedWidth || 8);
	const [ maxWidth, setMaxWidth ] = useState(1);

	// Index of the selected image (last one clicked on), or null for no selection.
	const [ selectedImage, setSelectedImage ] = useState(null);

	const [ errorPopup, setErrorPopup ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	// True if the browse dialog is visible for image importing.
	const [ importVisible, setImportVisible ] = useState(false);

	// Is the image currently animating?
	const animation = (props.prefs.animation === undefined) ? true : !!props.prefs.animation;

	function onZoom() {
		switch (zoom) {
			default: setZoom(2); break;
			case 2: setZoom(4); break;
			case 4: setZoom(1); break;
		}
	}

	// If props.document ever changes, copy it across to masterImages, replacing
	// any modified image currently in masterImages.
	useEffect(() => {
		const defaultImages = props.document.length ? props.document : [props.document];
		setMasterImages(defaultImages);
	}, [
		props.document,
	]);

	// Figure out in the initial state whether we should enable animations or not.
	// If any image has animations they are enabled, but if none of them are
	// animated then they are disabled and all frames shown like a tileset.
	useEffect(() => {
		for (const img of masterImages) {
			if (img.animation.length > 0) {
				setAnimationAllowed(true);
				return;
			}
		}
		// Disable animations as there's nothing to animate.
		setAnimationAllowed(false);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		// Don't use masterImages here as we only want these values set on the first
		// render, not again when the image is replaced.
		props.document,
	]);

	useEffect(() => {
		// Check whether any image is animated.
		setTilesetFixed(false);
		let imgsProcessed = masterImages.map(img => {
			let shouldBeAnimated = (
				(img.frames.length > 1)
				&& animation
				&& animationAllowed
				&& (img.animation.length > 0)
			);
			if (shouldBeAnimated || (img.frames.length === 1)) {
				// Don't do any processing.
				return img;
			}

			// Convert to an image list.
			let i2 = img.clone(0, 0);
			i2.frames = [
				frameFromTileset(img, fixedWidth),
			];
			setTilesetFixed(true);
			return i2;
		});
		setImages(imgsProcessed);

		const newMaxWidth = masterImages.reduce((a, v) => Math.max(a, v.frames.length), 1)
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
		animationAllowed,
		fixedWidth,
		masterImages,
	]);

	function onToggleAnimation() {
		// This causes an update in props.mod.prefs.animation.
		props.savePrefs('animation', !animation);
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

	function onExport() {
		let targetImage = selectedImage;
		if ((targetImage === null) && (images.length === 1)) {
			// No image selected, but only one available, so just use that.
			targetImage = 0;
		}

		const img = images[targetImage];
		if (!img) {
			setErrorPopup(`Tried to export invalid image index ${targetImage}.`);
			return;
		}
		if (img.animation && animation) {
			setErrorPopup('Sorry, exporting animated images is not implemented yet!  '
				+ 'Use the toolbar button to turn the animations off before exporting.');
			return;
		}
		const output = img_png.write(img);
		setWarnings(output.warnings);

		const blobContent = new Blob([output.content.main]);
		const targetFilename = (
			props.mod.idGame
			+ '.'
			+ props.item.id
			+ '.img'
			+ targetImage
			+ '.png'
		);
		saveAs(blobContent, targetFilename, { type: 'application/octet-stream' });
	}

	function onImportAvailable(file) {
		setImportVisible(false);

		let targetImage = selectedImage;
		if ((targetImage === null) && (images.length === 1)) {
			// No image selected, but only one available, so just use that.
			targetImage = 0;
		}

		if (!images[targetImage]) {
			setErrorPopup(`Tried to import invalid image index ${targetImage}.`);
			return;
		}

		if (file.error) {
			setErrorPopup(`Error reading file: ${file.error}`);
			return;
		}

		let imgNew;
		try {
			imgNew = img_png.read({
				main: file.content,
			});
		} catch (e) {
			setErrorPopup('Error decoding .png file: ' + e.message);
			return;
		}

		// Use the original master image, before we did any conversion of the tiles
		// into a single image.  We want the individual tiles so we know how to
		// split up a single .png back into individual tiles.
		const imgOld = masterImages[targetImage];

		// If the palette can't be updated, map the pixels of the incoming image as
		// closely as possible to the existing palette.
		if (
			(!props.item.limits || !props.item.limits.writePalette)
			&& imgNew.palette
			&& imgOld.palette
		) {
			// Compare two palette entries and return a positive number, the larger
			// the more dissimilar the colours, 0 for identical colours.
			function palDiff(a, b) {
				return (
					Math.abs(a[0] - b[0])
					+ Math.abs(a[1] - b[1]) * 2 // higher weight for green
					+ Math.abs(a[2] - b[2])
					+ Math.abs(a[3] - b[3]) * 10 // highest weight for alpha
				);
			}

			let paletteMap = [];
			const lenNewPal = imgNew.palette.length;
			const lenOldPal = imgOld.palette.length;
			for (let i = 0; i < lenNewPal; i++) {
				paletteMap[i] = i;
				let lastDiff = 255 * 8; // worst case
				for (let o = 0; o < lenOldPal; o++) {
					// Start at the current palette index and wrap around if we get to the
					// end, so that we only go through this loop once if the two palettes
					// are the same.
					const targetO = (o + i) % lenOldPal;
					const diff = palDiff(imgNew.palette[i], imgOld.palette[targetO]);
					if (diff < lastDiff) {
						paletteMap[i] = targetO;
						lastDiff = diff;
					}
					if (diff === 0) break; // perfect match
				}
			}

			// Now we have a palette map, update all the new pixels.
			for (let frame of imgNew.frames) {
				for (let p = 0; p < frame.pixels.length; p++) {
					frame.pixels[p] = paletteMap[frame.pixels[p]];
				}
			}
		}

		// Now we have the image, we have to figure out how to overwrite the
		// existing one(s), which could be a single image or tiles.
		if (imgOld.frames.length > 1) {
			// Tileset
			const newFrames = tilesetFromFrame({
				frame: imgNew.frames[0],
				frameWidth: imgNew.frames[0].width || imgNew.width,
				tileDims: imgOld.frames.map(frame => ({
					width: frame.width,
					height: frame.height,
				})),
				bg: 0,
			});
			imgNew.frames = newFrames;

			// Set the new image dimensions to be undefined, so that we don't use
			// them when converting back into a composite image (which leaves empty
			// transparent pixels around the edge).
			imgNew.width = undefined;
			imgNew.height = undefined;

		} // else single image, nothing to do

		// Preserve some things from the original, unless the new one supplies them.
		imgNew.animation = imgNew.animation.length ? imgNew.animation : imgOld.animation;
		imgNew.hotspotX = imgNew.hotspotX || imgOld.hotspotX;
		imgNew.hotspotY = imgNew.hotspotY || imgOld.hotspotY;
		imgNew.tags = Object.keys(imgNew.tags).length ? imgNew.tags : imgOld.tags;

		if (!props.item.limits || !props.item.limits.writePalette) {
			// The palette is not writable, so restore the original one to ensure the
			// displayed image still uses the old palette.
			imgNew.palette = imgOld.palette;
		}

		let newImages = masterImages.slice();
		newImages[targetImage] = imgNew;
		setMasterImages(newImages);
		props.setUnsavedChanges(true);
	}

	function onSave() {
		try {
			if (props.document.length) {
				// We were given an array.
				props.cbSave(masterImages);
			} else {
				// We were given a single image.
				props.cbSave(masterImages[0]);
			}
			props.setUnsavedChanges(false);
		} catch (e) {
			console.error(e);
			setErrorPopup('Unable to put the image(s) back into the game.  The '
				+ 'reason given for the failure is: ' + e.message);
			return;
		}
	}

	function onImageClick(i, ev) {
		setSelectedImage(i);
		ev.stopPropagation();
	}

	// Can't import or export unless an image is selected, or there is only one
	// image.
	const exportDisabled = (
		((selectedImage === null) || (selectedImage === undefined))
		&& (images.length !== 1)
	);
	const importDisabled = exportDisabled;

	return (
		<>
			<div className="toolbar">
				<button onClick={onSave}>
					<Tooltip>
						Save all image(s) back to the game.
					</Tooltip>
					<Icon icon={iconSave} />
				</button>

				<span className="separator"/>

				<button onClick={onExport} disabled={exportDisabled}>
					<Tooltip>
						<span className="so-popover-text">
							{exportDisabled && (
								<b>
									<Icon icon={iconExclamation} className="icon" />
									Click on an image to select it first<br />
								</b>
							)}
							Save the selected image to a file
						</span>
					</Tooltip>
					<Icon icon={iconExport} />
				</button>

				<HiddenUpload
					visible={importVisible}
					onChange={onImportAvailable}
				>
					<button disabled={importDisabled}>
						<Tooltip>
							<span className="so-popover-text">
								{exportDisabled && (
									<b>
										<Icon icon={iconExclamation} className="icon" />
										Click on an image to select it first<br />
									</b>
								)}
								Replace the selected image with one loaded from a file
							</span>
						</Tooltip>
						<Icon icon={iconImport} />
					</button>
				</HiddenUpload>

				<span className="separator"/>

				<button onClick={onZoom}>
					<Tooltip>
						Cycle through zoom levels in the preview only (100%, 200%, 400%)
					</Tooltip>
					<Icon icon={iconZoom} />
				</button>

				<button
					onClick={onToggleAnimation}
					disabled={!animationAllowed}
					className={(animation && animationAllowed) ? 'hold' : ''}
				>
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
			<div className="image border-sunken">
				<div
					className="content"
					onClick={ev => onImageClick(null, ev)}
				>
					<div className="images">
						{images.map((img, i) => (
							<div
								key={i}
								className={'image' + ((selectedImage === i) ? ' selectedImage' : '')}
								onClick={ev => onImageClick(i, ev)}
							>
								<Frame
									frames={img.frames}
									animation={img.animation}
									palette={img.palette}
									imgWidth={img.width}
									imgHeight={img.height}
									zoom={zoom}
								/>
							</div>
						))}
					</div>
				</div>
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
					The following issues were encountered when exporting the image:
				</p>
			</WarningListModal>
		</>
	);
}

export default Image;
