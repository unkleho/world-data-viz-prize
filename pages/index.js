import { Component } from 'react';
import Router from 'next/router';
import * as d3 from 'd3';
import queryString from 'query-string';

import App from '../components/App';
import BubbleChart from '../components/BubbleChart';
import Tooltip from '../components/Tooltip';
import Legend from '../components/Legend';
import CountryCard from '../components/CountryCard';
import IndicatorsSelectorBox from '../components/IndicatorsSelectorBox';
import { indicators, continents } from '../lib/data';
import { processData } from '../lib/dataUtils';

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

	handleBubbleClick = (event, data) => {
		const query = {
			...this.props.router.query,
			country: data.id,
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);
	};

	handleSelectChange = (event, axis) => {
		const { value } = event.target;

		const query = {
			...this.props.router.query,
			...(axis === 'x' ? { x: value } : {}),
			...(axis === 'y' ? { y: value } : {}),
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);
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

		return (
			<App title="Home" url={router.pathname}>
				<h1 className="home-page__title">World Data Viz Prize</h1>

				<Legend data={continents} />

				<BubbleChart
					data={data}
					xName={xName}
					yName={yName}
					padding={{
						top: 32,
						right: 16,
						bottom: 48,
						left: 48,
					}}
					selectedId={router.query.country}
					bubbleFill={(d) => {
						const continent = continents.find((c) => c.name === d.continent);
						return continent ? continent.colour : null;
					}}
					onBubbleMouseover={(event, d) => {
						this.setState({
							showTooltip: true,
							tooltipX: event.clientX,
							tooltipY: event.clientY,
							tooltipContent: d.country,
						});
					}}
					onBubbleMouseout={() => {
						this.setState({
							showTooltip: false,
							tooltipX: null,
							tooltipY: null,
							tooltipContent: null,
						});
					}}
					onBubbleClick={this.handleBubbleClick}
				/>

				<IndicatorsSelectorBox
					title="X"
					indicators={indicators}
					value={x}
					axis="x"
					onChange={this.handleSelectChange}
				/>

				<IndicatorsSelectorBox
					title="Y"
					indicators={indicators}
					value={y}
					axis="y"
					onChange={this.handleSelectChange}
				/>

				{showTooltip && (
					<Tooltip x={tooltipX} y={tooltipY - 30}>
						{tooltipContent}
					</Tooltip>
				)}

				<CountryCard
					country={data.find((d) => d.id === router.query.country)}
				/>
			</App>
		);
	}
}

export default HomePage;
