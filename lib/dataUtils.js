import { countries, continents, smallCountries } from './data';

/** Rebuild raw CSV data, adding continent and renaming fields. */
export const processData = (data) => {
	// console.log(data);

	return data.map((d) => {
		const item = {};

		Object.keys(d).forEach((key) => {
			if (key === 'country') {
				item[key] = d[key];
			} else if (key === 'ISO Country code') {
				const countryId = d[key];
				item.id = countryId;

				// Work out country
				const country = countries.find((c) => {
					return c['Country_Code_3'] === countryId;
				});

				if (country) {
					// Add continent info
					const continent = continents.find(
						(c) => c.name === country['Continent_Code'],
					);

					item.continent = country['Continent_Code'];
					item.continentId = continent.id;

					// Add small country flag
					item.isSmallCountry =
						smallCountries.findIndex((s) => s === countryId) > -1;
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

export const precision = (a) => {
	let e = 1;
	while (Math.round(a * e) / e !== a) e *= 10;
	return Math.log(e) / Math.LN10;
};

/** Work out a country's indicator ranks */
export const getCountryRank = (data, id, indicator, isLowerBetter = false) => {
	if (typeof id !== 'string') {
		return null;
	}

	// Get country from data
	// const country = data.find((c) => c.id === id);

	// Filter out and sort data by indicator
	const sortedData = data.filter((d) => d[indicator] !== null).sort((a, b) => {
		return b[indicator] - a[indicator];
	});

	const total = sortedData.length;

	let rank = sortedData.findIndex((s) => s.id === id);
	rank = isLowerBetter ? total - rank : rank + 1;

	// console.log(country, sortedData, rank);

	return {
		rank,
		total: sortedData.length,
	};
};
