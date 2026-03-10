# Frontend Current Runtime Inventory

updated: 2026-03-10
phase: Phase 4.1 baseline snapshot

## Goal

Зафиксировать текущее поведение frontend runtime перед миграцией с CRA и декомпозицией UI-слоев.

## Current Stack

- `React 18`
- `react-router` / `react-router-dom` v6
- `react-scripts@5`
- BEM-style CSS structure in `frontend/src/blocks`
- runtime token storage in `localStorage`

## Entry and Shell

Точка входа:

- `frontend/src/index.js`

Текущее поведение:

- приложение монтируется через `ReactDOM.createRoot`
- `BrowserRouter` оборачивает весь app tree
- `React.StrictMode` уже включен

Главный orchestration component:

- `frontend/src/components/App.jsx`

Сейчас `App.jsx` одновременно отвечает за:

- auth bootstrap
- route composition
- global popup state
- initial data loading
- mutations profile/cards
- provider wiring

## Route Tree

Текущие маршруты определены в `App.jsx`.

### `/`

Protected route через `ProtectedRoute`.

Runtime behavior:

- требует `isLoggedIn === true`
- при доступе рендерит `Main`
- при отсутствии авторизации делает redirect на `/signin`

### `/signin`

Публичный route для `Login`.

Runtime behavior:

- отображает форму логина
- использует `userLogin?.email` для prefill email после успешной регистрации или token check

### `/signup`

Публичный route для `Register`.

Runtime behavior:

- отображает форму регистрации
- открытие/закрытие info tooltip влияет на reset формы через `useEffect`

### `*`

Wildcard route делает redirect на `/`.

Следствие:

- неавторизованный пользователь при неизвестном пути уходит на `/`, а затем через `ProtectedRoute` на `/signin`

## Providers and Shared Runtime State

`App.jsx` монтирует три context provider:

- `AppContext`
  - `isLoading`
  - `closeAllPopups`
- `LoginUserContext`
  - `isLoggedIn`
  - `Paths`
  - `userLogin`
- `CurrentUserContext`
  - `currentUser`

Это создает сильную связанность, потому что auth state, route constants и login identity находятся в одном context boundary.

## Auth and Session Bootstrap

### Initial bootstrap

На первом mount:

- читается `localStorage.getItem('token')`
- если token есть, вызывается `checkToken(jwt)`
- если token нет, выполняется `navigate('/signup')`

Это важная legacy-особенность:

- default unauthenticated landing route сейчас `/signup`, а не `/signin`

### `checkToken(jwt)`

Использует `auth.checkToken(jwt)` и при успехе:

- пишет ответ в `userLogin`
- ставит `isLoggedIn = true`
- делает `navigate('/')`

Побочный эффект:

- `handleSubmit` вызывает `closeAllPopups()` даже для token bootstrap flow

### Login flow

`handleLogin`:

- вызывает `api.signIn`
- при наличии `res.token`:
  - пишет token в `localStorage`
  - ставит `isLoggedIn = true`
  - вызывает `checkToken(res.token)`

Особенность:

- login flow делает chained auth bootstrap через второй запрос `/users/me`

### Registration flow

`handleRegistration`:

- вызывает `api.signUp`
- при успехе:
  - пишет response в `userLogin`
  - подготавливает success tooltip state
  - делает `navigate('/signin')`
- при ошибке:
  - подготавливает fail tooltip state
- в `finally`:
  - выключает loading
  - открывает info tooltip

Следствие:

- tooltip показывается и после успешной, и после неуспешной регистрации

### Logout flow

`handleExit`:

- удаляет `token` из `localStorage`
- ставит `isLoggedIn = false`
- очищает `userLogin`
- делает `navigate('/signin')`

## Initial Data Loading

Когда `isLoggedIn` становится `true`, отдельный `useEffect` запускает:

- `api.getCards()`
- `api.getUserInfo()`

через `Promise.all`.

При успехе:

- `currentUser` заполняется данными `/users/me`
- `cards` заполняется массивом `/cards`

При ошибке:

- ошибка только логируется в `console.error`
- user-facing error state отсутствует

## API Layer and Network Usage

Сетевой слой разделен между двумя файлами:

- `frontend/src/utils/api.js`
- `frontend/src/utils/auth.js`

### `api.js`

Используется для:

