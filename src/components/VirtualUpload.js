import { Button, Upload } from 'shineout';
import { Icon } from '@iconify/react';
import iconFolderOpen from '@iconify/icons-fa-solid/folder-open';
import iconFile from '@iconify/icons-fa-solid/file';

function VirtualUpload(props) {
	// Virtual request to grab the file content instead of uploading it.  Reads
	// the file and passes an object with the data to onLoad(), which ultimately
	// ends up in the <Upload/> onChange handler.
	const request = options => {
		const { file, onLoad, onError } = options;
		const reader = new FileReader();
		reader.addEventListener('load', () => {
			onLoad({ status: 200, response: {
				nativeValue: file,
				name: file.name,
				content: new Uint8Array(reader.result),
			}});
		});
		reader.addEventListener('error', () => {
			onError({ statusText: 'Unknown error reading selected file.' });
		});

		reader.readAsArrayBuffer(file);
	};

	return (
		<Upload
			accept="*"
			drop
			limit={props.multiple ? undefined : 1}
			onSuccess={(response, file) => response}
			request={request}
			renderResult={d => (
				<>
					<Icon icon={iconFile} style={{marginRight: 6, marginBottom: -1}}/>
					{d.name}
				</>
			)}
			{...props}
		>
			<Button type={props.type}>
				<Icon icon={iconFolderOpen} style={{marginRight: 6, marginBottom: -1}}/>
				Browse
			</Button>
		</Upload>
	);
}

export default VirtualUpload;
