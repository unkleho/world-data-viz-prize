import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import { fillColor } from '../utils'
// import tooltip from './Tooltip'

export default class Bubbles extends React.Component {
	static defaultProps = {
		center: {
			x: 400,
			y: 200,
		},
		forceStrength: 0.02,
		yearCenters: {
			2008: { x: 300, y: 300 },
			2009: { x: 300, y: 300 },
			2010: { x: 300, y: 300 },
		},
		groupByYear: true,
		width: 800,
		height: 500,
		xName: null,
		yName: null,
	};

	constructor(props) {
		super(props);
		const { forceStrength, center } = props;
		this.simulation = d3
			.forceSimulation()
			.velocityDecay(0.2)
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
	}

	state = {
		g: null,
	};

	componentDidUpdate(prevProps) {
		if (JSON.stringify(prevProps.data) !== JSON.stringify(this.props.data)) {
			console.log('data change');

			this.renderBubbles(this.props.data);
			this.regroupBubbles();
		}
		if (
			prevProps.xName !== this.props.xName ||
			prevProps.yName !== this.props.yName
		) {
			console.log('xName/yName change');

			this.regroupBubbles();
		}
	}

	// shouldComponentUpdate() {
	// 	// we will handle moving the nodes on our own with d3.js
	// 	// make React ignore this component
	// 	return false;
	// }

	onRef = (ref) => {
		this.setState({ g: d3.select(ref) }, () => {
			this.renderBubbles(this.props.data);
			this.regroupBubbles();
		});
	};

	ticked() {
		this.state.g.selectAll('.bubble').attr('transform', (d) => {
			if (typeof d.x === 'number' && typeof d.y === 'number') {
				return `translate(${d.x}, ${d.y})`;
			}
		});
		// .attr('cx', (d) => d.x)
		// .attr('cy', (d) => d.y);
	}

	charge(d) {
		return -this.props.forceStrength * d.radius ** 2.0;
	}

	regroupBubbles = () => {
		console.log('regroup bubbles');

		const { forceStrength, width, height, data, xName, yName } = this.props;

		const xScale = d3.scaleLinear().range([0, width]);
		xScale
			.domain(
				d3.extent(data, (d) => {
					return d[xName];
				}),
			)
			.nice();

		const yScale = d3.scaleLinear().range([height, 0]);
		yScale
			.domain(
				d3.extent(data, (d) => {
					return d[yName];
				}),
			)
			.nice();

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

	renderBubbles(data) {
		console.log('render bubbles');

		this.bubbles = this.state.g.selectAll('.bubble').data(data, (d) => d.id);

		// Exit
		this.bubbles.exit().remove();

		// Enter
		const bubblesE = this.bubbles
			.enter()
			.append('circle')
			.classed('bubble', true)
			.attr('r', 0)
			.attr('cx', (d) => d.x)
			.attr('cy', (d) => d.y)
			// .attr('fill', (d) => fillColor(d.group))
			// .attr('stroke', (d) => d3.rgb(fillColor(d.group)).darker())
			.attr('stroke-width', 2)
			.on('mouseover', showDetail) // eslint-disable-line
			.on('mouseout', hideDetail); // eslint-disable-line

		bubblesE
			.transition()
			.duration(2000)
			.attr('r', (d) => d.radius)
			.on('end', () => {
				this.simulation
					.nodes(data)
					.alpha(1)
					.restart();
			});
	}

	render() {
		return <g ref={this.onRef} className="bubbles" />;
	}
}

Bubbles.propTypes = {
	center: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
	}),
	forceStrength: PropTypes.number.isRequired,
	groupByYear: PropTypes.bool.isRequired,
	yearCenters: PropTypes.objectOf(
		PropTypes.shape({
			x: PropTypes.number.isRequired,
			y: PropTypes.number.isRequired,
		}).isRequired,
	).isRequired,
	data: PropTypes.arrayOf(
		PropTypes.shape({
			x: PropTypes.number.isRequired,
			id: PropTypes.string.isRequired,
			radius: PropTypes.number.isRequired,
			value: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
		}),
	),
	width: PropTypes.number,
	height: PropTypes.number,
	xName: PropTypes.string,
	yName: PropTypes.string,
};

/*
* Function called on mouseover to display the
* details of a bubble in the tooltip.
*/
export function showDetail(d) {
	// change outline to indicate hover state.
	d3.select(this).attr('stroke', 'black');

	console.log(d.country);

	// const content =
	// 	`<span class="name">Title: </span><span class="value">${
	// 		d.name
	// 	}</span><br/>` +
	// 	`<span class="name">Amount: </span><span class="value">$${
	// 		d.value
	// 	}</span><br/>` +
	// 	`<span class="name">Year: </span><span class="value">${d.year}</span>`;

	// tooltip.showTooltip(content, d3.event);
}

/*
* Hides tooltip
*/
export function hideDetail() {
	// reset outline
	// d3.select(this).attr('stroke', d3.rgb(fillColor(d.group)).darker());
	// tooltip.hideTooltip();
}
