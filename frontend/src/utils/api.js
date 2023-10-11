class Api {
  constructor({ baseUrl, headers }) {
    this._baseUrl = baseUrl;
    this._headers = headers;
  }

  _checkResponse(res) {
    console.log('_checkResponse = ', res);
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
      // credentials: 'include',
    }).then(this._checkResponse)
  }

  async getUserInfo() {
    const idData = await this._request(`/users/me`, 'GET')
    console.log('idData:', idData)

    return idData
  }

  async getCards() {
    const cardsData = await this._request(`/cards`, 'GET')
    console.log('cardsData:', cardsData)

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
      `/users/me`, 'PATCH',
      JSON.stringify({
        name: name,
        about: about
      }))

    return newProfileData
  }

  async updateAvatar({ avatar }) {
    const newAvatar = await this._request(
      `/users/me/avatar`, 'PATCH',
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

  async deleteCard(cardId, JWT) {
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
