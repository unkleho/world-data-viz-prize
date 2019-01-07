import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import { fillColor } from '../utils'
// import tooltip from './Tooltip'

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
		groupByYear: true,
		width: 800,
		height: 500,
		xName: null,
		yName: null,
	};

	state = {
		g: null,
		xScale: null,
		yScale: null,
		xAxis: null,
		yAxis: null,
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
	}

	onRef = (ref) => {
		this.setState({ g: d3.select(ref) }, () => {
			this.init(this.props.data);
		});
	};

	init(data) {
		console.log('init()');
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
			// .attr('fill', (d) => fillColor(d.group))
			// .attr('stroke', (d) => d3.rgb(fillColor(d.group)).darker())
			// .attr('stroke-width', 2)
			.on('mouseover', showDetail) // eslint-disable-line
			.on('mouseout', hideDetail); // eslint-disable-line

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
		const xScale = d3.scaleLinear().range([0, width]);
		const yScale = d3.scaleLinear().range([height, 0]);
		const xAxis = d3.axisBottom(xScale);
		const yAxis = d3.axisRight(yScale);

		this.setState(
			{
				xScale,
				yScale,
				xAxis,
				yAxis,
			},
			() => {
				this.regroupBubbles();
				// this.xAxis = d3.axisBottom(this.state.xScale);
				// this.yAxis = d3.axisLeft(this.state.yScale);

				this.buildAxisLabels({
					width,
					height,
					xAxis,
					yAxis,
					xName,
					yName,
				});
			},
		);
	}

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

	buildAxisLabels = ({ width, height, xAxis, yAxis, xName, yName }) => {
		// Add X Label
		this.state.g
			.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0, ${height})`)
			.call(xAxis)
			.append('text')
			.attr('class', 'label')
			.attr('x', width)
			.attr('y', -6)
			.style('text-anchor', 'end')
			.text(xName);

		// Add Y Label
		this.state.g
			.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('class', 'label')
			.attr('transform', 'rotate(-90)')
			.attr('y', 6)
			.attr('dy', '.71em')
			.style('text-anchor', 'end')
			.text(yName);
	};

	regroupBubbles = () => {
		console.log('regroup bubbles');

		const { forceStrength, data, xName, yName } = this.props;
		const { xScale, yScale, xAxis, yAxis } = this.state;

		// Update scales
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

		d3
			.selectAll('.x')
			.transition()
			.duration(1000)
			.call(xAxis);

		d3
			.selectAll('.y')
			.transition()
			.duration(1000)
			.call(yAxis);

		// Update bubbles
		this.state.g.selectAll('.bubble').attr('r', (d) => {
			// console.log(d);

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
		const { width, height, padding } = this.props;

		return (
			<svg className="bubbles" width={width} height={height}>
				<g
					ref={this.onRef}
					className="bubbles__group"
					style={{
						transform: `translate(${padding.top}px, ${padding.left}px)`,
					}}
				/>
			</svg>
		);
	}
}

Bubbles.propTypes = {
	data: PropTypes.arrayOf(
		PropTypes.shape({
			x: PropTypes.number.isRequired,
			id: PropTypes.string.isRequired,
			radius: PropTypes.number.isRequired,
		}),
	),
	center: PropTypes.shape({
		x: PropTypes.number.isRequired,
		y: PropTypes.number.isRequired,
	}),
	forceStrength: PropTypes.number.isRequired,
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

	console.log(d.country, d);

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
