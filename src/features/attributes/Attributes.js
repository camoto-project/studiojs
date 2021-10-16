/*
 * Camoto Studio Online - Attributes
 *
 * UI for editing attributes from gamecode.js.
 *
 * Copyright (C) 2010-2021 Adam Nielsen <malvineous@shikadi.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React, { useCallback, useMemo, useState } from 'react';

import {
	Input,
	Table,
} from 'shineout';

import { Icon } from '@iconify/react';
import iconSave from '@iconify/icons-fa-solid/save';

import MessageBox from '../../components/MessageBox.js';
import Tooltip from '../../components/Tooltip.js';
import WarningListModal from '../../components/WarningListModal.js';

import './Attributes.css';

function Attributes(props) {
	const [ attributes, setAttributes ] = useState(props.document);

	const [ errorPopup, setErrorPopup ] = useState(null);
	const [ warnings, setWarnings ] = useState([]);

	function onSave() {
		try {
			props.cbSave(attributes);
			props.setUnsavedChanges(false);
		} catch (e) {
			console.error(e);
			setErrorPopup('Unable to put the map back into the game.  The '
				+ 'reason given for the failure is: ' + e.message);
			return;
		}
	}

	const setValue = useCallback((id, newVal) => {
		if (typeof attributes[id].value === 'number') {
			newVal = parseInt(newVal); // no radix, allow '0x' prefix
		}
		attributes[id].value = newVal;
		setAttributes(attributes);
	}, [
		attributes,
	]);

	const attributeList = useMemo(() => {
		return Object.keys(attributes).sort().map(k => ({
			id: k,
			...attributes[k],
		}));
	}, [
		attributes,
	]);

	return (
		<>
			<div className="toolbar">
				<button onClick={onSave}>
					<Tooltip>
						Save attributes back to the game.
					</Tooltip>
					<Icon icon={iconSave} />
				</button>
			</div>

			<div className="attributes content-container">
				<div className="content">
					<Table
						className="attributes camoto"
						keygen="id"
						columns={[
							{
								title: 'ID',
								render: 'id',
								className: 'colID',
							}, {
								title: 'Value',
								className: 'colValue',
								render: d => {
									if (typeof d.value === 'number') {
										return (
											<Input.Number
												min={d.min}
												max={d.max}
												defaultValue={d.value}
												onEnterPress={v => setValue(d.id, v)}
												onBlur={ev => setValue(d.id, ev.target.value)}
											/>
										);
									}
									return (
										<Input
											defaultValue={d.value}
											onEnterPress={v => setValue(d.id, v)}
											onBlur={ev => setValue(d.id, ev.target.value)}
											maxLength={d.type.lenAvailable}
										/>
									);
								},
							}, {
								title: 'Type',
								render: 'valueType',
								className: 'colType',
							}, {
								title: 'Description',
								render: 'desc',
								className: 'colDesc',
							}
						]}
						data={attributeList}
					/>
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
					The following issues were encountered:
				</p>
			</WarningListModal>
		</>
	);
}

export default Attributes;
