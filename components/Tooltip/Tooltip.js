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
          top: y,
          left: x,
        }}
			>
				{children}
			</div>
		);
	}
}

export default Tooltip;
