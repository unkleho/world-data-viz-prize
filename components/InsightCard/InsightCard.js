import { Component } from 'react';
import PropTypes from 'prop-types';
// import dynamic from 'next/dynamic';
// import SwipeableViews from 'react-swipeable-views';
// import { Scrollama, Step } from 'react-scrollama';

import './InsightCard.css';

// const Scrollama = dynamic(() => import('react-scrollama/lib/Scrollama'), {
// 	ssr: false,
// });
// const Step = dynamic(() => import('react-scrollama/lib/Step'), {
// 	ssr: false,
// });

// let Scrollama;
// let Step;

// if (process.browser) {
// 	Scrollama = require('react-scrollama').Scrollama;
// 	Step = require('react-scrollama').Step;
// }

class InsightCard extends Component {
	static propTypes = {
		insights: PropTypes.array,
		index: PropTypes.number,
		onStepProgress: PropTypes.func,
	};

	static defaultProps = {
		insights: [],
		index: null,
	};

	componentDidMount() {
		// Loading module that require "window" to be defined
		/* eslint-disable global-require */
		require('intersection-observer');
		const scrollama = require('scrollama');
		/* eslint-enable global-require */

		// const scrollThreshold = 0.33;
		const scroller = scrollama();
		scroller
			.setup({
				// debug: true,
				step: '.insight-card__step',
				offset: 0.8,
				progress: true,
				threshold: 10,
				container: '.insight-card',
				// graphic: '.scroll__graphic',
			})
			.onStepProgress(this.handleStepProgress);
		// .onContainerEnter(this.handleScrollContainerEnter)
		// .onContainerExit(this.handleScrollContainerExit)
		// .onStepEnter(this.handleScrollStepEnter)
		// .onStepExit(this.handleScrollStepExit);

		scroller.resize();
	}

	handleChangeIndex = (...args) => {
		if (typeof this.props.onChangeIndex === 'function') {
			this.props.onChangeIndex(...args);
		}
	};

	handleStepProgress = (response) => {
		if (typeof this.props.onStepProgress === 'function') {
			this.props.onStepProgress(response);
		}
		// console.log(response);
	};

	handleScrollStepEnter = (index) => {
		console.log('enter', index);
	};

	handleScrollStepExit = (index) => {
		console.log('exit', index);
	};

	handleScrollContainerEnter = (index) => {
		console.log('container enter', index);
	};

	handleScrollContainerExit = (index) => {
		console.log('container exit', index);
	};

	render() {
		const { insights, index } = this.props;

		console.log(index, process.browser);

		return (
			<div className="insight-card">
				{insights.map((insight, i) => {
					return (
						<div className="insight-card__step" key={i}>
							<p>{insight.content}</p>
						</div>
					);
				})}

				{/* <Scrollama>
					{insights.map((insight, i) => {
						return <Step data={i}>{insight.content}</Step>;
						// return null;
					})}
				</Scrollama> */}
				{/* <SwipeableViews
					enableMouseEvents
					resistance
					index={index}
					onChangeIndex={this.handleChangeIndex}
				>
					{insights.map((insight, i) => {
						return (
							<div key={i}>
								<p>{insight.content}</p>
							</div>
						);
					})}
				</SwipeableViews>{' '} */}
			</div>
		);
	}
}

export default InsightCard;
