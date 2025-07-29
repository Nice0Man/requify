# Requify Backend

FastAPI backend application for Requify project.

## Features

- FastAPI web framework
- PostgreSQL database integration  
- Redis caching
- MinIO object storage
- JWT authentication
- OpenAPI/Swagger documentation
- Docker containerization

## Development

```bash
# Install dependencies
pip install -e .

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for required environment configuration.