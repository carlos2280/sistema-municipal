export const checkCookieExists = (name: string): boolean => {
	return document.cookie
		.split(";")
		.some((cookie) => cookie.trim().startsWith(`${name}=`));
};
