export const processData = (data) => {
	// console.log(data);

	return data.map((d) => {
		const item = {};

		Object.keys(d).forEach((key) => {
			if (key === 'country') {
				item[key] = d[key];
			} else if (key === 'ISO Country code') {
				item[key] = d[key];
				item.id = d[key];
			} else if (d[key] === '-') {
				item[key] = null;
			} else {
				item[key] = +d[key].replace(/,/g, '');
			}
		});

		return {
			...item,
			radius: 10,
		};
	});
};
