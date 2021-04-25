import React, { useRef } from 'react';

function HiddenUpload(props) {
	const refFile = useRef();

	function handleFileSelection() {
		const file = refFile.current.files[0];

		const reader = new FileReader();

		reader.addEventListener('load', () => {
			props.onChange({
				name: file.name,
				content: new Uint8Array(reader.result),
			});
		});

		reader.addEventListener('error', e => {
			console.error('Error reading file:', e);
			props.onChange({
				error: 'Unable to read the selected file.  The web browser did not '
					+ 'give a reason why.',
			});
		});

		reader.readAsArrayBuffer(file);
	}

	return (

		<span onClick={() => refFile.current.click()}>
			{props.children}
			<input
				type="file"
				ref={refFile}
				onChange={handleFileSelection}
				style={{display: 'none'}}
				multiple={false}
				accept={props.mimeAccept || '*'}
			/>
		</span>
	);
}

export default HiddenUpload;
