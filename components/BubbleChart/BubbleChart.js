import { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { VictoryAxis } from 'victory';

import Bubbles from '../Bubbles';
import BubbleChartWrapper from '../BubbleChartWrapper';
import victoryTheme from '../../lib/victoryTheme';
import './BubbleChart.css';

class BubbleChart extends Component {
	static propTypes = {
		className: PropTypes.string,
		data: PropTypes.array,
		xName: PropTypes.string,
		yName: PropTypes.string,
		xLabel: PropTypes.string,
		yLabel: PropTypes.string,
		padding: PropTypes.object,
		selectedId: PropTypes.string,
		bubbleFill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
		bubbleOpacity: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
		bubbleSelectedText: PropTypes.func,
		triggerUpdateDimensionsId: PropTypes.string,
		onBubbleMouseover: PropTypes.func,
		onBubbleMouseout: PropTypes.func,
		onBubbleClick: PropTypes.func,
		onBubbleEnter: PropTypes.func,
	};

	static defaultProps = {
		data: [],
	};

	render() {
		const {
			className,
			data,
			xName,
			yName,
			xLabel,
			yLabel,
			padding,
			selectedId,
			bubbleFill,
			bubbleSelectedText,
			triggerUpdateDimensionsId,
			onBubbleMouseover,
			onBubbleMouseout,
			onBubbleClick,
			onBubbleEnter,
		} = this.props;
		const xDomain = d3.extent(data, (d) => {
			return d[xName];
		});
		const yDomain = d3.extent(data, (d) => {
			return d[yName];
		});

		return (
			<div className={['bubble-chart', className || ''].join(' ')}>
				<BubbleChartWrapper
					triggerUpdateDimensionsId={triggerUpdateDimensionsId}
				>
					{(width, height) => {
						// console.log(width, height);

						return (
							<Fragment>
								{xDomain.some((d) => typeof d === 'number') && (
									<VictoryAxis
										animate={{
											duration: 500,
										}}
										label={xLabel}
										width={width}
										height={height}
										domain={xDomain}
										theme={victoryTheme}
										padding={padding}
										offsetY={padding.bottom}
										fixLabelOverlap
										standalone={false}
									/>
								)}

								{yDomain.some((d) => typeof d === 'number') && (
									<VictoryAxis
										dependentAxis
										animate={{
											duration: 500,
										}}
										label={yLabel}
										width={width}
										height={height}
										domain={yDomain}
										// NOTE: Stylelint don't like this, so this file has been ignored
										style={{
											tickLabels: {
												angle: -90,
												textAnchor: 'middle',
												padding: 9,
											},
										}}
										theme={victoryTheme}
										padding={padding}
										offsetX={padding.left}
										fixLabelOverlap
										standalone={false}
									/>
								)}

								<Bubbles
									data={data}
									xName={xName}
									yName={yName}
									width={width}
									height={height}
									padding={padding}
									bubbleFill={bubbleFill}
									bubbleOpacity={0.75}
									bubbleSelectedText={bubbleSelectedText}
									selectedId={selectedId}
									onBubbleMouseover={onBubbleMouseover}
									onBubbleMouseout={onBubbleMouseout}
									onBubbleClick={onBubbleClick}
									onBubbleEnter={onBubbleEnter}
								/>
							</Fragment>
						);
					}}
				</BubbleChartWrapper>
			</div>
		);
	}
}

export default BubbleChart;