- `POST /signup`
- `POST /signin`
- `GET /users/me`
- `GET /cards`
- `PATCH /users/me`
- `PATCH /users/me/avatar`
- `POST /cards`
- `PUT/DELETE /cards/:cardId/likes`
- `DELETE /cards/:cardId`

Особенности:

- production API host захардкожен
- `authorization` header всегда собирается из `localStorage`
- `_request` принимает `url`, `method`, `body`, а не options object
- error shape редуцируется до строки вида `Ошибка <status>`

### `auth.js`

Используется только для:

- `GET /users/me` в `checkToken`

Особенности:

- дублирует `baseUrl`
- отдельно реализует response handling
- использует переданный JWT вместо чтения из `localStorage`

Итог:

- auth и domain API уже сейчас живут в двух несовместимых request abstractions

## Main UI Areas

### Main

`Main.jsx` рендерит:

- `Header`
- profile block
- cards list
- `Footer`

Компонент получает сверху почти всю interactive orchestration:

- profile edit open
- avatar edit open
- add card open
- image open
- delete flow
- like flow
- logout flow

### Header

`Header.jsx` содержит собственную mobile menu state-машину:

- `mobileView`
- `menuIsOpen`

Особенности:

- mobile/desktop режим определяется через `window.innerWidth` и resize listener
- logout оформлен как `Link` с `onClick={handleExit}`
- route intent и UI menu state смешаны в одном компоненте

## Popup Orchestration

Popup state полностью централизован в `App.jsx`.

Отдельные флаги:

- `openPopupProfile`
- `openPopupAdd`
- `openPopupAvatar`
- `openPopupDelete`
- `openPopupImage`
- `openPopupInfo`

Сопутствующие данные:

- `tooltipInfo`
- `selectedCard`
- `deletedCardId`

### Profile popup

- открывается через `handleEditProfileClick`
- submit вызывает `api.updateProfile`

### Avatar popup

- открывается через `handleEditAvatarClick`
- submit вызывает `api.updateAvatar`

### Add card popup

- открывается через `handleAddPlaceClick`
- submit вызывает `api.postCard`
- новая карточка вставляется в начало массива

### Delete confirmation popup

Текущее поведение двухшаговое:

- первый вызов `handleCardDelete(evt, cardData)` только открывает popup и запоминает `deletedCardId`
- второй вызов уже из submit popup выполняет `api.deleteCard`

Это runtime quirk, который нельзя случайно сломать при decomposition.

### Image popup

- открывается из `handleCardClick(evt)`
- картинка читается из `evt.target.src` и `evt.target.alt`, а не из card model напрямую

### Info tooltip

- используется только в registration flow
- success/error state задается через `tooltipInfo`

## Card Mutations

### Like toggle

`handleCardLike(card)`:

- вычисляет `isLiked` через `card.likes.some((i) => i._id === currentUser._id)`
- если already liked, вызывает `DELETE /likes`
- иначе вызывает `PUT /likes`
- обновляет карточку replace-by-id через `setCards(state => ...)`

### Delete card

После подтверждения:

- вызывает `DELETE /cards/:cardId`
- локально удаляет карточку через filter по `deletedCardId`

## Loading and Error Semantics

Глобальный `isLoading` используется для разнородных действий:

- login
- token check
- registration
- profile update
- avatar update
- add card
- delete card
- like toggle

Следствия:

- нет разделения между page bootstrap loading и form submit loading
- любой запрос может влиять на общие loading indicators

Ошибка обрабатывается неравномерно:

- часть flows просто делает `console.error`
- registration имеет user-facing tooltip
- data bootstrap не имеет visible fallback state

## Current Frontend Invariants for Phase 4

До `Phase 5` нужно сохранить следующее runtime behavior:

- `BrowserRouter`-based SPA routing
- protected main route на `/`
- token storage в `localStorage`
- login через `/signin` с последующим `/users/me`
- registration tooltip flow
- current backend request/response contract

## Main Fragility Points

Самые хрупкие участки текущего frontend:

- CRA toolchain
- hardcoded API host в двух местах
- дублированный request layer
- oversized `App.jsx`
- popup orchestration в одном компоненте
- отсутствие frontend tests
- неявный default redirect на `/signup` при отсутствии token

## Recommended Immediate Next Step

Следующий шаг после этого inventory:

1. начать `Phase 4.2` как отдельную Vite-only migration
2. не менять на этом шаге API client и auth/session semantics
3. перенести env/API cleanup на `Phase 4.3`
