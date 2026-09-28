def test_signup_success(client):
    response = client.post(
        "/auth/signup",
        json={"name": "Alice", "email": "alice@example.com", "password": "pass1234"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert "password" not in data


def test_signup_duplicate_email(client):
    payload = {"name": "Alice", "email": "alice@example.com", "password": "pass1234"}
    client.post("/auth/signup", json=payload)
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 400


def test_login_success(client):
    client.post(
        "/auth/signup",
        json={"name": "Bob", "email": "bob@example.com", "password": "mypassword"},
    )
    response = client.post(
        "/auth/login", json={"email": "bob@example.com", "password": "mypassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client):
    client.post(
        "/auth/signup",
        json={"name": "Bob", "email": "bob@example.com", "password": "mypassword"},
    )
    response = client.post(
        "/auth/login", json={"email": "bob@example.com", "password": "wrongpass"}
    )
    assert response.status_code == 401


def test_get_me_requires_auth(client):
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_get_me_with_token(client, auth_headers):
    response = client.get("/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
