import { Component } from 'react';
import PropTypes from 'prop-types';
// import SwipeableViews from 'react-swipeable-views';

import Link from '../Link';
import './InsightCard.css';

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

		const scroller = scrollama();
		scroller
			.setup({
				// debug: true,
				step: '.insight-card__step',
				offset: 0.8,
				progress: true,
				threshold: 30,
				container: '.insight-card',
				// graphic: '.scroll__graphic',
			})
			.onStepProgress(this.handleStepProgress);
		// .onContainerEnter(this.handleScrollContainerEnter)
		// .onContainerExit(this.handleScrollContainerExit)
		// .onStepEnter(this.handleScrollStepEnter)
		// .onStepExit(this.handleScrollStepExit);

		// scroller.resize();
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

		return (
			<div className="insight-card">
				{insights.map((insight, i) => {
					return (
						<div
							className={[
								'insight-card__step',
								i === index ? 'insight-card__step--is-selected' : '',
							].join(' ')}
							key={i}
						>
							{i === insights.length - 1 ? (
								<p>
									Project by{' '}
									<strong>
										<a
											href="https://www.twitter.com/unkleho"
											target="_blank"
											rel="noopener noreferrer"
										>
											Kaho Cheung
										</a>
									</strong>{' '}
									and{' '}
									<strong>
										{' '}
										<a
											href="https://www.twitter.com/sunanda_creagh"
											target="_blank"
											rel="noopener noreferrer"
										>
											Sunanda Creagh
										</a>
									</strong>.
									<br />
									<br />
									<Link to="/">
										{/* eslint-disable */}
										<a className="cta-button">Explore this Dataset</a>
										{/* eslint-enable */}
									</Link>
								</p>
							) : (
								<p dangerouslySetInnerHTML={{ __html: insight.content }} />
							)}
						</div>
					);
				})}

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
