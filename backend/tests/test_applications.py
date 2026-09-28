def test_create_application(client, auth_headers):
    response = client.post(
        "/applications/",
        json={"company_name": "Accenture", "role_title": "Advanced Tech Engineer"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Accenture"
    assert data["status"] == "applied"


def test_list_applications(client, auth_headers):
    client.post(
        "/applications/",
        json={"company_name": "Accenture", "role_title": "Engineer"},
        headers=auth_headers,
    )
    client.post(
        "/applications/",
        json={"company_name": "TCS", "role_title": "Developer"},
        headers=auth_headers,
    )
    response = client.get("/applications/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_update_application_status(client, auth_headers):
    create = client.post(
        "/applications/",
        json={"company_name": "Infosys", "role_title": "SDE"},
        headers=auth_headers,
    )
    app_id = create.json()["id"]
    response = client.put(
        f"/applications/{app_id}",
        json={"status": "interview"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["status"] == "interview"


def test_delete_application(client, auth_headers):
    create = client.post(
        "/applications/",
        json={"company_name": "Wipro", "role_title": "Analyst"},
        headers=auth_headers,
    )
    app_id = create.json()["id"]
    response = client.delete(f"/applications/{app_id}", headers=auth_headers)
    assert response.status_code == 200

    get_response = client.get(f"/applications/{app_id}", headers=auth_headers)
    assert get_response.status_code == 404


def test_cannot_access_other_users_application(client, auth_headers):
    # user A creates an application
    create = client.post(
        "/applications/",
        json={"company_name": "Google", "role_title": "SWE"},
        headers=auth_headers,
    )
    app_id = create.json()["id"]

    # user B signs up and tries to access it
    client.post(
        "/auth/signup",
        json={"name": "User B", "email": "userb@example.com", "password": "pass1234"},
    )
    login_b = client.post(
        "/auth/login", json={"email": "userb@example.com", "password": "pass1234"}
    )
    headers_b = {"Authorization": f"Bearer {login_b.json()['access_token']}"}

    response = client.get(f"/applications/{app_id}", headers=headers_b)
    assert response.status_code == 404
