class Auth {
  constructor({ baseUrl }) {
    this._baseUrl = baseUrl;
  }

  _request(url, options) {
    return fetch(`${this._baseUrl}${url}`, options).then(this._checkResponse);
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка ${res.status}`);
    }
  }

  async signUp({ password, email }) {
    const regData = await this._request(`signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
      body: JSON.stringify({ password: password, email: email }),
    });
    return regData;
  }

  async signIn({ password, email }) {
    const token = await this._request(`signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: '',
      },
      body: JSON.stringify({ password: password, email: email }),
    });
    return token;
  }

  async checkToken(JWT) {
    const userData = await this._request(`/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
    });
    return userData;
  }
}

const auth = new Auth({
  baseUrl: 'https://api.stupid.kubik.nomoredomainsrocks.ru'
});

export default auth;

