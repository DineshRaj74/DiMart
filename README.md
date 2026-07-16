# 🛍️ DiMart - Spring Boot E-Commerce Application

DiMart is a full-stack e-commerce web application built using **Spring Boot**, **Java**, **MySQL**, and a responsive frontend developed with **HTML5**, **CSS3**, **JavaScript**, and **jQuery**.

The application demonstrates core e-commerce features including product browsing, shopping cart management, order placement, and contact functionality through RESTful APIs.

---

## 🚀 Features

- 🛒 Browse products by category
- 🔍 Product catalog with dynamic data loading
- ➕ Add products to shopping cart
- 🛍️ Manage cart items
- 📦 Place customer orders
- 📩 Contact form with backend API
- 📱 Responsive user interface
- 🔗 RESTful API architecture
- 🗄️ MySQL database integration
- 🐳 Docker support for deployment

---

## 🛠️ Tech Stack

### Backend
- Java 17
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- REST API

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)
- jQuery

### Database
- MySQL

### Tools
- Maven
- Git
- GitHub
- IntelliJ IDEA
- VS Code
- Docker

---

## 📂 Project Structure

```
DiMart
├── src
│   ├── main
│   │   ├── java
│   │   │   ├── controller
│   │   │   ├── service
│   │   │   ├── repository
│   │   │   ├── model
│   │   │   └── config
│   │   └── resources
│   │       ├── static
│   │       └── application.properties
├── sql
├── Dockerfile
├── pom.xml
└── README.md
```

---

## ⚙️ Getting Started

### Clone the Repository

```bash
git clone https://github.com/DineshRaj74/DiMart.git
```

Move into the project folder:

```bash
cd DiMart
```

---

## Configure Database

Create a MySQL database.

Update your `application.properties` with your database credentials.

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/dimart
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

---

## Run the Application

Using Maven:

```bash
mvn spring-boot:run
```

Or run the `DimartApplication.java` class directly from IntelliJ IDEA.

---

## Future Improvements

- User authentication
- Payment gateway integration
- Wishlist
- Product search and filters
- Admin dashboard
- Order history
- User profile management

---

## Learning Objectives

This project was developed to strengthen practical knowledge of:

- Spring Boot
- REST API development
- CRUD operations
- JPA & Hibernate
- Frontend integration
- MySQL database connectivity
- Git & GitHub workflow

---

## Author

*Dinesh Raj S*

GitHub:
https://github.com/DineshRaj74

LinkedIn:
https://www.linkedin.com/in/dineshra-j07042005

---

⭐ If you found this project helpful, consider giving it a Star!
