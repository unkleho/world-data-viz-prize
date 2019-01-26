/* eslint func-names: 0 */
// Need to use 'function()' so D3 can access 'this' properly

import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import arrayDiff from 'simple-array-diff';

import { isNumeric } from '../../lib/numberUtils';

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
		isCenter: true, // Overrides values and forces bubbles to go to middle
		isRepel: true,
		bubbleRadius: 4,
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

		const { forceStrength, velocityDecay, center, isRepel } = props;
		this.data = [];

		this.setupForceSimulation({
			forceStrength,
			velocityDecay,
			center,
			isRepel,
		});

		this.bubblesRef = React.createRef();
	}

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
			console.log('data change', this.props.data.length);

			const diffs = arrayDiff(prevProps.data, this.props.data, 'id');

			diffs.added.forEach((item) => {
				this.data.push(item);
			});

			diffs.removed.forEach((item) => {
				const index = this.data.findIndex((d) => d.id === item.id);
				this.data.splice(index, 1);
				// console.log(item, this.data.length, index);
			});

			if (diffs.added.length + diffs.removed.length) {
				console.log(this.data.length, diffs);
			}

			this.restartBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}

		if (
			prevProps.xName !== this.props.xName ||
			prevProps.yName !== this.props.yName
		) {
			console.log('xName/yName change');

			this.restartBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}

		if (
			prevProps.width !== this.props.width ||
			prevProps.height !== this.props.height
		) {
			console.log('width/height change', this.props.width, this.props.height);

			this.restartBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}

		if (prevProps.selectedId !== this.props.selectedId) {
			console.log('selectedId change', this.props.selectedId);
			this.restartBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}

		if (
			prevProps.isCenter !== this.props.isCenter ||
			prevProps.isRepel !== this.props.isRepel
		) {
			console.log('isCenter/isRepel change');

			this.restartBubbles(
				this.props.data,
				this.props.xName,
				this.props.yName,
				this.props.selectedId,
			);
			this.regroupBubbles();
		}
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

		this.data = data || [];
		this.restartBubbles(this.data, xName, yName, selectedId);
		this.regroupBubbles();
	};

	setupForceSimulation = ({
		velocityDecay,
		forceStrength,
		center,
		isRepel,
	}) => {
		const forceManyBody = isRepel
			? d3.forceManyBody().strength(this.charge.bind(this))
			: null;

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
			.force('charge', forceManyBody)
			.on('tick', this.ticked.bind(this))
			.stop();
	};

	/** Set up bubbles data and enter/exit events */
	restartBubbles = (data, xName, yName, selectedId = null) => {
		console.log('restartBubbles', selectedId, this.data.length);

		// Create selection
		const bubbles = this.state.g
			.selectAll('.bubble')
			.data(this.data, (d) => d.id);

		// Exit
		bubbles
			.exit()
			.selectAll('circle')
			.transition()
			.duration(2000)
			// .duration((d) => {
			// 	return 500 + d.country.length * 100;
			// })
			.attr('r', 0)
			.select(function() {
				return this.parentNode;
			})
			.remove();

		// Enter
		const bubblesE = bubbles
			.enter()
			.append('g')
			.classed('bubble', true)
			.append('circle')
			.attr('id', (d) => d.id)
			.attr('r', 0)
			// .attr('cx', (d) => d.x)
			// .attr('cy', (d) => d.y)
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
			.duration(1000)
			// .duration((d) => {
			// 	return 1300 + d.country.length * 100;
			// })
			.attr('r', this.bubbleRadius)
			// .attr('r', (d) => {
			// 	if (!d[xName] || !d[yName]) {
			// 		return 0;
			// 	}

			// 	if (d.id === selectedId) {
			// 		return 11;
			// 	}

			// 	return d.radius;
			// })
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
					.nodes(this.data)
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
		const {
			forceStrength,
			// data,
			xName,
			yName,
			padding,
			isCenter,
			isRepel,
		} = this.props;
		const { width, height } = this.getInnerSize(
			this.props.width,
			this.props.height,
			padding,
		);

		console.log(
			'regroupBubbles',
			this.data.length,
			this.props.width,
			this.props.height,
		);

		// Update scales
		const { xScale, yScale } = this.getScales(width, height);
		this.updateScaleDomains(this.data, xScale, yScale, xName, yName);

		// Update bubbles
		this.state.g.selectAll('.bubble').attr('r', this.bubbleRadius);
		// .attr('r', (d) => {
		// 	if (!d[xName] || !d[yName]) {
		// 		return 0;
		// 	}

		// 	return d.radius;
		// });

		// TODO: this is duplicate code!
		const forceManyBody = isRepel
			? d3.forceManyBody().strength(this.charge.bind(this))
			: null;

		// if (groupByYear) {
		this.simulation
			.force(
				'x',
				d3
					.forceX()
					.strength(forceStrength)
					.x((d) => {
						if (isCenter) {
							return width / 2;
						}

						return xScale(d[xName]);
					}),
			)
			.force(
				'y',
				d3
					.forceY()
					.strength(forceStrength)
					.y((d) => {
						if (isCenter) {
							return height / 2;
						}

						return yScale(d[yName]);
					}),
			)
			.force('charge', forceManyBody);

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
		// console.log('udpateScaleDomains', this.data.length);

		if (xScale && yScale) {
			xScale
				.domain(
					d3.extent(this.data, (d) => {
						return d[xName];
					}),
				)
				.nice();

			yScale
				.domain(
					d3.extent(this.data, (d) => {
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
			if (isNumeric(d.x) && isNumeric(d.y)) {
				return `translate(${d.x}, ${d.y})`;
			}
		});
	}

	charge(d) {
		const radius = this.bubbleRadius(d);
		const modifier = this.props.height > 300 ? 2.7 : 2.0;

		return -this.props.forceStrength * radius ** modifier;
	}

	// --------------------------------------------------------------------------
	// Bubble Appearance
	// --------------------------------------------------------------------------

	/** Set bubble fill colour */
	bubbleRadius = (d) => {
		if (typeof this.props.bubbleRadius === 'function') {
			return this.props.bubbleRadius(d);
		}

		if (typeof this.props.bubbleRadius === 'number') {
			return this.props.bubbleRadius;
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
					transform: `translate3d(${padding.left}px, ${padding.top}px, 0)`,
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
