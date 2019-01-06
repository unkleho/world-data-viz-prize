import { Component } from 'react';
import Router from 'next/router';

import App from '../components/App';
import Chart from '../components/Chart';
// import Chart2 from '../components/Chart2';
import { indicators } from '../lib/data';

import './index.css';

export class HomePage extends Component {
	static defaultProps = {
		router: {
			query: {
				x: 1,
				y: 2,
			},
		},
	};

	handleSelectChange = (event, axis) => {
		const { value } = event.target;

		if (axis === 'x') {
			Router.push(`/?x=${value}&y=${parseInt(this.props.router.query.y, 10)}`);
		} else if (axis === 'y') {
			Router.push(`/?x=${parseInt(this.props.router.query.x, 10)}&y=${value}`);
		}
	};

	render() {
		const { router } = this.props;

		const currentXIndicator = parseInt(router.query.x, 10);
		const currentYIndicator = parseInt(router.query.y, 10);

		return (
			<App title="Home" url={router.pathname}>
				<Chart
					currentXIndicator={currentXIndicator}
					currentYIndicator={currentYIndicator}
				/>
				{/* <Chart2
					currentXIndicator={currentXIndicator}
					currentYIndicator={currentYIndicator}
				/> */}

				<h2>X</h2>
				<select
					onChange={(event) => this.handleSelectChange(event, 'x')}
					value={currentXIndicator}
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
					value={currentYIndicator}
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
