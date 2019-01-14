import { getCountryRank } from '../lib/dataUtils';

const data = [
	{
		id: 'USA',
		population: 300000000,
		'GINI index': 40,
	},
	{
		id: 'CHN',
		population: 1000000000,
		'GINI index': 50,
	},
	{
		id: 'AUS',
		population: 20000000,
		'GINI index': 30,
	},
	{
		id: 'NZE',
		population: 5000000,
		'GINI index': 20,
	},
	{
		id: 'ZZZ',
		population: null,
		'GINI index': 60,
	},
];

describe('Data', () => {
	it('get countrys indicator ranks', async () => {
		const countryRanks = getCountryRank(data, 'AUS', 'population');

		expect(countryRanks.rank).toEqual(3);
		expect(countryRanks.total).toEqual(4);
	});

	it('get NZE indicator ranks, lower is better', async () => {
		const countryRanks = getCountryRank(data, 'NZE', 'GINI index', true);

		expect(countryRanks.rank).toEqual(1);
		expect(countryRanks.total).toEqual(5);
	});

	it('get CHN indicator ranks, lower is better', async () => {
		const countryRanks = getCountryRank(data, 'ZZZ', 'GINI index', true);

		expect(countryRanks.rank).toEqual(5);
		expect(countryRanks.total).toEqual(5);
	});
});
