import React from 'react';

import {
	Button,
	Modal,
} from 'shineout';
import { Icon } from '@iconify/react';
import iconError from '@iconify/icons-fa-solid/times-circle';
import iconExclamation from '@iconify/icons-fa-solid/exclamation-triangle';
import iconInfo from '@iconify/icons-fa-solid/info-circle';
import iconOK from '@iconify/icons-fa-solid/check';

function MessageBox(props) {

	const icon = {
		error: iconError,
		warning: iconExclamation,
		info: iconInfo,
	}[props.icon] || iconInfo;

	const iconColour = {
		error: 'red',
		warning: 'orange',
		info: 'blue',
	}[props.icon] || iconInfo;

	const title = props.title || {
		error: 'Error',
		warning: 'Warning',
		info: 'Information',
	}[props.icon] || 'Information';

	let jsxFooterPrefix = null;
	if (props.confirm) {
		jsxFooterPrefix = (
			<>
				<button onClick={props.onClose} className="link">
					Cancel
				</button>
				<span className="flex-spacer"/>
			</>
		);
	}

	return (
		<Modal
			visible={props.visible}
			title={(
				<div className="largeIconText">
					<Icon icon={icon} className="icon" style={{color: iconColour}} />
					<span>{title}</span>
				</div>
			)}
			onClose={props.onClose}
			footer={(
				<>
					{jsxFooterPrefix}
					<Button
						onClick={props.onOK || props.onClose}
						loading={props.okBusy}
						type={props.buttonTypeOK || "primary"}
					>
						{!props.okBusy && (
							<Icon icon={props.okIcon || iconOK} className="icon" />
						)}
						{props.okText || 'OK'}
					</Button>
				</>
			)}
		>
			{props.children}
		</Modal>
	);
}

export default MessageBox;
