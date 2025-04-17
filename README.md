<p align="center">
  <h1 align="center">Handicraft E-commerce RESTful API</h1>
</p>

## Description

This API serves as the backend for an e-commerce application, providing comprehensive features for:

- **Products Management**: Create, list, filter, update, and delete products
- **Category Management**: Hierarchical category system with parent-child relationships
- **Promotions System**: Flexible promotions with different discount types and target scopes
- **User Management**: User authentication and role-based access control

## Features

### Products
- Complete CRUD operations for products
- Advanced filtering (price range, categories, stock availability, etc.)
- Multiple sorting options (newest, price, popularity, top sellers)
- Pagination support
- Product relationships (related products)
- Product specifications and attributes

### Categories
- Hierarchical category structure
- Category tree navigation
- Product-category associations
- Category-based product filtering

### Promotions
- Different discount types (percentage, fixed amount)
- Target scopes (all products, category-based, specific products)
- Promotion code validation
- Time-limited promotions

### Authentication
- Role-based access control (admin, user)
- JWT authentication
- Protected routes

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Validation**: class-validator & class-transformer

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

When running in development or staging environments, Swagger documentation is available at:

```
http://localhost:3000/api/docs
```

The API includes comprehensive documentation for all endpoints with request/response examples.

## Environment Configuration

The application uses environment variables for configuration. Copy the `.env.example` file to `.env` and adjust the values:

```bash
# PostgreSQL database connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=handicraft

# JWT settings
JWT_SECRET=your_secret_key
JWT_EXPIRATION=1d
```

## Database Migrations

```bash
# generate a migration
$ npm run migration:generate -- src/migrations/YourMigrationName

# run migrations
$ npm run migration:run

# revert last migration
$ npm run migration:revert
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

This project is [MIT licensed](LICENSE).
