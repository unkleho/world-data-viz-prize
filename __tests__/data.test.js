// import * as d3 from 'd3';
// import fetch from 'isomorphic-fetch';
// import { resolve } from 'path';

import { getCountryRanks } from '../lib/dataUtils';

// global.fetch = fetch;

describe('Data', () => {
	it('get countrys indicator ranks', async () => {
		// console.log(resolve('../static/data.csv'));

		// const data = await d3.csv(resolve('../static/data.csv'));
		const data = [
			{
				id: 'AUS',
				population: 20000000,
			},
			{
				id: 'NZE',
				population: 5000000,
			},
			{
				id: 'USA',
				population: 300000000,
			},
		];
		const countryRanks = getCountryRanks(data, 'AUS', 'population');

		expect(countryRanks['population']).toEqual(2);
	});
});
