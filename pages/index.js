import { Component } from 'react';
import Router from 'next/router';
import * as d3 from 'd3';

import App from '../components/App';
import Bubbles from '../components/Bubbles';
import { indicators } from '../lib/data';
import { processData } from '../lib/dataUtils';

import './index.css';

export class HomePage extends Component {
	state = {
		data: [],
		defaultX: 1,
		defaultY: 2,
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
		const { data } = this.state;

		// console.log(data);
		// console.log(this.props);

		const x =
			typeof router.query.x === 'undefined' ? 0 : parseInt(router.query.x, 10);
		const y =
			typeof router.query.y === 'undefined' ? 1 : parseInt(router.query.y, 10);
		const xName = indicators[x].name;
		const yName = indicators[y].name;

		// console.log(xName, yName);

		return (
			<App title="Home" url={router.pathname}>
				<Bubbles
					xName={xName}
					yName={yName}
					data={data}
					width={800}
					height={500}
					onBubbleMouseover={(event, d, i) => {
						console.log(event, d, i);
					}}
					onBubbleMouseout={(event, d, i) => {
						console.log(event, d, i);
					}}
				/>

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
			</App>
		);
	}
}

export default HomePage;
