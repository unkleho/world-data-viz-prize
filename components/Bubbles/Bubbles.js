import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Bubbles extends React.Component {
	static defaultProps = {
		data: [],
		center: {
			x: 400,
			y: 200,
		},
		padding: {
			top: 50,
			right: 50,
			bottom: 50,
			left: 50,
		},
		forceStrength: 0.02,
		velocityDecay: 0.2,
		width: 800,
		height: 500,
		xName: null,
		yName: null,
	};

	state = {
		g: null,
		xScale: null,
		yScale: null,
		// xAxis: null,
		// yAxis: null,
		width: null,
		height: null,
	};

	constructor(props) {
		super(props);

		const { forceStrength, velocityDecay, center } = props;

		// Set up force simulation
		this.simulation = d3
			.forceSimulation()
			.velocityDecay(velocityDecay)
			.force(
				'x',
				d3
					.forceX()
					.strength(forceStrength)
					.x(center.x),
			)
			.force(
				'y',
				d3
					.forceY()
					.strength(forceStrength)
					.y(center.y),
			)
			// .force('charge', d3.forceManyBody().strength(this.charge.bind(this)))
			.on('tick', this.ticked.bind(this))
			.stop();

		this.bubblesRef = React.createRef();
	}

	// componentDidMount() {
	// 	window.addEventListener('resize', this.updateDimensions);
	// 	this.updateDimensions();
	// }

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
			console.log('data change');

			this.init(this.props.data);
		}

		if (
			prevProps.xName !== this.props.xName ||
			prevProps.yName !== this.props.yName
		) {
			console.log('xName/yName change');

			this.regroupBubbles();
		}

		if (prevProps.width !== this.props.width) {
			console.log('width change', this.props.width);

			this.regroupBubbles();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions);
	}

	/** Update width and height values of svg wrapper in state */
	// updateDimensions = () => {
	// 	this.setState({
	// 		width: this.bubblesRef.current.clientWidth,
	// 		height: this.bubblesRef.current.clientHeight,
	// 	});
	// };

	/** Use callback ref to store ref in state */
	onBubblesGroupRef = (ref) => {
		this.setState({ g: d3.select(ref) }, () => {
			this.init(this.props.data);
		});
	};

	init(data) {
		const { xName, yName, padding } = this.props;
		const { width, height } = this.getInnerSize(
			this.props.width,
			this.props.height,
			padding,
		);

		// Create selection
		const bubbles = this.state.g.selectAll('.bubble').data(data, (d) => d.id);

		// Exit
		bubbles.exit().remove();

		// Enter
		const bubblesE = bubbles
			.enter()
			.append('circle')
			.classed('bubble', true)
			.attr('r', 0)
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.attr('fill', this.bubbleFill)
			.attr('opacity', this.bubbleOpacity)
			// .attr('stroke', (d) => d3.rgb(fillColor(d.group)).darker())
			// .attr('stroke-width', 2)
			.on('mouseover', this.handleBubbleMouseover) // eslint-disable-line
			.on('mouseout', this.handleBubbleMouseout); // eslint-disable-line

		bubblesE
			.transition()
			.duration(2000)
			.attr('r', (d) => {
				if (!d[xName] || !d[yName]) {
					return 0;
				}

				return d.radius;
			})
			.on('end', () => {
				this.simulation
					.nodes(data)
					.alpha(1)
					.restart();
			});

		// Axis
		console.log(width, height);

		const { xScale, yScale } = this.getScales(width, height);
		// const { xAxis, yAxis } = this.getAxes(xScale, yScale);
		// const xAxis = d3.axisBottom(xScale);
		// const yAxis = d3.axisLeft(yScale);

		this.setState(
			{
				xScale,
				yScale,
				// xAxis,
				// yAxis,
			},
			() => {
				this.regroupBubbles();

				// this.buildAxisLabels({
				// 	width,
				// 	height,
				// 	xAxis,
				// 	yAxis,
				// 	xName,
				// 	yName,
				// });
			},
		);
	}

	/** Return d3 scale functions based on width and height */
	getScales = (width, height) => {
		return {
			xScale: d3.scaleLinear().range([0, width]),
			yScale: d3.scaleLinear().range([height, 0]),
		};
	};

	// getAxes = (xScale, yScale) => {
	// 	return {
	// 		xAxis: d3.axisBottom(xScale),
	// 		yAxis: d3.axisLeft(yScale),
	// 	};
	// };

	/** Work out bubble chart dimensions taking padding into account */
	getInnerSize = (
		width = 800,
		height = 500,
		padding = { top: 0, right: 0, bottom: 0, left: 0 },
	) => {
		return {
			width: width - padding.right - padding.left,
			height: height - padding.top - padding.bottom,
		};
	};

	// buildAxisLabels = ({ width, height, xAxis, yAxis, xName, yName }) => {
	// 	// Add X Label
	// 	this.state.g
	// 		.append('g')
	// 		.attr('class', 'x axis')
	// 		.attr('transform', `translate(0, ${height})`)
	// 		.call(xAxis)
	// 		.append('text')
	// 		.attr('class', 'label')
	// 		.attr('x', width)
	// 		.attr('y', -6)
	// 		.style('text-anchor', 'end')
	// 		.attr('fill', 'black')
	// 		.text(xName);

	// 	// Add Y Label
	// 	this.state.g
	// 		.append('g')
	// 		.attr('class', 'y axis')
	// 		.call(yAxis)
	// 		.append('text')
	// 		.attr('class', 'label')
	// 		.attr('transform', 'rotate(-90)')
	// 		.attr('y', 6)
	// 		.attr('dy', '.71em')
	// 		.style('text-anchor', 'end')
	// 		.attr('fill', 'black')
	// 		.text(yName);
	// };

	// updateAxisLabel = (name, axis = 'x') => {
	// 	if (axis === 'x') {
	// 		this.state.g.selectAll('.x .label').text(name);
	// 	} else if (axis === 'y') {
	// 		this.state.g.selectAll('.y .label').text(name);
	// 	}
	// };

	regroupBubbles = () => {
		const { forceStrength, data, xName, yName, padding } = this.props;
		// const { xAxis, yAxis } = this.state;
		const { width, height } = this.getInnerSize(
			this.props.width,
			this.props.height,
			padding,
		);

		// Update scales
		const { xScale, yScale } = this.getScales(width, height);
		this.updateScaleDomains(data, xScale, yScale, xName, yName);

		// Update axes
		// const { xAxis, yAxis } = this.getAxes(xScale, yScale);
		// this.updateAxes(xAxis, yAxis, xScale, yScale);
		// this.updateAxisLabel(xName, 'x');
		// this.updateAxisLabel(yName, 'y');

		// Update bubbles
		this.state.g.selectAll('.bubble').attr('r', (d) => {
			if (!d[xName] || !d[yName]) {
				return 0;
			}

			return d.radius;
		});

		// if (groupByYear) {
		this.simulation
			.force(
				'x',
				d3
					.forceX()
					.strength(forceStrength)
					.x((d) => xScale(d[xName])),
			)
			.force(
				'y',
				d3
					.forceY()
					.strength(forceStrength)
					.y((d) => yScale(d[yName])),
			);

		this.simulation.alpha(1).restart();
	};

	/**
	 * Update scale domain ranges
	 *
	 * @param {array} data
	 * @param {function} xScale
	 * @param {function} yScale
	 * @param {string} xName
	 * @param {string} yName
	 * @return {void}
	 */
	updateScaleDomains = (data, xScale, yScale, xName, yName) => {
		if (xScale && yScale) {
			xScale
				.domain(
					d3.extent(data, (d) => {
						return d[xName];
					}),
				)
				.nice();

			yScale
				.domain(
					d3.extent(data, (d) => {
						return d[yName];
					}),
				)
				.nice();
		}
	};

	updateAxes = (xAxis, yAxis, xScale, yScale) => {
		if (xAxis && yAxis) {
			d3
				.selectAll('.x')
				.transition()
				.duration(1000)
				.call(xScale)
				.call(xAxis);

			d3
				.selectAll('.y')
				.transition()
				.duration(1000)
				.call(yScale)
				.call(yAxis);
		}
	};

	/** Set bubble fill colour */
	bubbleFill = (d) => {
		if (typeof this.props.bubbleFill === 'function') {
			return this.props.bubbleFill(d);
		}

		if (typeof this.props.bubbleFill === 'string') {
			return this.props.bubbleFill;
		}
	};

	/** Set bubble opacity */
	bubbleOpacity = (d) => {
		if (typeof this.props.bubbleOpacity === 'function') {
			return this.props.bubbleOpacity(d);
		}

		if (typeof this.props.bubbleOpacity === 'number') {
			return this.props.bubbleOpacity;
		}
	};

	handleBubbleMouseover = (d, i) => {
		if (typeof this.props.onBubbleMouseover === 'function') {
			this.props.onBubbleMouseover(d3.event, d, i);
		}
	};

	handleBubbleMouseout = (d, i) => {
		if (typeof this.props.onBubbleMouseout === 'function') {
			this.props.onBubbleMouseout(d3.event, d, i);
		}
	};

	ticked() {
		this.state.g.selectAll('.bubble').attr('transform', (d) => {
			if (typeof d.x === 'number' && typeof d.y === 'number') {
				return `translate(${d.x}, ${d.y})`;
			}
		});
	}

	charge(d) {
		return -this.props.forceStrength * d.radius ** 2.0;
	}

	// shouldComponentUpdate() {
	// 	// we will handle moving the nodes on our own with d3.js
	// 	// make React ignore this component
	// 	return false;
	// }

	render() {
		const { padding } = this.props;

		return (
			// <svg
			// 	ref={this.bubblesRef}
			// 	className="bubbles"
			// 	width={'100%'}
			// 	height={height}
			// >
			<g
				ref={this.onBubblesGroupRef}
				className="bubbles__group"
				style={{
          transform: `translate(${padding.top}px, ${padding.left}px)`,
        }}
			/>
			// </svg>
		);
	}
}

Bubbles.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			radius: PropTypes.number.isRequired,
		}),
	),
	center: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
	}),
	forceStrength: PropTypes.number.isRequired,
	velocityDecay: PropTypes.number,
	width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	height: PropTypes.number,
	padding: PropTypes.shape({
		top: PropTypes.number,
		right: PropTypes.number,
		bottom: PropTypes.number,
		left: PropTypes.number,
	}),
	xName: PropTypes.string,
	yName: PropTypes.string,
	bubbleFill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
	bubbleOpacity: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
	onBubbleMouseover: PropTypes.func,
	onBubbleMouseout: PropTypes.func,
};
