# Backend Architecture

## Application Flow

Client → REST API → Routes → Controllers → Services → Mongoose Models → MongoDB

## Layers

- **Routes:** map HTTP endpoints to controllers.
- **Controllers:** translate HTTP requests into service calls and responses.
- **Services:** contain business logic and database orchestration.
- **Models:** define MongoDB schemas, indexes, relationships, and persistence rules.
- **Validators:** validate request payloads, params, and query strings.
- **Middleware:** authentication, authorization, ownership, validation, error handling, 404 handling, and rate limiting.
- **Utils:** reusable application helpers.
- **Constants:** shared enums and status values.
- **Config:** environment, database, and logging setup.
