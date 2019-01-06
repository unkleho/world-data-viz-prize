import { Component } from 'react';
// import PropTypes from 'prop-types';
import * as d3 from 'd3';

import { indicators } from '../../lib/data';
import './Chart2.css';

class Chart2 extends Component {
	// static propTypes = {};

	static defaultProps = {
		currentXIndicator: 4,
		currentYIndicator: 5,
	};

	init = async () => {
		const svg = d3.select('.chart');
		const width = +svg.attr('width');
		const height = +svg.attr('height');
		this.color = d3.scaleOrdinal(d3.schemeCategory10);

		console.log({ width, height });

		this.xScale = d3.scaleLinear().range([0, width]);
		this.yScale = d3.scaleLinear().range([height, 0]);

		// Load data
		const rawData = await d3.csv('./static/data.csv');

		const { xName, yName } = this.getXYNames();

		// Setup axis scale functions
		this.updateScales(rawData, xName, yName);

		// Prepare data for forceSimulation
		this.nodes = this.buildData(rawData, xName, yName);

		// const a = { id: 'a' };
		// const b = { id: 'b' };
		// const c = { indicator: 'c' };
		// this.nodes = [a, b, c];
		// this.nodes = this.data;

		this.simulation = d3
			.forceSimulation(this.nodes)
			// .force('charge', d3.forceManyBody().strength(-100))
			// .force('x', d3.forceX())
			// .force('y', d3.forceY())
			// .alphaTarget(1)
			.on('tick', this.ticked);

		const g = svg
			.append('g')
			.attr('transform', `translate(${width / 2},${height / 2})`);

		this.node = g
			.append('g')
			.attr('stroke', '#fff')
			.attr('stroke-width', 1.5)
			.selectAll('.node');

		this.restart();

		// d3.interval(
		// 	() => {
		// 		this.nodes.pop(); // Remove c.
		// 		this.restart();
		// 	},
		// 	2000,
		// 	d3.now(),
		// );

		// d3.interval(
		// 	() => {
		// 		this.nodes.push(c); // Re-add c.
		// 		this.restart();
		// 	},
		// 	2000,
		// 	d3.now() + 1000,
		// );
	};

	getXYNames = () => {
		const xName = indicators[this.props.currentXIndicator].name;
		const yName = indicators[this.props.currentYIndicator].name;

		return {
			xName,
			yName,
		};
	};

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

	restart = () => {
		const { xName, yName } = this.getXYNames();

		// Apply the general update pattern to the nodes.
		this.node = this.node.data(this.nodes, (d) => {
			return d.indicator;
		});
		this.node.exit().remove();
		this.node = this.node
			.enter()
			.append('circle')
			.attr('cx', (d) => {
				return this.xScale(d[xName]);
			})
			.attr('cy', (d) => {
				return this.yScale(d[yName]);
			})
			.attr('fill', (d) => {
				return this.color(d.id);
			})
			.attr('r', 8)
			.merge(this.node);

		// Update and restart the simulation.
		this.simulation.nodes(this.nodes);
		this.simulation.alpha(1).restart();
	};

	ticked = () => {
		this.node
			.attr('cx', (d) => {
				return d.x;
			})
			.attr('cy', (d) => {
				return d.y;
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
		// const {} = this.props;

		return <svg ref={this.onRef} className="chart" width="960" height="500" />;
	}
}

export default Chart2;
