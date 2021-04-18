import React from 'react';
import * as sourceStackTrace from 'sourcemapped-stacktrace';

import ErrorBox from './ErrorBox.js';

class ErrorBoundary extends React.Component
{
	constructor(props) {
		super(props);
		this.state = {
			hasError: false,
			exception: null,
			stacktrace: null,
		};
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return {
			hasError: true,
			exception: error,
			stacktrace: null,
		};
	}

	componentDidCatch(error, errorInfo) {
		// Convert the stack trace to a meaningful one.
		sourceStackTrace.mapStackTrace(error.stack, stacktrace => {
			this.setState({stacktrace});
		});
	}

	render() {
		if (this.state.hasError) {
			const msg = (this.state.exception && this.state.exception.message)
				|| 'No message available.';

			let stacktrace = 'No stacktrace available.';
			if (this.state.stacktrace) {
				// Stop at 10 entries, or when we encounter one that contains 'react'.
				// This removes tons of irrelevant stacktrace.
				let lastUsefulIndex = this.state.stacktrace.findIndex(
					s => s.includes('react')
				);
				if (lastUsefulIndex === -1) {
					// No 'react' in any backtrace.
					lastUsefulIndex = 10;
				}
				lastUsefulIndex = Math.min(10, lastUsefulIndex);
				stacktrace = this.state.stacktrace
					.slice(0, lastUsefulIndex)
					.map(s => (
						<>
							<div>{s}</div>
						</>
					));
			}

			return (
				<ErrorBox summary={`Unhandled error`}>
					<p>
						There was an error, but Camoto Studio didn't cope with it properly,
						which it is supposed to.  If you can come up with a short list of
						steps that will cause this error to happen every time, please{' '}
						<a href="https://github.com/camoto-project/studiojs/issues" target="_blank" rel="noreferrer">
							check the list of known issues on GitHub
						</a>
						.  If this one is not in the list, please create a new issue and
						include the steps to follow that cause this error.
					</p>
					<p>
						The error details are:
					</p>
					<p className="exception-message">
						<b>{msg}</b>
					</p>
					<p className="stacktrace">
						{stacktrace}
					</p>
				</ErrorBox>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
