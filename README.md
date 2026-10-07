# FinanceTrack

**FinanceTrack** — веб-приложение для управления личными финансами.
С помощью приложения пользователь может добавлять доходы и расходы, просматривать баланс, фильтровать транзакции и анализировать свои финансовые данные.

Проект разработан на **Java** с использованием **Spring Boot**. Frontend реализован с помощью HTML, CSS и JavaScript.

---

## Возможности

### Авторизация и пользователи

* Регистрация нового пользователя
* Вход в аккаунт
* Выход из аккаунта
* Защита данных пользователей с помощью Spring Security
* Пароли хранятся в зашифрованном виде с использованием BCrypt

### Транзакции

* Добавление доходов и расходов
* Редактирование транзакций
* Удаление транзакций
* Просмотр всех своих транзакций
* Фильтрация по:

  * названию
  * категории
  * типу операции
  * сумме
  * диапазону дат

### Финансовая статистика

* Общий баланс
* Общая сумма доходов
* Общая сумма расходов
* Статистика за выбранный период
* Статистика расходов по категориям
* Информация для Dashboard
* Расчёт сбережений и процента сбережений

### Интерфейс

* Dashboard с основной финансовой информацией
* Список транзакций
* Форма добавления транзакции
* Окна редактирования и удаления
* Выбор месяца для просмотра статистики
* График расходов по категориям
* Financial Insights

---

## Технологии

### Backend

* **Java 26**
* **Spring Boot 4.0.6**
* **Spring Web MVC**
* **Spring Data JPA**
* **Spring Security**
* **Hibernate**
* **Jakarta Validation**
* **PostgreSQL**
* **Gradle**

### Frontend

* **HTML5**
* **CSS3**
* **JavaScript**
* **Chart.js**

---

## Структура проекта

```text
FinanceTrack/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/demo/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── exception/
│   │   │       ├── model/
│   │   │       ├── repository/
│   │   │       ├── security/
│   │   │       ├── service/
│   │   │       └── validation/
│   │   │
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── index.html
│   │       │   ├── login.html
│   │       │   ├── register.html
│   │       │   ├── index.js
│   │       │   ├── auth.js
│   │       │   └── style.css
│   │       │
│   │       └── application.properties
│   │
│   └── test/
│
├── gradle/
├── build.gradle
├── settings.gradle
├── gradlew
├── gradlew.bat
├── .gitignore
└── README.md
```

---

## Database

Проект использует **PostgreSQL**.

Перед запуском приложения необходимо создать базу данных:

```sql
CREATE DATABASE fintrack;
```

По умолчанию приложение использует:

```text
Host: localhost
Port: 5432
Database: fintrack
Username: postgres
Password: postgres
```

При необходимости данные подключения можно изменить через переменные окружения:

```text
DB_USERNAME
DB_PASSWORD
```

Например:

```bash
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Hibernate автоматически создаёт и обновляет необходимые таблицы при запуске приложения.

---

## Запуск проекта

### 1. Клонирование репозитория

```bash
git clone https://github.com/Bogdan-Demchuk/FinanceTrack.git
```

Перейдите в папку проекта:

```bash
cd FinanceTrack
```

### 2. Настройка PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE fintrack;
```

Убедитесь, что PostgreSQL запущен.

### 3. Запуск через Gradle

Для Windows:

```bash
gradlew.bat bootRun
```

Для Linux/macOS:

```bash
./gradlew bootRun
```

После запуска приложение будет доступно по адресу:

```text
http://localhost:8080
```

---

## API

Основные API endpoints проекта:

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Transactions

```http
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}
```

### Transaction statistics

```http
GET /api/transactions/income
GET /api/transactions/expense
GET /api/transactions/balance
GET /api/transactions/filter
```

### Statistics

```http
GET /api/statistics
GET /api/statistics/period
GET /api/statistics/period/categories
GET /api/statistics/dashboard
```

---

## Transaction Categories

В приложении доступны следующие категории:

```text
FOOD
TRANSPORT
ENTERTAINMENT
WORK
HEALTH
SHOPPING
OTHER
```

Тип транзакции может быть:

```text
INCOME
EXPENSE
```

---

## Security

Для авторизации используется **Spring Security**.

Каждая транзакция связана с конкретным пользователем. API получает ID текущего пользователя из Security Context, поэтому пользователь может работать только со своими финансовыми данными.

Пароли пользователей не хранятся в открытом виде — используется **BCryptPasswordEncoder**.

---

## Dashboard

Главная страница приложения содержит:

* Balance
* Income
* Expenses
* Savings
* Savings Rate
* Spending by Category
* Financial Insights
* Список транзакций
* Форму добавления транзакции

Для визуализации статистики используется **Chart.js**.

---

## Future Improvements

В дальнейшем проект можно расширить следующими возможностями:

* Более подробные графики и аналитика
* Планирование бюджета
* Повторяющиеся платежи
* Экспорт транзакций в CSV или PDF
* Дополнительные валюты
* Расширенная система категорий
* Улучшение мобильной версии
* Docker для запуска приложения и PostgreSQL

---

## Author

**Bohdan Demchuk**

GitHub:
https://github.com/Bogdan-Demchuk

---

## License

This project is created for educational and personal development purposes.
