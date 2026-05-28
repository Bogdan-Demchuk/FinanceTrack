# FinTrack

Full-stack personal finance management application built with Java and Spring Boot.

FinTrack helps users manage their personal finances by tracking expenses and income, organizing transactions into categories, and analyzing financial activity through a clean and simple dashboard.

---

## Features

- User authentication and authorization
- Expense and income tracking
- Transaction categories
- Monthly financial statistics
- Dashboard overview
- Budget management
- Responsive user interface
- REST API architecture

---

## Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- Hibernate / JPA
- PostgreSQL
- Maven

### Frontend
- HTML5
- CSS3
- JavaScript
- Thymeleaf

---

## Project Structure

```text
fintrack/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   ├── resources/
│   │   │   ├── templates/
│   │   │   ├── static/
│   │   │   └── application.properties
│   │
│   └── test/
│
├── pom.xml
├── README.md
└── .gitignore
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/fintrack.git

cd fintrack
```

---

## Configure Database

Create PostgreSQL database:

```sql
CREATE DATABASE fintrack;
```

---

## Configure application.properties

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/fintrack
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## Run Application

```bash
./mvnw spring-boot:run
```

or

```bash
mvn spring-boot:run
```

Application will start on:

```text
http://localhost:8080
```

---

## Main Features

### Authentication
- User registration
- User login
- Secure password encryption

### Transactions
- Add income and expenses
- Edit transactions
- Delete transactions
- Filter transactions

### Categories
- Create categories
- Organize transactions

### Dashboard
- Total balance
- Monthly expenses
- Monthly income
- Financial overview

---

## REST API Endpoints

### Authentication

```http
POST /auth/register
POST /auth/login
```

### Transactions

```http
GET    /transactions
POST   /transactions
PUT    /transactions/{id}
DELETE /transactions/{id}
```

### Categories

```http
GET    /categories
POST   /categories
PUT    /categories/{id}
DELETE /categories/{id}
```

---

## Future Improvements

- Budget notifications
- Charts and analytics
- Recurring payments
- Export to PDF/CSV
- Multi-currency support
- Mobile version

---

## Screenshots

Coming soon...

---

## License

This project is licensed under the MIT License.

---

## Author

Developed by Bohdan Demchuk
