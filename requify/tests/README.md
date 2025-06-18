# Requify API Test Suite

Comprehensive test suite for testing all CRUD operations via HTTP requests for the Requify requirements management system.

## Overview

This test suite provides comprehensive coverage for all API endpoints in the Requify system, including:

- **Users API** - User management and authentication
- **Projects API** - Project creation and management
- **Requirements API** - Requirements lifecycle management
- **Releases API** - Release planning and management
- **Testing API** - Test case and execution management
- **Reference Data API** - System configuration and lookup data

## Test Structure

```
requify/tests/
├── conftest.py              # Test configuration and fixtures
├── test_users_api.py        # User management tests
├── test_projects_api.py     # Project management tests
├── test_requirements_api.py # Requirements management tests
├── test_releases_api.py     # Release management tests
├── test_reference_api.py    # Reference data tests
├── test_testing_api.py      # Testing system tests
├── test_runner.py           # Test execution utilities
└── README.md               # This file
```

## Prerequisites

1. **Database Setup**
   ```bash
   # Ensure PostgreSQL is running
   make up
   
   # Run migrations
   make migrate
   ```

2. **Python Dependencies**
   ```bash
   pip install pytest pytest-asyncio httpx pytest-cov pytest-html pytest-xdist click
   ```

3. **Environment Variables**
   ```bash
   export TESTING=1
   export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/requify_test"
   export TEST_REDIS_URL="redis://localhost:6379/1"
   ```

## Running Tests

### Using the Test Runner (Recommended)

The test runner provides a convenient CLI for running different types of tests:

```bash
# Run all tests
python requify/tests/test_runner.py --test-type all

# Run with coverage report
python requify/tests/test_runner.py --test-type all --coverage

# Run smoke tests (basic CRUD operations only)
python requify/tests/test_runner.py --test-type smoke

# Run tests for specific entity
python requify/tests/test_runner.py --test-type users
python requify/tests/test_runner.py --test-type projects
python requify/tests/test_runner.py --test-type requirements

# Run tests in parallel
python requify/tests/test_runner.py --parallel 4

# Run tests matching a pattern
python requify/tests/test_runner.py --pattern "test_create*"

# Generate HTML report
python requify/tests/test_runner.py --report test_report.html
```

### Using Pytest Directly

```bash
# Run all tests
pytest requify/tests/ -v

# Run specific test file
pytest requify/tests/test_users_api.py -v

# Run with coverage
pytest requify/tests/ --cov=requify.app --cov-report=html

# Run tests matching pattern
pytest requify/tests/ -k "test_create" -v

# Run in parallel
pytest requify/tests/ -n 4
```

### Using Make Commands

```bash
# Run all tests
make test

# Run with coverage
make test-cov

# Run linting
make lint

# Format code
make format
```

## Test Categories

### 1. CRUD Operations Tests
Each entity has comprehensive CRUD tests:
- **Create** - Test successful creation, validation, duplicate handling
- **Read** - Test listing, filtering, searching, pagination, single item retrieval
- **Update** - Test modifications, partial updates, validation
- **Delete** - Test deletion, cascade effects, error handling

### 2. Business Logic Tests
- Workflow state transitions
- Permission and authorization checks
- Business rule validation
- Cross-entity relationships

### 3. Integration Tests
- External system integration
- File upload/download operations
- Bulk operations
- Import/export functionality

### 4. Performance Tests
- Concurrent operations
- Large dataset handling
- Response time validation

### 5. Error Handling Tests
- Invalid input validation
- Not found scenarios
- Permission denied cases
- Server error simulation

## Test Data Management

### Fixtures
The test suite uses pytest fixtures for test data:

```python
# Project-level fixtures in conftest.py
@pytest.fixture
async def client():
    """HTTP test client"""

@pytest.fixture
async def test_session():
    """Database session for tests"""

# Entity-specific fixtures in each test file
@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""

@pytest.fixture
async def test_project():
    """Create a test project"""
```

### Data Isolation
- Each test creates its own data using unique identifiers
- Database transactions are isolated
- Test data is automatically cleaned up after tests

