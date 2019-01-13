import { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CountUp from 'react-countup';

import { precision } from '../../lib/dataUtils';
import { indicators, indicatorGroups } from '../../lib/data';
import './CountryCard.css';

class CountryCard extends Component {
	static propTypes = {
		country: PropTypes.object,
		onCountryChange: PropTypes.func,
	};

	static defaultProps = {
		country: {},
		countries: [],
	};

	handleCountryChange = (value) => {
		if (typeof this.props.onCountryChange === 'function') {
			this.props.onCountryChange(value);
		}
	};

	render() {
		const { country, countries } = this.props;
		const options = countries.map((c) => ({
			label: c.Country_Name,
			value: c.Country_Code_3,
		}));
		const value = options.find((o) => o.value === country.id);
		// const countryData = Object.keys(country)
		// 	.filter((c) => c !== 'country')
		// 	.filter((c) => c !== 'radius');
		// console.log(country);

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

				{!country.id && (
					<p>
						Select a country by using the drop down above, or clicking on a
						circle.
					</p>
				)}

				{country.id &&
					data.map((group) => {
						// console.log(group);

						if (group.indicators.length === 0) {
							return null;
						}

						return (
							<div className="country-card__group" key={group.name}>
								<h2>{group.name}</h2>

								{group.indicators.map((indicator) => {
									if (indicator.value === null) {
										return null;
									}

									return (
										<div
											className="country-card__indicator"
											key={indicator.name}
										>
											{/* <button>x</button>
											<button>y</button> */}
											<hgroup>
												<h3>{indicator.name}</h3>
												{indicator.notes && <p>{indicator.notes}</p>}
											</hgroup>
											<div className="country-card__value">
												{indicator.format === 'dollar' ? '$' : ''}
												<CountUp
													end={indicator.value}
													duration={0.5}
													separator={','}
													decimals={precision(indicator.value)}
												/>
												{/* {numberWithCommas(indicator.value)} */}
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
