import { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import { scaleLinear, scaleOrdinal } from 'd3-scale';
// import { svg } from 'd3-svg';

import { indicators } from '../../lib/data';

import './Chart.css';

class Chart extends Component {
	static propTypes = {
		currentXIndicator: PropTypes.number,
		currentYIndicator: PropTypes.number,
	};

	state = {
		indicators,
		rawData: [],
		margin: {
			top: 20,
			right: 20,
			bottom: 30,
			left: 40,
		},
		radius: 6,
	};

	static defaultProps = {
		currentXIndicator: 4,
		currentYIndicator: 5,
	};

	componentDidUpdate(prevProps) {
		if (prevProps.currentXIndicator !== this.props.currentXIndicator) {
			const { margin } = this.state;
			const width = 860 - margin.left - margin.right;
			const height = 500 - margin.top - margin.bottom;

			const { xName, yName } = this.getXYNames();

			const data = this.buildData(this.state.rawData, xName, yName);

			// Setup axis scale functions
			this.updateScales(data, xName, yName);

			// const dotData = this.buildDotData(data, xName, yName, radius);

			this.restart(data);
			this.buildAxisLabels({
				width,
				height,
				xAxis: this.xAxis,
				yAxis: this.yAxis,
				xName,
				yName,
			});
		}
	}

	async init() {
		const { margin } = this.state;
		const width = 860 - margin.left - margin.right;
		const height = 500 - margin.top - margin.bottom;
		// const padding = 1; // separation between nodes

		this.xScale = d3.scaleLinear().range([0, width]);
		this.yScale = d3.scaleLinear().range([height, 0]);
		// const color = d3.scaleOrdinal;
		this.xAxis = d3.axisBottom(this.xScale);
		this.yAxis = d3.axisLeft(this.yScale);

		// Create SVG container
		this.svg = d3
			.select('.chart')
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`);

		// Load data
		const rawData = await d3.csv('./static/data.csv');

		this.setState({
			rawData,
		});

		// Work out axis indicator names
		const { xName, yName } = this.getXYNames();

		// Prepare data for forceSimulation
		this.data = this.buildData(rawData, xName, yName);

		// Build force simulation
		this.simulation = d3
			.forceSimulation(this.data)
			.force('charge', d3.forceManyBody().strength(-100))
			.force('x', d3.forceX())
			.force('y', d3.forceY())
			.alphaTarget(1)
			.on('tick', this.ticked);

		// Setup axis scale functions
		this.updateScales(this.data, xName, yName);

		this.node = this.svg.selectAll('.dot');

		this.restart();

		// this.simulation.on('tick', this.ticked);

		this.buildAxisLabels({
			width,
			height,
			xAxis: this.xAxis,
			yAxis: this.yAxis,
			xName,
			yName,
		});
		// this.buildLegend({ width, color });
	}

	ticked = () => {
		this.node
			.attr('cx', (d) => {
				return d.x;
			})
			.attr('cy', (d) => {
				return d.y;
			});
	};

	getXYNames = () => {
		const xName = this.state.indicators[this.props.currentXIndicator].name;
		const yName = this.state.indicators[this.props.currentYIndicator].name;

		return {
			xName,
			yName,
		};
	};

	restart() {
		const { xName, yName } = this.getXYNames();

		// console.log(dotData.length, data.length);

		// Apply the general update pattern
		this.node = this.node.data(this.data, (d) => {
			// console.log(d['ISO Country code']);

			return d['ISO Country code'];
		});

		this.node
			.exit()
			.call((d) => {
				console.log(d);
			})
			.remove();

		this.node
			.enter()
			.append('circle')
			.attr('class', 'dot')
			.attr('r', this.state.radius)
			.attr('cx', (d) => {
				return this.xScale(d[xName]);
			})
			.attr('cy', (d) => {
				return this.yScale(d[yName]);
			})
			.on('mouseover', (d) => {
				console.log(d.indicator);
			})
			.merge(this.node);
		// .style('fill', function(d) {
		// 	return d.color;
		// })

		this.simulation.nodes(this.data).restart();
		// this.simulation.restart();
	}

	buildData = (rawData, xName, yName) => {
		return rawData
			.filter((d) => d[xName] !== '-')
			.filter((d) => d[yName] !== '-')
			.map((d) => {
				return {
					...d,
					[xName]: +d[xName].replace(/,/g, ''),
					[yName]: +d[yName].replace(/,/g, ''),
					x: this.xScale(+d[xName].replace(/,/g, '')),
					y: this.yScale(+d[yName].replace(/,/g, '')),
					radius: this.state.radius,
				};
			});
	};

	buildDotData = (data, xName, yName, radius) => {
		return data.map((d) => {
			return {
				...d,
				x: this.xScale(d[xName]),
				y: this.yScale(d[yName]),
				radius,
			};
		});
	};

	updateScales = (data, xName, yName) => {
		this.xScale
			.domain(
				d3.extent(data, (d) => {
					return d[xName];
				}),
			)
			.nice();
		this.yScale
			.domain(
				d3.extent(data, (d) => {
					return d[yName];
				}),
			)
			.nice();
	};

	buildAxisLabels = ({ width, height, xAxis, yAxis, xName, yName }) => {
		// Add X Label
		this.svg
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
		this.svg
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

	buildLegend = ({ width, color }) => {
		const legend = this.svg
			.selectAll('.legend')
			// .data(color.domain())
			.enter()
			.append('g')
			.attr('class', 'legend')
			.attr('transform', (d, i) => {
				return `translate(0, ${i * 20})`;
			});

		legend
			.append('rect')
			.attr('x', width - 18)
			.attr('width', 18)
			.attr('height', 18)
			.style('fill', color);

		legend
			.append('text')
			.attr('x', width - 24)
			.attr('y', 9)
			.attr('dy', '.35em')
			.style('text-anchor', 'end')
			.text((d) => {
				return d;
			});
	};

	onRef = (ref) => {
		if (ref) {
			this.setState({ g: d3.select(ref) }, () => {
				this.init();
			});
		}
	};

	render() {
		const { width, height } = this.props;

		return (
			<svg ref={this.onRef} className="chart" width={width} height={height} />
		);
	}
}

export default Chart;
