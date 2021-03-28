import { Button, Upload } from 'shineout';
import { Icon } from '@iconify/react';
import iconFolderOpen from '@iconify/icons-fa-solid/folder-open';
import iconFile from '@iconify/icons-fa-solid/file';

function VirtualUpload(props) {
	// Virtual request to grab the file content instead of uploading it.  Reads
	// the file and passes an object with the data to onLoad(), which ultimately
	// ends up in the <Upload/> onChange handler.
	const request = options => {
		const { file, onLoad } = options;
		const xhr = new XMLHttpRequest();
		const reader = new FileReader();
		reader.onload = r => {
			const data = new Uint8Array(r.target.result);
			onLoad({ status: 200, response: {
				nativeValue: file,
				name: file.name,
				content: data,
			}});
		};
		reader.readAsArrayBuffer(file);

		return xhr;
	};
console.log('virtualUpload value', props.tempid, props.value && props.value.nativeValue, props.value);
	return (
		<Upload
			accept="*"
			drop
			limit={1}
			request={request}
			renderResult={d => (
				<>
					<Icon icon={iconFile} style={{marginRight: 6, marginBottom: -1}}/>
					{d.name}
				</>
			)}
			{...props}
			value={props.value && props.value.nativeValue && [props.value.nativeValue]}
			onChange={f => props.onChange(f && f[0])}
		>
			<Button type={props.type}>
				<Icon icon={iconFolderOpen} style={{marginRight: 6, marginBottom: -1}}/>
				Browse
			</Button>
		</Upload>
	);
}

export default VirtualUpload;
