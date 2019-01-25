import { Component } from 'react';
import PropTypes from 'prop-types';

import './Legend.css';

class Legend extends Component {
	static propTypes = {
		className: PropTypes.string,
		title: PropTypes.string,
		data: PropTypes.array,
		onItemClick: PropTypes.func,
	};

	static defaultProps = {
		data: [],
	};

	handleItemClick = (event, d) => {
		if (typeof this.props.onItemClick === 'function') {
			this.props.onItemClick(event, d);
		}
	};

	render() {
		const { className, data, title } = this.props;

		return (
			<div className={['legend', className || ''].join(' ')}>
				<h1>{title}</h1>

				{data.map((d) => {
					return (
						<button
							className={[
								'button',
								'legend__item',
								d.isSelected ? 'legend__item--is-selected' : '',
								d.isSmall ? 'legend__item--is-small' : '',
							].join(' ')}
							onClick={(event) => this.handleItemClick(event, d)}
							key={d.id}
						>
							<div
								className="legend__symbol"
								style={{
									backgroundColor: d.colour,
								}}
							/>
							{d.name}
						</button>
					);
				})}
			</div>
		);
	}
}

export default Legend;
