import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from './App.jsx';
import { createJsonResponse, installFetchMock } from '../test/helpers/network.js';

function renderApp(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
}

describe('App frontend baseline', () => {
  test('redirects unauthenticated protected entry to signin screen', async () => {
    renderApp(['/']);

    expect(await screen.findByText('Вход')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  test('renders registration route for unauthenticated users', async () => {
    renderApp(['/signup']);

    expect(await screen.findByText('Регистрация')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
  });

  test('completes login happy path and renders main screen', async () => {
    installFetchMock((url, options) => {
      const method = options.method ?? 'GET';

      if (url.endsWith('/signin') && method === 'POST') {
        return createJsonResponse({ token: 'jwt-token' });
      }

      if (url.endsWith('/users/me') && method === 'GET') {
        return createJsonResponse({
          _id: 'user-1',
          email: 'tester@example.com',
          name: 'Test User',
          about: 'Frontend baseline',
          avatar: 'https://example.com/avatar.png',
        });
      }

      if (url.endsWith('/cards') && method === 'GET') {
        return createJsonResponse([]);
      }

      return createJsonResponse({}, 404);
    });

    const user = userEvent.setup();

    renderApp(['/signup']);

    await user.click(screen.getAllByRole('link', { name: 'Войти' })[0]);
    expect(await screen.findByText('Вход')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Email'), 'tester@example.com');
    await user.type(screen.getByPlaceholderText('Пароль'), 'password');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('tester@example.com')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('jwt-token');
  });

  test('restores session from localStorage and renders cards/profile data', async () => {
    localStorage.setItem('token', 'persisted-token');

    installFetchMock((url, options) => {
      const method = options.method ?? 'GET';

      if (url.endsWith('/users/me') && method === 'GET') {
        return createJsonResponse({
          _id: 'user-1',
          email: 'restored@example.com',
          name: 'Restored User',
          about: 'Recovered session',
          avatar: 'https://example.com/avatar.png',
        });
      }

      if (url.endsWith('/cards') && method === 'GET') {
        return createJsonResponse([
          {
            _id: 'card-1',
            name: 'Card One',
            link: 'https://example.com/card.png',
            owner: { _id: 'user-1' },
            likes: [],
          },
        ]);
      }

      return createJsonResponse({}, 404);
    });

    renderApp(['/']);

    expect(await screen.findByText('Restored User')).toBeInTheDocument();
    expect(await screen.findByText('Card One')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'редактировать профиль' })
    );

    await waitFor(() => {
      expect(screen.getByText('Редактировать профиль')).toBeInTheDocument();
    });
  });

  test('logout clears local session and returns user to signin screen', async () => {
    localStorage.setItem('token', 'persisted-token');

    installFetchMock((url, options) => {
      const method = options.method ?? 'GET';

      if (url.endsWith('/users/me') && method === 'GET') {
        return createJsonResponse({
          _id: 'user-1',
          email: 'logout@example.com',
          name: 'Logout User',
          about: 'Ready to leave',
          avatar: 'https://example.com/avatar.png',
        });
      }

      if (url.endsWith('/cards') && method === 'GET') {
        return createJsonResponse([]);
      }

      return createJsonResponse({}, 404);
    });

    const user = userEvent.setup();

    renderApp(['/']);

    expect(await screen.findByText('Logout User')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('persisted-token');

    await user.click(screen.getByRole('link', { name: 'Выйти' }));

    expect(await screen.findByText('Вход')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
