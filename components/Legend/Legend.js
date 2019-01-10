import { Component } from 'react';
import PropTypes from 'prop-types';

import './Legend.css';

class Legend extends Component {
	static propTypes = {
		data: PropTypes.array,
	};

	static defaultProps = {
		data: [],
	};

	render() {
		const { data } = this.props;

		return (
			<div className="legend">
				{data.map((d) => {
					return (
						<div className="legend__item" key={d.name}>
							<div
								className="legend__symbol"
								style={{
									backgroundColor: d.colour,
								}}
							/>
							{d.name}
						</div>
					);
				})}
			</div>
		);
	}
}

export default Legend;
