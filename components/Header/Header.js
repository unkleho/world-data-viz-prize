import Link from '../Link';
import { colours } from '../../lib/theme';
import './Header.css';

export default ({ menuItems }) => {
	return (
		<header className="header">
			<h1 className="header__title">
				G<span style={{ color: colours.lightPurple }}>o</span>
				<span style={{ color: colours.blue }}>o</span>d G<span
					style={{ color: colours.green }}
				>
					o
				</span>v<span style={{ color: colours.yellow }}>.</span>
			</h1>

			{menuItems.map((item) => {
				return (
					<Link to={item.url} key={item.url}>
						{/* eslint-disable jsx-a11y/anchor-is-valid */}
						<a className={item.isActive ? 'is-active' : undefined}>
							{item.name}
						</a>
					</Link>
				);
			})}
		</header>
	);
};
