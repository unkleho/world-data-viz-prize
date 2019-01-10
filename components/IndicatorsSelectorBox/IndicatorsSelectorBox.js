import { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

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

	handleSelectChange = (option, axis) => {
		if (typeof this.props.onChange === 'function') {
			this.props.onChange(option, axis);
		}
	};

	render() {
		const { className, title, value, axis, indicators } = this.props;
		const options = indicators.map((indicator, i) => ({
			label: indicator.name,
			value: i,
			type: indicator.type,
		}));

		// console.log(options);

		return (
			<div className={['indicators-selector-box', className || ''].join(' ')}>
				<h2>{title}</h2>

				<Select
					className="indicators-selector-box__select"
					isSearchable={false}
					value={options[value]}
					options={[
						'info',
						'life',
						'economy',
						'government',
						'health',
						'education',
					].map((group) => ({
						label: group,
						options: options.filter((o) => o.type === group),
					}))}
					onChange={(event) => this.handleSelectChange(event, axis)}
					// menuShouldScrollIntoView={true}
					maxMenuHeight={200}
				/>

				<div className="indicators-selector-box__metadata">
					{indicators[value].notes && (
						<div className="indicators-selector-box__notes">
							{/* <h3>Description</h3> */}
							<p>{indicators[value].notes}</p>
						</div>
					)}

					<div className="indicators-selector-box__source">
						<h3>Source</h3>
						<p>
							<a
								href={indicators[value].URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								{indicators[value].source}
							</a>{' '}
							({indicators[value]['data year']})
						</p>
					</div>
				</div>
			</div>
		);
	}
}

export default IndicatorsSelectorBox;
