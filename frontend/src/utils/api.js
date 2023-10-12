class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка ${res.status}`)
    }
  }

  _request(url, method, body) {
    return fetch(`${this._baseUrl}${url}`, {
      method: `${method}`,
      headers: { ...this._headers, authorization: `Bearer ${localStorage.getItem('token')}` },
      body: body,
    }).then(this._checkResponse)
  }

  async signUp({ password, email }) {
    const regData = await this._request(
      `/signup`,
      'POST',
      JSON.stringify({
        password: password,
        email: email
      }))

    return regData
  }

  async signIn({ password, email }) {
    const token = await this._request(
      `/signin`,
      'POST',
      JSON.stringify({
        password: password,
        email: email
      }))

    return token
  }

  // async checkToken(JWT) {
  //   const userData = await this._request(`/users/me`, 'GET');
  //   return userData
  // }

  async getUserInfo() {
    const idData = await this._request(`/users/me`, 'GET')
    return idData
  }

  async getCards() {
    const cardsData = await this._request(`/cards`, 'GET')
    return cardsData
  }

  async postCard({ title, link }) {
    const newCardData = await this._request(
      `/cards`,
      'POST',
      JSON.stringify({
        name: title,
        link: link
      }))

    return newCardData
  }

  async updateProfile({ name, about }) {
    const newProfileData = await this._request(
      `/users/me`,
      'PATCH',
      JSON.stringify({
        name: name,
        about: about
      }))

    return newProfileData
  }

  async updateAvatar({ avatar }) {
    const newAvatar = await this._request(
      `/users/me/avatar`,
      'PATCH',
      JSON.stringify({
        avatar: avatar
      }))

    return newAvatar
  }

  async changeLikeCardStatus(cardId, isLiked) {
    if (isLiked) {
      const deleteLike = await this._request(`/cards/${cardId}/likes`, 'DELETE')
      return deleteLike
    } else {
      const putLike = await this._request(`/cards/${cardId}/likes`, 'PUT')
      return putLike
    }
  }

  async deleteCard(cardId) {
    const cardDelete = await this._request(`/cards/${cardId}`, 'DELETE')
    return cardDelete
  }
}

const api = new Api({
  baseUrl: 'https://api.stupid.kubik.nomoredomainsrocks.ru',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api;
