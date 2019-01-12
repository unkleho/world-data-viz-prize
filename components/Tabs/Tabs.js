import { Component } from 'react';
import PropTypes from 'prop-types';

import './Tabs.css';

class Tabs extends Component {
	static propTypes = {
		className: PropTypes.string,
		labels: PropTypes.array,
		value: PropTypes.number,
		onClick: PropTypes.func,
	};

	handleClick = (event, i) => {
		if (typeof this.props.onClick === 'function') {
			this.props.onClick(event, i);
		}
	};

	render() {
		const { className, labels, value } = this.props;

		return (
			<div className={['tabs', className || ''].join(' ')}>
				{labels.map((label, i) => {
					return (
						<div
							className={[
								'tabs__tab',
								value === i ? 'tabs__tab--is-selected' : '',
							].join(' ')}
							onClick={(event) => this.handleClick(event, i)}
							key={label}
						>
							{label}
						</div>
					);
				})}
			</div>
		);
	}
}

export default Tabs;
