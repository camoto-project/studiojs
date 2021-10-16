import iconArchive from '@iconify/icons-fa-solid/archive';
import iconAttributes from '@iconify/icons-fa-solid/list-alt';
import iconAudio from '@iconify/icons-fa-solid/volume-down';
import iconB800 from '@iconify/icons-fa-solid/th';
import iconFile from '@iconify/icons-fa-solid/file';
import iconImage from '@iconify/icons-fa-solid/image';
import iconMap from '@iconify/icons-fa-solid/drafting-compass';
import iconMusic from '@iconify/icons-fa-solid/music';
import iconPalette from '@iconify/icons-fa-solid/palette';

export { Icon } from '@iconify/react';
export { default as iconClose } from '@iconify/icons-fa-solid/times';
export { default as iconCompressed } from '@iconify/icons-fa-solid/file-archive';
export { default as iconDelete } from '@iconify/icons-fa-solid/trash-alt';
export { default as iconDownload } from '@iconify/icons-fa-solid/download';
export { default as iconEdit } from '@iconify/icons-fa-solid/edit';
export { default as iconEncrypted } from '@iconify/icons-fa-solid/key';
export { default as iconExtract } from '@iconify/icons-fa-solid/file-export';
export { default as iconFolder } from '@iconify/icons-fa-solid/folder';
export { default as iconFolderOpen } from '@iconify/icons-fa-solid/folder-open';
export { default as iconInsertBefore } from '@iconify/icons-fa-solid/level-up-alt';
export { default as iconInstruments } from '@iconify/icons-fa-solid/drum';
export { default as iconMenu } from '@iconify/icons-fa-solid/bars';
export { default as iconRename } from '@iconify/icons-fa-solid/edit';
export { default as iconReplace } from '@iconify/icons-fa-solid/file-import';
export { default as iconSave } from '@iconify/icons-fa-solid/download';

export {
	iconArchive,
	iconAttributes,
	iconAudio,
	iconB800,
	iconFile,
	iconImage,
	iconMap,
	iconMusic,
	iconPalette,
};

export function getIconFromEditorId(idEditor) {
	return {
		'archive': iconArchive,
		'attributes': iconAttributes,
		'audio': iconAudio,
		'b800': iconB800,
		'image': iconImage,
		'map': iconMap,
		'music': iconMusic,
		'palette': iconPalette,
	}[idEditor] || iconFile;
}
