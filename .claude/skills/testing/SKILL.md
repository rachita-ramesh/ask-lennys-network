---
name: testing
description: "PROACTIVELY invoke this skill when creating or modifying tests. Produces elaborate, thorough test suites with realistic fake data, vulnerability testing, boundary conditions, and comprehensive user action coverage. Tests should catch bugs before production."
---

# Testing Skill — Elaborate, Production-Grade Test Suites

## Purpose
This skill ensures every test suite is thorough enough to catch real production bugs. Tests must go beyond happy paths to cover every vulnerability, edge case, and adversarial user action.

## When Claude MUST Invoke This Skill
- Writing any new test file
- Adding tests to an existing test file
- Reviewing test coverage for a feature
- After implementing a new feature (tests should always follow implementation)

---

## Test Philosophy

### The 5 Layers of Testing
Every feature must have tests across ALL 5 layers:

1. **Happy Path** — Does it work correctly with valid input?
2. **Edge Cases** — Empty arrays, null values, zero, max values, unicode, special chars
3. **Type Safety** — Wrong types passed (string where dict expected, list where string expected)
4. **Adversarial Input** — What a malicious or careless user could send
5. **State & Concurrency** — Race conditions, stale state, duplicate requests, out-of-order events

### Test Data Requirements

**ALWAYS generate realistic fake data.** Never use `"test"`, `"foo"`, `"bar"`, or `"123"`.

Use this approach for fake data:
```python
# BAD — lazy test data
user_id = "123"
company = "test company"
email = "test@test.com"

# GOOD — realistic fake data that mimics production
user_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
company = "Aura Frames Inc."
email = "dan.tochen@pushd.com"
job_id = "job_8f3a2b1c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"
conversation_id = "conv_7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b"
```

For structured data, create **factory functions**:
```python
def make_brand_job(overrides=None):
    """Factory for realistic brand_jobs rows"""
    base = {
        'id': f'job_{uuid4().hex[:24]}',
        'user_id': 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'conversation_id': f'conv_{uuid4().hex[:24]}',
        'job_type': 'quant_survey',
        'status': 'processing',
        'progress': 45,
        'progress_message': 'Querying digital twins (23/50)...',
        'created_at': '2025-02-01T10:30:00Z',
        'completed_at': None,
        'result_data': None,
        'error_message': None,
    }
    if overrides:
        base.update(overrides)
    return base
```

---

## Test Categories Checklist

For EVERY feature, cover these categories. Mark each with a comment indicating the category.

### 1. Happy Path Tests
```python
# --- HAPPY PATH ---
def test_returns_correct_result_with_valid_input(self):
    """Standard valid input produces expected output"""
```
- Normal, expected inputs
- Verify exact return values (not just "no error")
- Check response structure, status codes, data types

### 2. Empty & Null Input Tests
```python
# --- EMPTY/NULL INPUTS ---
def test_empty_array_does_not_crash(self):
    """Empty array input returns empty result, not IndexError"""
```
- `None` / `null` for every optional parameter
- Empty string `""`
- Empty array `[]`
- Empty dict `{}`
- Missing keys entirely (key not in dict)
- `0` vs `None` vs `False` (falsy confusion)

### 3. Type Mismatch Tests
```python
# --- TYPE SAFETY ---
def test_string_where_dict_expected(self):
    """JSON string from DB instead of parsed dict doesn't crash"""
```
- String where dict expected (common DB issue — ERROR-004)
- List where dict expected
- Int where string expected
- Nested type mismatches (`{"data": "string"}` vs `{"data": {"key": "value"}}`)

### 4. Boundary Value Tests
```python
# --- BOUNDARY VALUES ---
def test_exactly_at_limit(self):
    """Value exactly at boundary (e.g., 3 concurrent jobs when limit is 3)"""
```
- Exactly at limits (0, max, boundary)
- One below limit, one above limit
- Maximum valid input sizes
- Minimum valid input sizes
- Numeric overflow (very large numbers)
- Very long strings (>10000 chars)

