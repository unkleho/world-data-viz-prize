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
		padding: PropTypes.object,
		selectedId: PropTypes.string,
		bubbleFill: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
		bubbleOpacity: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
		onBubbleMouseover: PropTypes.func,
		onBubbleMouseout: PropTypes.func,
		onBubbleClick: PropTypes.func,
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
			padding,
			selectedId,
			bubbleFill,
			onBubbleMouseover,
			onBubbleMouseout,
			onBubbleClick,
		} = this.props;
		const xDomain = d3.extent(data, (d) => {
			return d[xName];
		});
		const yDomain = d3.extent(data, (d) => {
			return d[yName];
		});

		return (
			<div className={['bubble-chart', className || ''].join(' ')}>
				<BubbleChartWrapper>
					{(width, height) => {
						console.log(width, height);

						return (
							<Fragment>
								<Bubbles
									data={data}
									xName={xName}
									yName={yName}
									width={width}
									height={height}
									padding={padding}
									bubbleFill={bubbleFill}
									bubbleOpacity={0.75}
									selectedId={selectedId}
									onBubbleMouseover={onBubbleMouseover}
									onBubbleMouseout={onBubbleMouseout}
									onBubbleClick={onBubbleClick}
								/>

								{xDomain &&
									xDomain[0] && (
										<VictoryAxis
											label={xName}
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

								{yDomain &&
									yDomain[0] && (
										<VictoryAxis
											dependentAxis
											label={yName}
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
							</Fragment>
						);
					}}
				</BubbleChartWrapper>
			</div>
		);
	}
}

export default BubbleChart;
