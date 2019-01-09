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
		clickedId: null,
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

	/** Use callback ref to store ref in state */
	onBubblesGroupRef = (ref) => {
		this.setState({ g: d3.select(ref) }, () => {
			this.init(this.props.data);
		});
	};

	init = (data) => {
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
			.attr('id', (d) => d.id)
			.attr('r', 0)
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.attr('fill', this.bubbleFill)
			.attr('opacity', this.bubbleOpacity)
			// .attr('stroke', (d) => d3.rgb(fillColor(d.group)).darker())
			// .attr('stroke-width', 2)
			.on('mouseover', this.handleBubbleMouseover) // eslint-disable-line
			.on('mouseout', this.handleBubbleMouseout) // eslint-disable-line
			.on('click', (d, i) => {
				this.handleBubbleClick(d, i);
				// d3.select(this).attr('r', 20);
			}); // eslint-disable-line

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

		const { xScale, yScale } = this.getScales(width, height);

		this.setState(
			{
				xScale,
				yScale,
			},
			() => {
				this.regroupBubbles();
			},
		);
	};

	// setBubbles = () => {

	// }

	/** Return d3 scale functions based on width and height */
	getScales = (width, height) => {
		return {
			xScale: d3.scaleLinear().range([0, width]),
			yScale: d3.scaleLinear().range([height, 0]),
		};
	};

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

	/** Set bubble fill colour */
	bubbleFill = (d) => {
		if (typeof this.props.bubbleFill === 'function') {
			return this.props.bubbleFill(d);
		}

		if (typeof this.props.bubbleFill === 'string') {
			return this.props.bubbleFill;
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

	handleBubbleClick = (d, i) => {
		if (typeof this.props.onBubbleClick === 'function') {
			this.props.onBubbleClick(d3.event, d, i);
		}

		// WIP
		d3.selectAll('.bubble').attr('r', (d) => d.radius);
		d3.selectAll(`[id=${d.id}]`).attr('r', 20);

		this.setState({
			clickedId: d.id,
		});
	};

	// shouldComponentUpdate() {
	// 	// we will handle moving the nodes on our own with d3.js
	// 	// make React ignore this component
	// 	return false;
	// }

	render() {
		const { padding } = this.props;

		return (
			<g
				ref={this.onBubblesGroupRef}
				className="bubbles__group"
				style={{
          transform: `translate(${padding.top}px, ${padding.left}px)`,
        }}
			/>
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
	onBubbleClick: PropTypes.func,
};
