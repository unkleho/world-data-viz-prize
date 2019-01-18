/* eslint func-names: 0 */
// Need to use 'function()' so D3 can access 'this' properly

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
		selectedId: null,
	};

	state = {
		g: null,
		xScale: null,
		yScale: null,
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
			// this.regroupBubbles();
		}

		if (
			prevProps.xName !== this.props.xName ||
			prevProps.yName !== this.props.yName
		) {
			console.log('xName/yName change');

			this.setupBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}

		if (prevProps.width !== this.props.width) {
			console.log('width change', this.props.width);
			console.log('selectedId change', this.props.selectedId);

			this.setupBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}

		if (prevProps.selectedId !== this.props.selectedId) {
			console.log('selectedId change', this.props.selectedId);
			this.setupBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
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

	/** Initialise bubbles */
	init = (data) => {
		const { xName, yName, selectedId } = this.props;

		this.setupBubbles(data, xName, yName, selectedId);
		this.regroupBubbles();
	};

	/** Set up bubbles data and enter/exit events */
	setupBubbles = (data, xName, yName, selectedId = null) => {
		console.log('setupBubbles', selectedId);

		// Create selection
		const bubbles = this.state.g.selectAll('.bubble').data(data, (d) => d.id);

		// Exit
		bubbles.exit().remove();

		// Enter
		const bubblesE = bubbles
			.enter()
			.append('g')
			.classed('bubble', true)
			.append('circle')
			.attr('id', (d) => d.id)
			.attr('r', 0)
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			.attr('fill', this.bubbleFill)
			.attr('opacity', this.bubbleOpacity)
			.call(this.handleBubbleEnter)
			.on('mouseover', this.handleBubbleMouseover) // eslint-disable-line
			.on('mouseout', this.handleBubbleMouseout) // eslint-disable-line
			.on('click', (d, i) => {
				this.handleBubbleClick(d, i);
				// d3.select(this).attr('r', 20);
			})
			.select(function() {
				return this.parentNode;
			})
			.append('text')
			.select(function() {
				return this.parentNode;
			})
			.merge(bubbles); // eslint-disable-line

		bubblesE
			.selectAll('circle')
			.transition()
			.duration(2000)
			.attr('r', (d) => {
				if (!d[xName] || !d[yName]) {
					return 0;
				}

				if (d.id === selectedId) {
					return 11;
					// return 50;
				}

				return d.radius;
			})
			.attr('stroke', (d) => {
				if (d.id === selectedId) {
					return 'white';
				}
			})
			.attr('stroke-width', (d) => {
				if (d.id === selectedId) {
					return 6;
				}
			})
			.on('end', () => {
				this.simulation
					.nodes(data)
					.alpha(1)
					.restart();
			});

		// Update text
		bubblesE
			.selectAll('text')
			.filter((d) => {
				return d.id === selectedId;
			})
			.attr('fill', 'white')
			.attr('text-anchor', 'middle')
			.attr('dy', -20)
			.attr('font-size', 12)
			.text(this.bubbleSelectedText);

		bubblesE
			.selectAll('text')
			.filter((d) => {
				return d.id !== selectedId;
			})
			.text(null);

		// Sort bubbles, moving selected one to top
		bubblesE.sort((a) => {
			if (a.id === selectedId) {
				return 1;
			}

			return -1;
		});
	};

	regroupBubbles = () => {
		const { forceStrength, data, xName, yName, padding } = this.props;
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

	// --------------------------------------------------------------------------
	// Scale Functions
	// --------------------------------------------------------------------------

	/** Return d3 scale functions based on width and height */
	getScales = (width, height) => {
		return {
			xScale: d3.scaleLinear().range([0, width]),
			yScale: d3.scaleLinear().range([height, 0]),
		};
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

	// --------------------------------------------------------------------------
	// Utility Functions
	// --------------------------------------------------------------------------

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

	// --------------------------------------------------------------------------
	// Force Functions
	// --------------------------------------------------------------------------

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

	// --------------------------------------------------------------------------
	// Bubble Appearance
	// --------------------------------------------------------------------------

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

	/** Set selected bubble's text */
	bubbleSelectedText = (d) => {
		if (typeof this.props.bubbleSelectedText === 'function') {
			return this.props.bubbleSelectedText(d);
		}
	};

	// --------------------------------------------------------------------------
	// Event Handlers
	// --------------------------------------------------------------------------

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
	};

	/** Advanced D3 manipulation available in this callback */
	handleBubbleEnter = (node) => {
		if (typeof this.props.onBubbleEnter === 'function') {
			this.props.onBubbleEnter(node);
		}
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
					transform: `translate(${padding.left}px, ${padding.top}px)`,
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
	bubbleSelectedText: PropTypes.func,
	onBubbleMouseover: PropTypes.func,
	onBubbleMouseout: PropTypes.func,
	onBubbleClick: PropTypes.func,
	onBubbleEnter: PropTypes.func,
};
