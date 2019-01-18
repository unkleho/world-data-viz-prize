import { Component } from 'react';
import Router from 'next/router';
import * as d3 from 'd3';
import queryString from 'query-string';
// import SwipeableViews from 'react-swipeable-views';

import App from '../components/App';
import BubbleChart from '../components/BubbleChart';
import Tooltip from '../components/Tooltip';
import Legend from '../components/Legend';
import Tabs from '../components/Tabs';
import CountryCard from '../components/CountryCard';
// import { Link } from '../routes';
import IndicatorsSelectorBox from '../components/IndicatorsSelectorBox';
import { indicators, continents, countries } from '../lib/data';
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
		const rawData = await d3.csv('./static/data.csv');
		const data = processData(rawData);

		this.setState({
			data,
			// Filter out countries not in data
			countries: countries.filter((country) =>
				data.some((d) => {
					return d.id === country.Country_Code_3;
				}),
			),
		});
	}

	handleBubbleClick = (event, data) => {
		const query = {
			...this.props.router.query,
			country: data.id,
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);

		// Hide tooltip, otherwise both tooltips show
		this.setState({
			showTooltip: false,
		});
	};

	handleSelectChange = (option, axis) => {
		const { value } = option;

		const query = {
			...this.props.router.query,
			...(axis === 'x' ? { x: value } : {}),
			...(axis === 'y' ? { y: value } : {}),
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);
	};

	handleTabClick = (event, i) => {
		const query = {
			...this.props.router.query,
			tab: i,
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);
	};

	handleCountryChange = (value) => {
		const query = {
			...this.props.router.query,
			country: value.value,
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);
	};

	handleIndicatorClick = (indicator) => {
		const x = indicators.findIndex((ind) => ind.id === indicator.id);

		const query = {
			...this.props.router.query,
			x,
		};

		const url = `/?${queryString.stringify(query)}`;

		Router.push(url);
	};

	render() {
		const { router } = this.props;
		const { query, pathname } = router;
		const {
			data,
			showTooltip,
			tooltipX,
			tooltipY,
			tooltipContent,
		} = this.state;

		const x = typeof query.x === 'undefined' ? 0 : parseInt(query.x, 10);
		const y = typeof query.y === 'undefined' ? 1 : parseInt(query.y, 10);
		const tab = typeof query.tab === 'undefined' ? 0 : parseInt(query.tab, 10);
		const xName = indicators[x].id;
		const yName = indicators[y].id;
		const xLabel = indicators[x].name;
		const yLabel = indicators[y].name;
		// const flippedURL = `/?${queryString.stringify({
		// 	...query,
		// 	x: y,
		// 	y: x,
		// })}`;

		return (
			<App className="home-page__app" title="Home" url={pathname}>
				<main className="home-page">
					<h1 className="home-page__title">
						What Makes a &lsquo;Good&rsquo; Government?
					</h1>

					<p className="home-page__intro">
						Explore this dataset of 195 countries and over 30 indicators.
					</p>

					<br />

					<Legend data={continents} />

					<BubbleChart
						className="home-page__chart"
						data={data}
						xName={xName}
						yName={yName}
						xLabel={xLabel}
						yLabel={yLabel}
						padding={{
							top: 32,
							right: 16,
							bottom: 48,
							left: 48,
						}}
						selectedId={query.country}
						bubbleFill={(d) => {
							const continent = continents.find((c) => c.name === d.continent);
							return continent ? continent.colour : null;
						}}
						bubbleSelectedText={(d) => {
							return d.country;
						}}
						onBubbleMouseover={(event, d) => {
							// console.log(event);

							// Only show tooltip if not currently selected
							if (d.id !== query.country) {
								this.setState({
									showTooltip: true,
									tooltipX: event.clientX,
									tooltipY: event.clientY,
									tooltipContent: d.country,
								});
							}
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

					<Tabs
						className="home-page__tabs"
						labels={[
							'Indicators',
							`Country${query.country ? ` (${query.country})` : ''}`,
						]}
						value={tab}
						onClick={this.handleTabClick}
					/>

					{tab === 0 && (
						<div>
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
						</div>
					)}

					{tab === 1 && (
						<CountryCard
							country={data.find((d) => d.id === query.country)}
							countries={this.state.countries}
							data={data}
							onCountryChange={this.handleCountryChange}
							onIndicatorClick={this.handleIndicatorClick}
						/>
					)}

					{/* eslint-disable jsx-a11y/anchor-is-valid */}
					{/* <Link route={flippedURL}>
					<a>
					<svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
					<path
					fill="#000000"
					d="M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z"
					/>
					</svg>
					</a>
				</Link> */}
					{/* eslint-enable jsx-a11y/anchor-is-valid */}

					{showTooltip && (
						<Tooltip x={tooltipX} y={tooltipY - 30}>
							{tooltipContent}
						</Tooltip>
					)}
				</main>

				<aside className="home-page__aside">
					<h1>Country</h1>

					<CountryCard
						country={data.find((d) => d.id === query.country)}
						countries={this.state.countries}
						data={data}
						onCountryChange={this.handleCountryChange}
						onIndicatorClick={this.handleIndicatorClick}
					/>
				</aside>
			</App>
		);
	}
}

export default HomePage;
