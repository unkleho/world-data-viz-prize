import { Component } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { indicatorGroups } from '../../lib/data';
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
		const { className, value, axis, indicators } = this.props;
		const options = indicators.map((indicator, i) => ({
			label: indicator.name,
			value: i,
			type: indicator.type,
		}));

		// console.log(options);

		return (
			<div className={['indicators-selector-box', className || ''].join(' ')}>
				{/* <h2>{title}</h2> */}

				<label>
					{axis}
					<svg
						style={{
							width: '24px',
							height: '36px',
							position: 'relative',
							display: 'block',
						}}
						viewBox="0 0 24 24"
					>
						<path
							fill="#FFFFFF"
							d="M22,12L18,8V11H3V13H18V16L22,12Z"
							transform={axis === 'y' ? 'rotate(-90 12 12)' : ''}
						/>
					</svg>
				</label>

				<div className="indicators-selector-box__select-group">
					<Select
						className="select"
						classNamePrefix="select"
						isSearchable={false}
						// menuIsOpen
						value={options[value]}
						options={indicatorGroups.map((group) => ({
							label: group,
							options: options.filter((o) => o.type === group),
						}))}
						// menuShouldScrollIntoView={true}
						maxMenuHeight={500}
						menuPlacement={'top'}
						theme={(theme) => ({
							...theme,
							borderRadius: 6,
							colors: {
								...theme.colors,
								primary: '#D10FC9',
							},
						})}
						onChange={(event) => this.handleSelectChange(event, axis)}
					/>

					<div className="indicators-selector-box__metadata">
						{indicators[value].notes && (
							<div className="indicators-selector-box__notes">
								{/* <h3>Description</h3> */}
								<p>{indicators[value].notes}</p>
							</div>
						)}

						<div className="indicators-selector-box__source">
							<h3>Source:</h3>
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
			</div>
		);
	}
}

export default IndicatorsSelectorBox;