## Writing New Tests

### 1. Follow the Existing Pattern

```python
class TestNewEntityAPI:
    """Test class for New Entity API endpoints."""
    
    @pytest.fixture
    def sample_entity_data(self):
        """Sample data for creating entity."""
        return {
            "name": f"Test-{uuid.uuid4().hex[:8]}",
            "description": "Test description"
        }
    
    async def create_test_entity(self, client, entity_data):
        """Helper to create test entity."""
        response = await client.post("/api/v1/entities/", json=entity_data)
        assert response.status_code == status.HTTP_201_CREATED
        return response.json()
    
    async def test_create_entity_success(self, client, sample_entity_data):
        """Test successful entity creation."""
        response = await client.post("/api/v1/entities/", json=sample_entity_data)
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == sample_entity_data["name"]
        assert "id" in data
```

### 2. Test Naming Convention

- `test_create_*_success` - Successful creation tests
- `test_create_*_failure` - Creation failure tests  
- `test_get_*_list` - List retrieval tests
- `test_get_*_by_id` - Single item retrieval
- `test_update_*` - Update operation tests
- `test_delete_*` - Deletion tests
- `test_*_validation` - Input validation tests
- `test_*_permissions` - Permission tests

### 3. Assertions

Always include comprehensive assertions:

```python
# Check status code
assert response.status_code == status.HTTP_201_CREATED

# Check response structure
data = response.json()
assert "id" in data
assert "created_at" in data

# Check specific values
assert data["name"] == expected_name
assert data["status"] == "active"

# Check data types
assert isinstance(data["items"], list)
assert isinstance(data["count"], int)
```

## Debugging Tests

### 1. Verbose Output
```bash
pytest requify/tests/test_users_api.py::TestUsersAPI::test_create_user_success -v -s
```

### 2. Debug with Print Statements
```python
async def test_debug_example(self, client):
    response = await client.get("/api/v1/users/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
```

### 3. Use pytest-pdb for Debugging
```bash
pytest requify/tests/test_users_api.py --pdb
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: requify_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.11
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov
    
    - name: Run tests
      run: |
        python requify/tests/test_runner.py --test-type all --coverage
```

## Best Practices

### 1. Test Independence
- Each test should be independent and not rely on other tests
- Use fixtures to create required test data
- Clean up test data appropriately

### 2. Meaningful Test Names
- Test names should clearly describe what is being tested
- Include the expected outcome in the test name

### 3. Comprehensive Coverage
- Test both success and failure scenarios
- Include edge cases and boundary conditions
- Test error handling and validation

### 4. Performance Considerations
- Use async/await for database operations
- Run tests in parallel when possible
- Use appropriate test data sizes

### 5. Maintainability
- Keep tests simple and focused
- Use helper methods to reduce duplication
- Document complex test scenarios

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check if database is running
   docker-compose ps
   
   # Restart database services
   make down && make up
   ```

2. **Import Errors**
   ```bash
   # Ensure you're in the correct directory
   cd /path/to/requify
   
   # Check Python path
   export PYTHONPATH=/path/to/requify:$PYTHONPATH
   ```

3. **Test Data Conflicts**
   ```bash
   # Reset test database
   make reset-db
   ```

4. **Authentication Issues**
   - Check if authentication is properly mocked in tests
   - Verify test user creation in fixtures

### Getting Help

1. Check test logs for detailed error messages
2. Run individual tests to isolate issues
3. Use verbose mode (`-v`) for more detailed output
4. Check the project documentation for API specifications

## Contributing

When adding new tests:

1. Follow the existing test structure and naming conventions
2. Include comprehensive test coverage for new features
3. Update this README if adding new test categories
4. Ensure all tests pass before submitting changes

## Performance Benchmarks

The test suite should complete within these timeframes:

- **Smoke tests**: < 30 seconds
- **Single entity tests**: < 2 minutes  
- **Full test suite**: < 10 minutes
- **With coverage**: < 15 minutes

If tests are taking longer, consider:
- Running tests in parallel
- Optimizing test data creation
- Using database transactions for faster cleanup 