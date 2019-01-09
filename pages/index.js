import { Component, Fragment } from 'react';
import Router from 'next/router';
import * as d3 from 'd3';
import { VictoryAxis } from 'victory';

import App from '../components/App';
import Bubbles from '../components/Bubbles';
import BubbleChart from '../components/BubbleChart';
import Tooltip from '../components/Tooltip';
import { indicators, continents } from '../lib/data';
import { processData } from '../lib/dataUtils';
import victoryTheme from '../lib/victoryTheme';

import './index.css';

export class HomePage extends Component {
	state = {
		data: [],
		defaultX: 1,
		defaultY: 2,
		showTooltip: false,
		tooltipX: null,
		tooltipY: null,
		tooltipContent: null,
	};

	async componentDidMount() {
		const data = await d3.csv('./static/data.csv');

		this.setState({
			data: processData(data),
		});
	}

	handleSelectChange = (event, axis) => {
		const { value } = event.target;
		// console.log(this.props);

		if (axis === 'x') {
			Router.push(
				`/?x=${value}&y=${parseInt(
					this.props.router.query.y || this.state.defaultX,
					10,
				)}`,
			);
		} else if (axis === 'y') {
			Router.push(
				`/?x=${parseInt(
					this.props.router.query.x || this.state.defaultY,
					10,
				)}&y=${value}`,
			);
		}
	};

	render() {
		const { router } = this.props;
		const {
			data,
			showTooltip,
			tooltipX,
			tooltipY,
			tooltipContent,
		} = this.state;

		const x =
			typeof router.query.x === 'undefined' ? 0 : parseInt(router.query.x, 10);
		const y =
			typeof router.query.y === 'undefined' ? 1 : parseInt(router.query.y, 10);
		const xName = indicators[x].name;
		const yName = indicators[y].name;
		const xDomain = d3.extent(data, (d) => {
			return d[xName];
		});
		const yDomain = d3.extent(data, (d) => {
			return d[yName];
		});

		return (
			<App title="Home" url={router.pathname}>
				<BubbleChart>
					{(width, height) => {
						return (
							<Fragment>
								<Bubbles
									xName={xName}
									yName={yName}
									data={data}
									width={width}
									height={height}
									bubbleFill={(d) => {
										const continent = continents.find(
											(c) => c.name === d.continent,
										);

										return continent ? continent.colour : null;
									}}
									bubbleOpacity={0.75}
									onBubbleMouseover={(event, d) => {
										// console.log(event, d, i);

										this.setState({
											showTooltip: true,
											tooltipX: event.clientX,
											tooltipY: event.clientY,
											tooltipContent: d.country,
										});
									}}
									onBubbleMouseout={() => {
										// console.log(event, d, i);
										this.setState({
											showTooltip: false,
											tooltipX: null,
											tooltipY: null,
											tooltipContent: null,
										});
									}}
								/>

								{xDomain &&
									xDomain[0] && (
										<VictoryAxis
											label={xName}
											width={width}
											height={height}
											domain={xDomain}
											// style={{
											//   axislabel: {
											//     fontFamily: 'Inter UI',
											//     padding: 35,
											//     fontSize: '12px',
											//     width:width,
											//   },

											//   ticks: {
											//     stroke: 'black',
											//     size: 5,
											//   },

											//   ticklabels: {
											//     fontSize: '12px',
											//     fontFamily: 'Inter UI',
											//   },
											// }}
											theme={victoryTheme}
											offsetY={50}
											fixLabelOverlap
											standalone={false}
										/>
									)}

								{yDomain &&
									yDomain[0] && (
										<VictoryAxis
											dependentAxis
											label={yName}
											width={width}
											height={height}
											domain={yDomain}
											// style={{
											//   axislabel: {
											//     fontFamily: 'Inter UI',
											//     padding: 35,
											//     fontSize: '12px',
											//     width:width,
											//   },

											//   ticks: {
											//     stroke: 'black',
											//     size: 5,
											//   },

											//   ticklabels: {
											//     fontSize: '12px',
											//     fontFamily: 'Inter UI',
											//     angle: -90,
											//     textAnchor: 'middle',
											//   },
											// }}
											theme={victoryTheme}
											offsetX={50}
											fixLabelOverlap
											standalone={false}
										/>
									)}
							</Fragment>
						);
					}}
				</BubbleChart>

				<h2>X</h2>
				<select
					onChange={(event) => this.handleSelectChange(event, 'x')}
					value={x}
				>
					{indicators.map((indicator, i) => {
						return (
							<option
								name={indicator.name}
								value={i}
								key={`x-${indicator.name}`}
							>
								{indicator.name}
							</option>
						);
					})}
				</select>

				<h2>Y</h2>
				<select
					onChange={(event) => this.handleSelectChange(event, 'y')}
					value={y}
				>
					{indicators.map((indicator, i) => {
						return (
							<option
								name={indicator.name}
								value={i}
								key={`y-${indicator.name}`}
							>
								{indicator.name}
							</option>
						);
					})}
				</select>

				{showTooltip && (
					<Tooltip x={tooltipX} y={tooltipY - 30}>
						{tooltipContent}
					</Tooltip>
				)}
			</App>
		);
	}
}

export default HomePage;
