import { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { countries } from '../../lib/data';
import './CountryCard.css';

class CountryCard extends Component {
	static propTypes = {
		country: PropTypes.object,
	};

	static defaultProps = {
		country: {},
	};

	render() {
		const { country } = this.props;
		const options = countries.map((c) => ({
			label: c.Country_Name,
			value: c.Country_Code_3,
		}));
		const value = options.find((o) => o.value === country.id);
		console.log(value);

		return (
			<article className="country-card">
				{/* <h1 className="country-card__title">{country.country}</h1> */}

				<Select
					className="heading-select"
					classNamePrefix="heading-select"
					options={options}
					value={value}
				/>

				{Object.keys(country)
					.filter((c) => c !== 'country')
					.filter((c) => c !== 'radius')
					.map((c) => {
						return (
							<div className="country-card__indicator">
								<h3>{c}</h3>
								<p>{country[c]}</p>
							</div>
						);
					})}
			</article>
		);
	}
}

export default CountryCard;
