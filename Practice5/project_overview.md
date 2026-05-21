# UserAdmin — Клієнт-серверний застосунок керування користувачами

## Структура проєкту

```
Practice5/
├── server/                        # Серверний застосунок (Node.js + Express)
│   ├── prisma/
│   │   ├── schema.prisma          # Схема БД (User, Department)
│   │   └── seed.js                # Початкове наповнення (15 users, 5 departments)
│   ├── src/
│   │   ├── config/database.js     # Prisma Client singleton
│   │   ├── schemas/userSchemas.js # Zod валідаційні схеми (create, update, query)
│   │   ├── services/userService.js # Сервісний шар (бізнес-логіка, CRUD, пошук)
│   │   ├── controllers/userController.js # Контролери (HTTP → Service → Response)
│   │   ├── routes/userRoutes.js   # REST маршрути (Express Router)
│   │   ├── middleware/errorHandler.js # Централізований обробник помилок
│   │   └── index.js               # Entry point (Express app)
│   ├── .env                       # DATABASE_URL + PORT
│   └── package.json
├── client/                        # Клієнтський вебзастосунок (React + Vite + TypeScript)
│   ├── src/
│   │   ├── types/user.ts          # Типи даних і DTO
│   │   ├── api/
│   │   │   ├── errorAdapter.ts    # Адаптер помилок (нормалізація)
│   │   │   ├── httpClient.ts      # HTTP-клієнт (fetch wrapper)
│   │   │   └── usersApi.ts        # API-модуль (getUsers, create, update, delete)
│   │   ├── store/                 # Redux Toolkit — централізоване керування станом
│   │   │   ├── store.ts           # configureStore (users + ui slices)
│   │   │   ├── hooks.ts           # Типізовані useAppDispatch / useAppSelector
│   │   │   ├── usersSlice.ts      # Slice + async thunks (CRUD, departments)
│   │   │   └── uiSlice.ts         # Slice UI-параметрів + sessionStorage persistence
│   │   ├── utils/queryUtils.ts    # Утиліти (queryString, formatDate, debounce)
│   │   ├── components/
│   │   │   ├── UsersTable.tsx     # Таблиця користувачів (сортування, дії)
│   │   │   ├── Pagination.tsx     # Пагінація з еліпсами
│   │   │   ├── SearchBar.tsx      # Пошуковий рядок
│   │   │   ├── UserForm.tsx       # Форма створення/редагування
│   │   │   ├── ConfirmModal.tsx   # Модальне вікно підтвердження
│   │   │   └── Loader.tsx         # Loader + ErrorMessage
│   │   ├── pages/
│   │   │   ├── UsersListPage.tsx  # Список користувачів (контейнер)
│   │   │   ├── UserCreatePage.tsx # Створення (контейнер)
│   │   │   ├── UserEditPage.tsx   # Редагування (контейнер)
│   │   │   └── UserViewPage.tsx   # Перегляд профілю (контейнер)
│   │   ├── App.tsx                # Кореневий компонент + маршрути + Redux Provider
│   │   ├── main.tsx               # Entry point
│   │   └── index.css              # Design system (dark theme, glassmorphism)
│   ├── index.html
│   └── package.json
└── Diagrams/                      # C4 та UML діаграми
```

## REST API Endpoints

| Метод  | Endpoint           | Опис                                      |
| ------ | ------------------ | ----------------------------------------- |
| GET    | `/api/users`       | Список з пошуком, сортуванням, пагінацією |
| GET    | `/api/users/:id`   | Один користувач за ID                     |
| POST   | `/api/users`       | Створити користувача                      |
| PUT    | `/api/users/:id`   | Оновити користувача                       |
| DELETE | `/api/users/:id`   | Видалити користувача                      |
| GET    | `/api/departments` | Список відділів                           |

## Запуск

### 1. Налаштування БД

Відредагуйте `server/.env` з вашим паролем PostgreSQL:

```
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/user_management?schema=public"
```

### 2. Сервер

```bash
cd server
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 3. Клієнт

```bash
cd client
npm run dev
```
