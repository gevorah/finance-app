import './Navbar.scss';

export default function Navbar() {
  const date = new Date().toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  });
  return (
    <header className="navbar">
      <div className="navbar-info">
        <h1 className="navbar-info__title">Good evening</h1>
        <p className="navbar-info__date">{date}</p>
      </div>
    </header>
  );
}
