class Auth {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка ${res.status} ${res.statusText}`);
    }
  }

  _request(url, method, body) {
    return fetch(`${this._baseUrl}${url}`, {
      method: `${method}`,
      headers: { ...this._headers, authorization: `Bearer ${localStorage.getItem('token')}` },
      body: body,
      credentials: 'include',
    }).then(this._checkResponse)
  }

  async signUp({ password, email }) {
    const regData = await this._request(`/signup`,
      'POST',
      JSON.stringify({ password: password, email: email }));
    return regData;
  }

  async signIn({ password, email }) {
    const token = await this._request(`/signin`,
      'POST',
      JSON.stringify({ password: password, email: email }));
    return token;
  }

  async checkToken(JWT) {
    console.log(JWT);
    const userData = await this._request(`/users/me`, 'GET');
    console.log('userData:', userData)
    return userData;
  }
}

const auth = new Auth({
  baseUrl: 'https://api.stupid.kubik.nomoredomainsrocks.ru',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default auth;

