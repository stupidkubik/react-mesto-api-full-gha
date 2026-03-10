import runtimeConfig from '../config/index.js';

class ApiClient {
  constructor({ baseUrl, defaultHeaders = {} }) {
    this._baseUrl = baseUrl;
    this._defaultHeaders = defaultHeaders;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    }

    return Promise.reject(`Ошибка ${res.status}`);
  }

  _buildHeaders({ headers = {}, token } = {}) {
    const authToken = token ?? localStorage.getItem('token');
    const requestHeaders = {
      ...this._defaultHeaders,
      ...headers,
    };

    if (authToken) {
      requestHeaders.authorization = `Bearer ${authToken}`;
    }

    return requestHeaders;
  }

  _request(url, { method = 'GET', body, headers, token } = {}) {
    const options = {
      method,
      headers: this._buildHeaders({ headers, token }),
    };

    if (body !== undefined) {
      options.body = body;
    }

    return fetch(`${this._baseUrl}${url}`, options).then((res) =>
      this._checkResponse(res)
    );
  }

  signUp({ password, email }) {
    return this._request('/signup', {
      method: 'POST',
      body: JSON.stringify({
        password,
        email,
      }),
    });
  }

  signIn({ password, email }) {
    return this._request('/signin', {
      method: 'POST',
      body: JSON.stringify({
        password,
        email,
      }),
    });
  }

  checkToken(token) {
    return this._request('/users/me', { token });
  }

  getUserInfo() {
    return this._request('/users/me');
  }

  getCards() {
    return this._request('/cards');
  }

  postCard({ title, link }) {
    return this._request('/cards', {
      method: 'POST',
      body: JSON.stringify({
        name: title,
        link,
      }),
    });
  }

  updateProfile({ name, about }) {
    return this._request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        name,
        about,
      }),
    });
  }

  updateAvatar({ avatar }) {
    return this._request('/users/me/avatar', {
      method: 'PATCH',
      body: JSON.stringify({
        avatar,
      }),
    });
  }

  changeLikeCardStatus(cardId, isLiked) {
    return this._request(`/cards/${cardId}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT',
    });
  }

  deleteCard(cardId) {
    return this._request(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  }
}

const apiClient = new ApiClient({
  baseUrl: runtimeConfig.apiBaseUrl,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
