/* eslint func-names: 0 */
// Need to use 'function()' so D3 can access 'this' properly

import { Component } from 'react';
import PropTypes from 'prop-types';
import arrayDiff from 'simple-array-diff';

import * as d3 from 'd3';

// Helped by these tutorials
// Modifying a Force Layout
// bl.ocks.org/mbostock/1095795
// The famous d3 Bubble Chart done in a React + d3 Hybrid Approach.
// https://github.com/MrToph/react-d3-bubblechart

const BORDER_WIDTH = 6;
const HIGHLIGHT_DELTA = 50;

export default class Bubbles extends Component {
	static propTypes = {
		data: PropTypes.arrayOf(
			PropTypes.shape({
				radius: PropTypes.number,
			}),
		),
		centre: PropTypes.shape({
			x: PropTypes.number,
			y: PropTypes.number,
		}),
		forceStrength: PropTypes.number,
		xTermCentres: PropTypes.object,
		yTermCentres: PropTypes.object,
		activeXTermGroup: PropTypes.string,
		activeYTermGroup: PropTypes.string,
		isSmall: PropTypes.bool,
		smallRadius: PropTypes.number,
		id: PropTypes.string,
		highlightItemId: PropTypes.string,
		onBubbleClick: PropTypes.func,
	};

	static defaultProps = {
		data: [],
		centre: {
			x: 400,
			y: 400,
		},
	};

	componentDidUpdate(prevProps) {
		// Change in data
		if (
			this.nodes &&
			JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)
		) {
			const diffs = arrayDiff(prevProps.data, this.props.data, 'id');

			diffs.added.forEach((item) => {
				this.nodes.push(item);
			});

			diffs.removed.forEach((item) => {
				const index = diffs.removed.indexOf(item);
				this.nodes.splice(index, 1);
			});

			this.restart();
		}

		// Change in term group or term centres
		if (
			prevProps.activeXTermGroup !== this.props.activeXTermGroup ||
			prevProps.activeYTermGroup !== this.props.activeYTermGroup ||
			prevProps.xTermCentres !== this.props.xTermCentres ||
			prevProps.yTermCentres !== this.props.yTermCentres
		) {
			this.regroupBubbles(
				this.props.activeXTermGroup,
				this.props.activeYTermGroup,
				this.props.xTermCentres,
				this.props.yTermCentres,
			);
			this.restart();
		}

		// Change bubble size
		if (prevProps.isSmall !== this.props.isSmall) {
			this.resizeBubbles(this.props.isSmall, this.props.smallRadius);
		}

		// Resize of window
		if (
			JSON.stringify(prevProps.centre) !== JSON.stringify(this.props.centre)
		) {
			this.regroupBubbles();
		}

		// Change in id
		if (prevProps.id !== this.props.id) {
			this.selectItem(this.props.id);
		}

