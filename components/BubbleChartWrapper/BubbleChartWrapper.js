import React, { Component } from 'react';
// import PropTypes from 'prop-types';

import './BubbleChartWrapper.css';

class BubbleChartWrapper extends Component {
	// static propTypes = {};

	state = {
		width: null,
		height: null,
	};

	constructor(props) {
		super(props);

		this.bubbleChartWrapperRef = React.createRef();
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
			width: this.bubbleChartWrapperRef.current.clientWidth,
			height: this.bubbleChartWrapperRef.current.clientHeight,
		});
	};

	render() {
		const { children } = this.props;
		const { width, height } = this.state;

		return (
			<svg
				ref={this.bubbleChartWrapperRef}
				className="bubble-chart-wrapper"
				width={'100%'}
				height={500}
			>
				{children(width, height)}
			</svg>
		);
	}
}

export default BubbleChartWrapper;
