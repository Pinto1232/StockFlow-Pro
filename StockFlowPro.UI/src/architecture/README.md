# Frontend Hexagonal Architecture

This directory contains the implementation of Hexagonal Architecture (Ports and Adapters) for the React frontend.

## Structure

```
architecture/
├── domain/           # Core business logic (entities, value objects, domain services)
├── ports/           # Interfaces (primary and secondary ports)
├── adapters/        # Implementations of ports
│   ├── primary/     # UI adapters (React components, hooks)
│   └── secondary/   # External adapters (API clients, storage)
├── application/     # Application services and use cases
└── shared/          # Shared utilities and types
```

## Principles

1. **Domain Independence**: Core business logic doesn't depend on external concerns
2. **Port-Adapter Pattern**: All external dependencies are accessed through interfaces
3. **Dependency Inversion**: High-level modules don't depend on low-level modules
4. **Testability**: Easy to test by mocking adapters
5. **Flexibility**: Easy to swap implementations without changing core logic

## Integration with Backend

The frontend communicates with the .NET backend through well-defined API contracts, allowing both systems to evolve independently while maintaining a stable interface.