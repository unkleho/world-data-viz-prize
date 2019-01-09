import React, { Component } from 'react';
// import PropTypes from 'prop-types';

import './BubbleChart.css';

class BubbleChart extends Component {
	// static propTypes = {};

	state = {
		width: null,
		height: null,
	};

	constructor(props) {
		super(props);

		this.bubbleChartRef = React.createRef();
	}

	componentDidMount() {
		window.addEventListener('resize', this.updateDimensions);

		this.updateDimensions();
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions);
	}

	/** Update width and height values of svg wrapper in state */
	updateDimensions = () => {
		this.setState({
			width: this.bubbleChartRef.current.clientWidth,
			height: this.bubbleChartRef.current.clientHeight,
		});
	};

	render() {
		const { children } = this.props;
		const { width, height } = this.state;

		return (
			<svg
				ref={this.bubbleChartRef}
				className="bubble-chart"
				width={'100%'}
				height={500}
			>
				{children(width, height)}
			</svg>
		);
	}
}

export default BubbleChart;
