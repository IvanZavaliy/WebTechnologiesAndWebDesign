import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UsersListPage } from './pages/UsersListPage';
import { UserCreatePage } from './pages/UserCreatePage';
import { UserEditPage } from './pages/UserEditPage';
import { UserViewPage } from './pages/UserViewPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app" id="app-root">
        <header className="app-header" id="app-header">
          <div className="app-header__inner">
            <a href="/" className="app-header__logo">
              <span className="app-header__logo-icon">👥</span>
              <span className="app-header__logo-text">UserAdmin</span>
            </a>
            <nav className="app-header__nav">
              <span className="app-header__nav-badge">v1.0</span>
            </nav>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<UsersListPage />} />
            <Route path="/users/create" element={<UserCreatePage />} />
            <Route path="/users/:id" element={<UserViewPage />} />
            <Route path="/users/:id/edit" element={<UserEditPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