### 5. Adversarial Input Tests
```python
# --- ADVERSARIAL INPUT ---
def test_sql_injection_in_user_id(self):
    """SQL injection attempt in user_id parameter"""
```
- SQL injection: `'; DROP TABLE brand_jobs; --`
- XSS payloads: `<script>alert('xss')</script>`
- Path traversal: `../../etc/passwd`
- Unicode attacks: null bytes `\x00`, RTL override `\u202e`
- Extremely long strings (buffer overflow attempts)
- Special characters in IDs: `user_id=*`, `user_id=eq.`

### 6. Concurrency & State Tests
```python
# --- CONCURRENCY ---
def test_race_condition_two_jobs_start_simultaneously(self):
    """Two jobs start at exact same time, cap check runs for both"""
```
- Race conditions (two requests hit cap check simultaneously)
- Stale state (job completed but client doesn't know yet)
- Duplicate requests (user clicks button twice)
- Out-of-order responses (job 2 completes before job 1)
- State after error (is state cleaned up on failure?)

### 7. Error Handling Tests
```python
# --- ERROR HANDLING ---
def test_database_connection_failure(self):
    """Database unavailable returns graceful error, not stack trace"""
```
- Database connection failures
- Network timeouts
- Invalid API responses (malformed JSON)
- Partial failures (some records succeed, some fail)
- Error message doesn't leak internal details (no stack traces, no SQL)

### 8. Security Tests
```python
# --- SECURITY ---
def test_user_cannot_see_other_users_jobs(self):
    """User A's request only returns User A's jobs, never User B's"""
```
- User isolation (can user A access user B's data?)
- Missing auth (no user_id, empty auth header)
- Privilege escalation (regular user tries admin action)
- IDOR (Insecure Direct Object Reference — changing IDs in URLs)

### 9. Regression Tests (from Error Guard)
```python
# --- REGRESSION: ERROR-NNN ---
def test_error_001_empty_data_points_no_crash(self):
    """Regression: ERROR-001 — empty data_points array must not IndexError"""
```
- For EVERY relevant error in `error-guard/SKILL.md`, write a specific regression test
- Reference the error number in test name and docstring
- Reproduce the exact trigger condition

---

## Test Structure Pattern

### File Naming
```
tests/unit/test_{feature_name}.py          # Unit tests
tests/integration/test_{feature_name}.py    # Integration tests
```

### File Structure
```python
"""
Unit tests for {feature name}

Tests focusing on:
- {category 1}
- {category 2}
- Known error patterns: ERROR-NNN, ERROR-NNN
"""
import pytest
import json
import sys
import os
from unittest.mock import patch, MagicMock
from uuid import uuid4

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))


# ============================================================
# Test Data Factories
# ============================================================

def make_{entity}(overrides=None):
    """Factory for realistic {entity} data"""
    base = { ... }
    if overrides:
        base.update(overrides)
    return base


# ============================================================
# Test Classes
# ============================================================

class TestFeatureHappyPath:
    """Happy path tests for {feature}"""

class TestFeatureEdgeCases:
    """Empty/null/boundary edge cases"""

class TestFeatureTypeSafety:
    """Type mismatch handling"""

class TestFeatureAdversarial:
    """Adversarial and malicious input handling"""

class TestFeatureSecurity:
    """User isolation, auth, IDOR"""

class TestFeatureErrorHandling:
    """Graceful failure on infrastructure issues"""
```

---

## Mocking Patterns for Pai

### Mocking Supabase (HTTP-level)
```python
from unittest.mock import patch, MagicMock
import json

def _mock_supabase_response(data, status=200):
    """Create a mock HTTP response for SupabaseClient._make_request"""
    mock_response = MagicMock()
    mock_response.status = status
    mock_response.read.return_value = json.dumps(data).encode()
    mock_response.__enter__ = MagicMock(return_value=mock_response)
    mock_response.__exit__ = MagicMock(return_value=False)
    return mock_response

# Usage in test:
@patch('urllib.request.urlopen')
def test_something(self, mock_urlopen):
    mock_urlopen.return_value = _mock_supabase_response([
        make_brand_job({'status': 'processing'}),
        make_brand_job({'status': 'pending'}),
    ])
    # ... test code
```

### Mocking Environment Variables
```python
@pytest.fixture(autouse=True)
def mock_env(self, monkeypatch):
    monkeypatch.setenv('SUPABASE_URL', 'https://test.supabase.co')
    monkeypatch.setenv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
    monkeypatch.setenv('SUPABASE_ANON_KEY', 'test-anon-key')
```

### Mocking Vercel Handler Requests
```python
from io import BytesIO

def _make_request(method, path, body=None, headers=None):
    """Create a mock Vercel-style HTTP request"""
    request = MagicMock()
    request.method = method
    request.path = path
    request.headers = headers or {}
    if body:
        request.rfile = BytesIO(json.dumps(body).encode())
        request.headers['Content-Length'] = str(len(json.dumps(body)))
    return request
```

---

## Anti-Patterns (NEVER Do These)

### 1. Trivial Assertions
```python
# BAD — proves nothing
def test_function_exists(self):
    assert callable(my_function)

# BAD — only checks no error, not correctness
def test_it_works(self):
    result = my_function(input)
    assert result is not None

# GOOD — checks exact behavior
def test_returns_three_active_jobs(self):
    result = get_active_jobs(user_id='abc')
    assert result['active_count'] == 3
    assert len(result['active_jobs']) == 3
    assert all(j['status'] in ('pending', 'processing') for j in result['active_jobs'])
```

### 2. Testing Implementation Instead of Behavior
```python
# BAD — tests how, not what
def test_calls_database(self, mock_db):
    my_function()
    mock_db.assert_called_once_with('SELECT * FROM jobs')

# GOOD — tests observable behavior
def test_returns_only_active_jobs(self):
    # Setup: 2 active + 1 completed in mock DB
    result = get_active_jobs(user_id)
    assert result['active_count'] == 2  # Completed excluded
```

### 3. Shared Mutable State Between Tests
```python
# BAD — test order dependency
jobs_list = []  # Shared between tests!

# GOOD — each test gets fresh state
def test_one(self):
    jobs = [make_brand_job()]
    # ...
```

---

## Quantitative Standards

- **Minimum tests per feature**: 15-25 tests
- **Test categories**: Must cover at least 5 of the 9 categories above
- **Edge cases per parameter**: At least 3 (null, empty, wrong type)
- **Realistic data**: 100% of test data must use realistic values (UUIDs, real-looking names, proper formats)
- **Assertion density**: At least 2 assertions per test (verify both success AND side effects)
- **Error message clarity**: Test error messages must explain WHY it fails, not just THAT it fails

---

## Pai-Specific Test Patterns

### Testing Vercel-style Handlers
Vercel Python handlers use `BaseHTTPRequestHandler` — they can't be easily instantiated. Instead:
1. **Extract logic into testable functions** and test those
2. **Replicate the logic inline** in the test class (pattern used in `test_brand_follow_up.py`)
3. **Use `importlib.util`** to load the module dynamically if needed

### Testing Modal Functions
Modal functions run remotely but their internal logic can be tested locally:
1. Mock the `@modal.method()` decorator
2. Test the pure function logic (data processing, cap checks, etc.)
3. Mock `SupabaseClient` for database interactions

### Testing Frontend Logic (TypeScript)
No frontend test framework exists yet. For frontend logic:
1. Extract pure functions into utility files
2. Add Jest/Vitest when ready
3. For now, document expected frontend behavior in test docstrings

---

## Pre-Test Checklist

Before declaring a test suite complete:

- [ ] Every public function/endpoint has at least 1 happy path test
- [ ] Every parameter has null/empty/wrong-type tests
- [ ] Known error patterns from error-guard are regression-tested
- [ ] Boundary values are tested (exactly at limit, one above, one below)
- [ ] At least 1 adversarial input test (SQL injection, XSS, or similar)
- [ ] At least 1 security test (user isolation or auth check)
- [ ] All test data uses realistic values (no "foo", "bar", "test123")
- [ ] Each test has a clear docstring explaining WHAT it tests and WHY
- [ ] Tests run independently (no shared mutable state, no order dependency)
- [ ] `pytest tests/unit/test_{name}.py` passes cleanly
