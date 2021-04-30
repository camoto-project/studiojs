// From https://stackoverflow.com/a/39094299/308237 by Ori Drori
import { useRef, useEffect } from 'react';

const useUnload = fn => {
	const cb = useRef(fn); // init with fn, so that type checkers won't assume that current might be undefined

	useEffect(() => {
		cb.current = fn;
	}, [fn]);

	useEffect(() => {
		const onUnload = (...args) => (cb.current && cb.current(...args));

		window.addEventListener('beforeunload', onUnload);
		window.addEventListener('popstate', onUnload);

		return () => {
			window.removeEventListener('beforeunload', onUnload);
			window.removeEventListener('popstate', onUnload);
		};
	}, []);
};

export default useUnload;
