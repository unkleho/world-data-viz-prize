import { Component } from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';

import './InsightCard.css';

class InsightCard extends Component {
	static propTypes = {
		insights: PropTypes.array,
		index: PropTypes.number,
	};

	static defaultProps = {
		insights: [],
		index: null,
	};

	handleChangeIndex = (...args) => {
		if (typeof this.props.onChangeIndex === 'function') {
			this.props.onChangeIndex(...args);
		}
	};

	render() {
		const { insights, index } = this.props;

		return (
			<div className="insight-card">
				<SwipeableViews
					enableMouseEvents
					resistance
					index={index}
					onChangeIndex={this.handleChangeIndex}
				>
					{insights.map((insight) => {
						return (
							<div>
								{insight.content} {index}
							</div>
						);
					})}
				</SwipeableViews>{' '}
			</div>
		);
	}
}

export default InsightCard;
