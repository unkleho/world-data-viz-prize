import { Component } from 'react';
import PropTypes from 'prop-types';

import './IndicatorsSelectorBox.css';

class IndicatorsSelectorBox extends Component {
	static propTypes = {
		className: PropTypes.string,
		title: PropTypes.string.isRequired,
		indicators: PropTypes.array,
		axis: PropTypes.string,
		value: PropTypes.number,
		onChange: PropTypes.func,
	};

	handleSelectChange = (event, axis) => {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(event, axis);
		}
	};

	render() {
		const { className, title, value, axis, indicators } = this.props;

		// console.log(indicators, value);

		return (
			<div className={['indicators-selector-box', className || ''].join(' ')}>
				<h2>{title}</h2>

				<select
					onChange={(event) => this.handleSelectChange(event, axis)}
					value={value}
				>
					{indicators.map((indicator, i) => {
						return (
							<option
								name={indicator.name}
								value={i}
								key={`indicators-selector-box-${indicator.name}`}
							>
								{indicator.name}
							</option>
						);
					})}
				</select>

				{indicators[value].notes && (
					<div className="indicators-selector-box__notes">
						<h3>Description</h3>
						<p>{indicators[value].notes}</p>
					</div>
				)}

				<div className="indicators-selector-box__source">
					<h3>Source</h3>
					<p>{indicators[value].source}</p>
				</div>

				<div className="indicators-selector-box__year">
					<h3>Year</h3>
					<p>{indicators[value]['data year']}</p>
				</div>

				<div className="indicators-selector-box__url">
					<h3>URL</h3>
					<p>{indicators[value].URL}</p>
				</div>
			</div>
		);
	}
}

export default IndicatorsSelectorBox;
