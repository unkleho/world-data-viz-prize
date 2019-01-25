import { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CountUp from 'react-countup';
import Trend from 'react-trend';

import { precision, getCountryRank } from '../../lib/dataUtils';
import { indicators, indicatorGroups } from '../../lib/data';
import { colours } from '../../lib/theme';
import './CountryCard.css';

class CountryCard extends Component {
	static propTypes = {
		country: PropTypes.object,
		countries: PropTypes.array,
		data: PropTypes.array,
		onCountryChange: PropTypes.func,
		onIndicatorClick: PropTypes.func,
	};

	static defaultProps = {
		country: {},
		countries: [],
		data: [],
	};

	handleCountryChange = (value) => {
		if (typeof this.props.onCountryChange === 'function') {
			this.props.onCountryChange(value);
		}
	};

	handleIndicatorClick = (indicator) => {
		if (typeof this.props.onIndicatorClick === 'function') {
			this.props.onIndicatorClick(indicator);
		}
	};

	render() {
		const { country, countries, data } = this.props;
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
		const countryData = indicatorGroups.map((group) => {
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
					menuPlacement="auto"
					isClearable={true}
					onChange={this.handleCountryChange}
				/>

				{/* {!country.id && (
					<p>
						Select a country by using the drop down above, or clicking on a
						circle.
					</p>
				)} */}

				{country.id &&
					countryData.map((group) => {
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

									const { rank, total } = getCountryRank(
										data,
										country.id,
										indicator.id,
										indicator.isLowerBetter,
									);

									// console.log(buildTrendData(data, indicator.id));

									return (
										<div
											className="country-card__indicator"
											key={indicator.name}
										>
											<button
												className="button country-card__indicator-icon-button"
												onClick={() => this.handleIndicatorClick(indicator)}
											>
												<svg
													style={{
														width: '24px',
														height: '24px',
														position: 'relative',
														display: 'inline-block',
													}}
													viewBox="0 0 24 24"
												>
													<path
														fill="#FFFFFF"
														d="M22,12L18,8V11H3V13H18V16L22,12Z"
														// transform={axis === 'y' ? 'rotate(-90 12 12)' : ''}
													/>
												</svg>
											</button>

											{/* <button>x</button>
											<button>y</button> */}
											<hgroup>
												<h3>
													<button
														className="country-card__indicator-button"
														onClick={() => this.handleIndicatorClick(indicator)}
														title="Select this indicator as X axis on chart."
													>
														{indicator.name}
													</button>
												</h3>
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

												<div
													className="country-card__indicator-trend"
													title={`${rank} of ${total}`}
												>
													<Trend
														smooth
														autoDraw
														autoDrawDuration={2000}
														data={buildTrendData(data, indicator.id)}
														gradient={[colours.darkPurple, colours.lightPurple]}
														strokeWidth={6}
														radius={10}
													/>

													<div
														className="country-card__indicator-trend__line"
														style={{
															left: `${(total - rank) / total * 100}%`,
														}}
													/>
												</div>
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

function buildTrendData(data, indicatorId) {
	return data
		.map((d) => {
			return d[indicatorId];
		})
		.filter((d) => d !== null)
		.sort((a, b) => {
			if (a < b) {
				return -1;
			}

			if (a > b) {
				return 1;
			}

			return 0;
		});
}