		if (prevProps.highlightItemId !== this.props.highlightItemId) {
			this.highlightItem(this.props.highlightItemId);
		}
	}

	// Assign <g> ref to state and run init() after
	onRef = (ref) => {
		if (ref) {
			this.setState({ g: d3.select(ref) }, () => {
				this.init();
			});
		}
	};

	init() {
		const { data, centre, forceStrength } = this.props;

		this.nodes = data || [];
		this.circles = this.state.g.selectAll('.node');

		this.simulation = d3
			.forceSimulation(this.nodes)
			.velocityDecay(0.2)
			.force(
				'charge',
				d3.forceManyBody().strength((d) => {
					return -forceStrength * d.radius ** 2.13;
				}),
			)
			.force(
				'x',
				d3
					.forceX()
					// Create a flatter oval force to get more bubbles in widescreen
					.strength(forceStrength - 0.005)
					.x(centre.x),
			)
			.force(
				'y',
				d3
					.forceY()
					.strength(forceStrength)
					.y(centre.y),
			)
			.alphaTarget(1)
			.on('tick', this.ticked);

		this.restart();
	}

	restart() {
		if (this.circles && this.simulation) {
			// Apply the general update pattern to the nodes.
			this.circles = this.circles.data(this.nodes, (d) => {
				// Assign key to data
				return d.id;
			});

			// -----------------------------------------------------------------------
			// Circle Exit
			// -----------------------------------------------------------------------
			this.circles
				.exit()
				.transition()
				.attr('opacity', 0)
				.duration(2000)
				.remove();

			// -----------------------------------------------------------------------
			// Circle Enter
			// -----------------------------------------------------------------------
			this.circles = this.circles
				.enter()
				.append('g')
				.classed('bubble', true)
				.classed('bubble--is-small', this.props.isSmall)
				// -----------------------------------------------------------------------
				// Circle Background
				// -----------------------------------------------------------------------
				.append('circle')
				.classed('bubble__circle-bg', true)
				// .attr('fill', (d) => fillColor(d.type))
				.call((node) => {
					node
						.transition()
						.attr('r', (d) => {
							// Check whether to show large or small bubbles
							const radius = this.props.isSmall
								? this.props.smallRadius
								: d.radius + BORDER_WIDTH;
							return radius;
						})
						.duration(500);
				})
				.on('click', (d) => {
					if (typeof this.props.onBubbleClick === 'function') {
						this.props.onBubbleClick(d);
					}
				})
				.select(function() {
					return this.parentNode;
				})
				.merge(this.circles);

			// Update and restart the simulation.
			// TODO: Move this to own function?
			this.simulation
				.nodes(this.nodes)
				.force(
					'charge',
					d3.forceManyBody().strength((d) => {
						let radius;

						if (this.props.isSmall) {
							radius = this.props.smallRadius;
						} else if (d.id === this.props.id) {
							radius = 1000;
						} else if (d.id === this.props.highlightItemId) {
							radius = d.radius + HIGHLIGHT_DELTA;
						} else {
							/* eslint-disable prefer-destructuring */
							radius = d.radius;
						}

						// console.log('update simulation', radius);
						return -this.props.forceStrength * radius ** 2.13;
					}),
				)
				.alpha(1)
				.restart();
		}
	}

	// Must use outer this scope
	ticked = () => {
		this.circles.attr('transform', (d) => {
			// console.log(d);

			return `translate(${d.x}, ${d.y})`;
		});
	};

	selectItem = (id) => {
		const LARGE_RADIUS = 600;
		const DURATION = 1500;

		d3.selectAll('.bubble__circle-bg').call(transitionRadius, {
			selectedId: id,
			largeRadius: LARGE_RADIUS,
			duration: DURATION,
		});

		this.restart();
		this.regroupBubbles();
	};

	highlightItem = (id) => {
		d3.selectAll('.bubble__circle-bg').call((node) => {
			node
				.transition()
				.attr('r', (d) => {
					if (d.id === id) {
						return d.radius + BORDER_WIDTH + HIGHLIGHT_DELTA;
					}
					return d.radius + BORDER_WIDTH;
				})
				.duration(400);
		});

		this.restart();
	};

	regroupBubbles = (
		activeXTermGroup,
		activeYTermGroup,
		xTermCentres,
		yTermCentres,
	) => {
		const { forceStrength, centre } = this.props;

		if (this.simulation) {
			// X Term has been selected
			if (activeXTermGroup && activeXTermGroup !== 'all') {
				this.simulation
					.force(
						'x',
						d3
							.forceX()
							.strength(forceStrength)
							.x((d) => {
								const term = d[activeXTermGroup];

								return (xTermCentres[term] && xTermCentres[term].x) || 0;
							}),
					)
					.force(
						'y',
						d3
							.forceY()
							.strength(forceStrength)
							.y((d) => {
								let term;

								// Use Y Term if active, otherwise just use X Term (set to middle height normally)
								if (activeYTermGroup !== 'all') {
									term = d[activeYTermGroup];

									return (yTermCentres[term] && yTermCentres[term].y) || 0;
								}

								// Just use good ol' X Term
								term = d[activeXTermGroup];

								return (xTermCentres[term] && xTermCentres[term].y) || 0;
							}),
					);
				this.simulation.alpha(1).restart();
			} else {
				this.simulation
					.force(
						'x',
						d3
							.forceX()
							.strength(() => {
								return forceStrength;
							})
							.x(centre.x),
					)
					.force(
						'y',
						d3
							.forceY()
							.strength((d) => {
								// Ensure selected large bubble is close to middle
								if (d.id === this.props.id) {
									return 0.05;
								}

								return forceStrength;
							})
							.y(centre.y),
					);
			}

			this.simulation.alpha(1).restart();
		}
	};

	resizeBubbles = (isSmall, smallRadius) => {
		d3.selectAll('.bubble').classed('bubble--is-small', isSmall);

		d3.selectAll('.bubble__circle-bg').call((node) => {
			node
				.transition()
				.attr('r', (d) => {
					const radius = isSmall ? smallRadius : d.radius + BORDER_WIDTH;

					return radius;
				})
				.duration(500);
		});
	};

	// shouldComponentUpdate() {
	// 	// we will handle moving the nodes on our own with d3.js
	// 	// make React ignore this component
	// 	return false;
	// }

	render() {
		return <svg ref={this.onRef} className={`bubbles`} height={400} />;
	}
}

function transitionRadius(
	node,
	{ selectedId = null, largeRadius = 600, duration = 1500 },
) {
	node
		.transition()
		.attr('r', (d) => {
			if (d.id === selectedId) {
				return largeRadius;
			}
			return d.radius + BORDER_WIDTH;
		})
		.duration(duration);
}
