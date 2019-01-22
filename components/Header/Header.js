import Link from '../Link';
import './Header.css';

export default ({ pathname }) => {
	const menuItems = [
		{ name: 'Insights', url: '/?insight=0' },
		{ name: 'Dashboard', url: '/' },
	];

	return (
		<header className="header">
			<h1 className="header__title">Good Gov.</h1>

			{menuItems.map((item) => {
				return (
					<Link to={item.url} key={item.url}>
						{/* eslint-disable jsx-a11y/anchor-is-valid */}
						<a className={pathname === item.url ? 'is-active' : undefined}>
							{item.name}
						</a>
					</Link>
				);
			})}
		</header>
	);
};
