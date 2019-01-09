import { Component } from 'react';
// import PropTypes from 'prop-types';

import './InfoCard.css';

class InfoCard extends Component {
	// static propTypes = {};

	static defaultProps = {
		country: {},
	};

	render() {
		const { country } = this.props;
		// console.log(this.props);

		return (
			<article className="info-card">
				<h1>{country.country}</h1>
			</article>
		);
	}
}

export default InfoCard;
