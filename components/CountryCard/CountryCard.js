import { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { numberWithCommas } from '../../lib/dataUtils';
import { countries, indicators, indicatorGroups } from '../../lib/data';
import './CountryCard.css';

class CountryCard extends Component {
	static propTypes = {
		country: PropTypes.object,
		onCountryChange: PropTypes.func,
	};

	static defaultProps = {
		country: {},
	};

	handleCountryChange = (value) => {
		if (typeof this.props.onCountryChange === 'function') {
			this.props.onCountryChange(value);
		}
	};

	render() {
		const { country } = this.props;
		const options = countries.map((c) => ({
			label: c.Country_Name,
			value: c.Country_Code_3,
		}));
		const value = options.find((o) => o.value === country.id);
		// const countryData = Object.keys(country)
		// 	.filter((c) => c !== 'country')
		// 	.filter((c) => c !== 'radius');

		// Build country data, grouping indicators together
		const data = indicatorGroups.map((group) => {
			return {
				name: group,
				indicators: indicators
					.filter((indicator) => indicator.type === group)
					.map((indicator) => {
						return {
							...indicator,
							value: country[indicator.id],
						};
					}),
			};
		});

		// console.log(countryData, data);

		return (
			<article className="country-card">
				<Select
					className="select country-card__title"
					classNamePrefix="select"
					options={options}
					value={value}
					theme={(theme) => ({
						...theme,
						borderRadius: 6,
						colors: {
							...theme.colors,
							primary: '#D10FC9',
						},
					})}
					onChange={this.handleCountryChange}
				/>

				{data.map((group) => {
					return (
						<div className="country-card__group">
							<h2>{group.name}</h2>

							{group.indicators.map((indicator) => {
								if (indicator.value === null) {
									return null;
								}

								return (
									<div className="country-card__indicator">
										<hgroup>
											<h3>{indicator.name}</h3>
										</hgroup>
										<div className="country-card__value">
											{indicator.format === 'dollar' ? '$' : ''}
											{numberWithCommas(indicator.value)}
											{indicator.format === 'percentage' ? '%' : ''}
										</div>
									</div>
								);
							})}
						</div>
					);
				})}
			</article>
		);
	}
}

export default CountryCard;
