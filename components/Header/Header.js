import Link from '../Link';
import './Header.css';

export default ({ menuItems }) => {
	return (
		<header className="header">
			<h1 className="header__title">Good Gov.</h1>

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
