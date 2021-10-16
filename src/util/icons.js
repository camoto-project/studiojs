import iconArchive from '@iconify/icons-fa-solid/archive';
import iconFile from '@iconify/icons-fa-solid/file';
import iconMusic from '@iconify/icons-fa-solid/music';

export { Icon } from '@iconify/react';
export { default as iconAttributes } from '@iconify/icons-fa-solid/list-alt';
export { default as iconAudio } from '@iconify/icons-fa-solid/volume-down';
export { default as iconB800 } from '@iconify/icons-fa-solid/th';
export { default as iconClose } from '@iconify/icons-fa-solid/times';
export { default as iconDelete } from '@iconify/icons-fa-solid/trash-alt';
export { default as iconEdit } from '@iconify/icons-fa-solid/edit';
export { default as iconFolder } from '@iconify/icons-fa-solid/folder';
export { default as iconImage } from '@iconify/icons-fa-solid/image';
export { default as iconInstruments } from '@iconify/icons-fa-solid/drum';
export { default as iconMap } from '@iconify/icons-fa-solid/drafting-compass';
export { default as iconMenu } from '@iconify/icons-fa-solid/bars';
export { default as iconPalette } from '@iconify/icons-fa-solid/palette';
export { default as iconSave } from '@iconify/icons-fa-solid/download';

export {
	iconArchive,
	iconFile,
	iconMusic,
};

export function getIconFromEditorId(idEditor) {
	return {
		'archive': iconArchive,
		'music': iconMusic,
	}[idEditor] || iconFile;
}
