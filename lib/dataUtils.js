import { countries } from './data';

/** Rebuild raw CSV data, adding continent and renaming fields. */
export const processData = (data) => {
	// console.log(data);

	return data.map((d) => {
		const item = {};

		Object.keys(d).forEach((key) => {
			if (key === 'country') {
				item[key] = d[key];
			} else if (key === 'ISO Country code') {
				// item[key] = d[key];
				item.id = d[key];

				// Work out continent
				const country = countries.find((c) => {
					return c['Country_Code_3'] === d[key];
				});

				if (country) {
					// console.log(country['Continent_Code']);
					item.continent = country['Continent_Code'];
				} else {
					console.log(d.country, 'has no country code');
				}
			} else if (d[key] === '-') {
				item[key] = null;
			} else {
				item[key] = +d[key].replace(/,/g, '');
			}
		});

		return {
			...item,
			radius: 8,
		};
	});
};

/** Add commas to larger numbers */
export const numberWithCommas = (x) => {
	if (!x) {
		return null;
	}

	const parts = x.toString().split('.');
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

	return parts.join('.');
};

/** Work out a country's indicator ranks */
export const getCountryRanks = (data, id, indicator) => {
	if (typeof id !== 'string') {
		return null;
	}

	// Get country from data
	const country = data.find((c) => c.id === id);

	// Sort data by indicator
	// const sortedData = data.sort((a,b) => {
	// 	if ()
	// })

	console.log(country);

	return {
		population: 1,
	};
};
