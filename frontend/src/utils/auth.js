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
    const regData = await this._request(`/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password, email: email }),
    });
    return regData;
  }

  async signIn({ password, email }) {
    const token = await this._request(`/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
  baseUrl: 'https://auth.nomoreparties.co',
});

export default auth;

// {
//   "data": {
//       "_id": "64bfcf5f36ce0c001a421194",
//       "email": "asasas@asd.asd"
//   }
// }

// {
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NGJmY2Y1ZjM2Y2UwYzAwMWE0MjExOTQiLCJpYXQiOjE2OTAyOTIxODh9.es42kcCYNjbeu1iJb75xaSh-Hmt6E4vTTCHiKNIwF_Y"
// }
