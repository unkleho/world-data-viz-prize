import { Component } from 'react';
import PropTypes from 'prop-types';

import './Tooltip.css';

class Tooltip extends Component {
	static propTypes = {
		x: PropTypes.number,
		y: PropTypes.number,
	};

	render() {
		const { children, x, y } = this.props;

		return (
			<div
				className="tooltip"
				style={{
					position: 'absolute',
					fontSize: 12,
					transform: 'translate(-50%, 0)',
					top: y + 6,
					left: x,
				}}
			>
				{children}
			</div>
		);
	}
}

export default Tooltip;
