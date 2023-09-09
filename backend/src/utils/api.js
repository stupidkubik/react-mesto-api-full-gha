class Api {
  constructor( { baseUrl, headers } ) {
    this._baseUrl = baseUrl
    this._headers = headers
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

  async getUserInfo() {
    const idData = await this._request(
      `/users/me`, {
      method: 'GET',
      headers: this._headers
    })
    return idData
  }

  async getCards() {
    const cardsData = await this._request(
      `/cards`, {
      method: 'GET',
      headers: this._headers
    })
    return cardsData
  }    

  async postCard({ title, link }) {
    const newCardData = await this._request(
      `/cards`, {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({
        name: title,
        link: link
      })
    })
    return newCardData
  } 

  async updateProfile({ name, about }) {
    const newProfileData = await this._request(
      `/users/me`, {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify({
        name: name,
        about: about
      })
    })
    return newProfileData
  }

  async updateAvatar({ avatar }) {
    const newAvatar = await this._request(
      `/users/me/avatar`, {
      method: 'PATCH',
      headers: this._headers,
      body: JSON.stringify({
        avatar: avatar
      })
    })
    return newAvatar
  }

  async changeLikeCardStatus(cardId, isLiked) {
    if (isLiked) {
      const deleteLike = await this._request(
        `/cards/${cardId}/likes`, {
        method: 'DELETE',
        headers: this._headers
      })
      return deleteLike
    } else {
      const putLike = await this._request(
        `/cards/${cardId}/likes`, {
        method: 'PUT',
        headers: this._headers
      })
      return putLike
    }
  }

  async deleteCard(cardId) {
    const cardDelete = await this._request(
      `/cards/${cardId}`, {
      method: 'DELETE',
      headers: this._headers
    })
    return cardDelete
  }
}

const api = new Api( {
  baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-68',
  headers: {
    authorization: 'cad6e116-edab-4c4b-8149-8b724d78ff63',
    'Content-Type': 'application/json' 
  }
})

export default api
