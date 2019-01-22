import { Component } from 'react';

import AppBase from '../AppBase';
import Header from '../Header';

import '../../styles/base.css';
import '../../styles/helpers.css';
import './App.css';

class App extends Component {
	render() {
		const {
			children,
			className,
			title,
			description,
			url,
			imageUrl,
			imageAlt,
			siteName,
		} = this.props;

		return (
			<AppBase
				title={title}
				description={description}
				url={url}
				imageUrl={imageUrl}
				imageAlt={imageAlt}
				siteName={siteName}
			>
				<div className={['app', className || ''].join(' ')}>
					<Header
						// pathname={url}
						menuItems={[
							{
								name: 'Insights',
								url: '/?insight=0',
								isActive: url.indexOf('insight=') > -1,
							},
							{
								name: 'Dashboard',
								url: '/',
								isActive: url.indexOf('insight=') === -1,
							},
						]}
					/>
					{children}
				</div>
			</AppBase>
		);
	}
}

export default App;
