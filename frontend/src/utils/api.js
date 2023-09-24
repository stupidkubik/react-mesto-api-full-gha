class Api {
  constructor({ baseUrl }) {
    this._baseUrl = baseUrl
  }

  _request(url, options) {
    return fetch(`${this._baseUrl}${url}`, options).then(this._checkResponse)
  }

  _checkResponse(res) {
    if (res.ok) {
      return res.json();
    } else {
      return Promise.reject(`Ошибка ${res.status}`)
    }
  }

  async getUserInfo(JWT) {
    console.log(JWT);
    const idData = await this._request(
      `/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      }
    })
    console.log('idData:', idData)

    return idData
  }

  async getCards(JWT) {
    console.log(JWT);

    const cardsData = await this._request(
      `/cards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      }
    })
    console.log('cardsData:', cardsData)

    return cardsData
  }

  async postCard({ title, link }, JWT) {
    console.log(JWT);

    const newCardData = await this._request(
      `/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        name: title,
        link: link
      })
    })
    return newCardData
  }

  async updateProfile({ name, about }, JWT) {
    const newProfileData = await this._request(
      `/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        name: name,
        about: about
      })
    })
    return newProfileData
  }

  async updateAvatar({ avatar }, JWT) {
    const newAvatar = await this._request(
      `/users/me/avatar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({
        avatar: avatar
      })
    })
    return newAvatar
  }

  async changeLikeCardStatus(cardId, isLiked, JWT) {
    if (isLiked) {
      const deleteLike = await this._request(
        `/cards/${cardId}/likes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JWT}`,
        }
      })
      return deleteLike
    } else {
      const putLike = await this._request(
        `/cards/${cardId}/likes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${JWT}`,
        }
      })
      return putLike
    }
  }

  async deleteCard(cardId, JWT) {
    const cardDelete = await this._request(
      `/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      }
    })
    return cardDelete
  }
}

const api = new Api({
  baseUrl: 'https://api.stupid.kubik.nomoredomainsrocks.ru'
})

export default api;
