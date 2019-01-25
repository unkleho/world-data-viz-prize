export const isNumeric = (n) => {
	return !Number.isNaN(parseFloat(n)) && Number.isFinite(n);
};
