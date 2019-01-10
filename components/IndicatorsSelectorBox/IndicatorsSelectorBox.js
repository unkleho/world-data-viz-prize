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
			</div>
		);
	}
}

export default IndicatorsSelectorBox;
