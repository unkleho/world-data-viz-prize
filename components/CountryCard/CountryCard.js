import { Component } from 'react';
import PropTypes from 'prop-types';

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

		return (
			<article className="country-card">
				<h1>{country.country}</h1>

				{Object.keys(country).map((c) => {
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
