from datetime import datetime

import pytest
from sqlalchemy import select

from hermadata.database.models import Animal, AnimalHealthActivity
from hermadata.initializations import get_current_user
from hermadata.services.user_service import TokenData


def url(animal_id, activity_id=None):
    base = f"/animal/{animal_id}/health-activities"
    return base if activity_id is None else f"{base}/{activity_id}"


def payload(description="Vaccinazione", activity_date="2026-01-15"):
    return {"description": description, "activity_date": activity_date}


def test_crud_and_soft_delete(app, make_animal, db_session):
    animal_id = make_animal()
    created = app.post(url(animal_id), json=payload("  Vaccinazione  "))
    assert created.status_code == 201
    activity = created.json()
    assert activity["description"] == "Vaccinazione"
    assert activity["animal_id"] == animal_id
    assert app.get(url(animal_id)).json() == [activity]

    updated = app.put(
        url(animal_id, activity["id"]),
        json=payload("Controllo medico", "2026-02-01"),
    )
    assert updated.status_code == 200
    assert updated.json()["activity_date"] == "2026-02-01"
    assert updated.json()["description"] == "Controllo medico"

    assert app.delete(url(animal_id, activity["id"])).status_code == 204
    assert app.get(url(animal_id)).json() == []
    row = db_session.scalar(
        select(AnimalHealthActivity).where(
            AnimalHealthActivity.id == activity["id"]
        )
    )
    assert row.deleted_at is not None
    assert app.put(url(animal_id, row.id), json=payload()).status_code == 404
    assert app.delete(url(animal_id, row.id)).status_code == 404


def test_filtering_sorting_and_literal_search(app, make_animal):
    animal_id = make_animal()
    records = [
        app.post(url(animal_id), json=payload(description, day)).json()
        for description, day in [
            ("Vaccino A", "2026-01-01"),
            ("Controllo", "2026-01-15"),
            ("Vaccino B", "2026-01-31"),
            ("Vaccino C", "2026-01-31"),
            ("Soluzione 10%_test", "2026-02-01"),
        ]
    ]
    assert [r["id"] for r in app.get(url(animal_id)).json()] == [
        r["id"] for r in reversed(records)
    ]
    filtered = app.get(
        url(animal_id),
        params={
            "description": " VACCINO ",
            "from_date": "2026-01-01",
            "to_date": "2026-01-31",
        },
    ).json()
    assert [r["id"] for r in filtered] == [records[i]["id"] for i in [3, 2, 0]]
    assert (
        len(
            app.get(
                url(animal_id),
                params={
                    "from_date": "2026-01-31",
                    "to_date": "2026-01-31",
                },
            ).json()
        )
        == 2
    )
    assert (
        len(
            app.get(
                url(animal_id),
                params={
                    "from_date": "2026-02-01",
                },
            ).json()
        )
        == 1
    )
    assert (
        len(
            app.get(
                url(animal_id),
                params={
                    "to_date": "2026-01-01",
                },
            ).json()
        )
        == 1
    )
    assert app.get(
        url(animal_id),
        params={
            "description": "%_",
        },
    ).json() == [records[4]]
    assert (
        app.get(
            url(animal_id),
            params={
                "description": "inesistente",
            },
        ).json()
        == []
    )


def test_animal_isolation_and_missing_records(app, make_animal, db_session):
    animal_id, other_id = make_animal(), make_animal()
    activity = app.post(url(animal_id), json=payload()).json()
    assert app.get(url(other_id)).json() == []
    assert (
        app.put(url(other_id, activity["id"]), json=payload()).status_code
        == 404
    )
    assert app.delete(url(other_id, activity["id"])).status_code == 404
    assert app.get(url(99999999)).status_code == 404
    assert app.post(url(99999999), json=payload()).status_code == 404
    assert app.put(url(animal_id, 99999999), json=payload()).status_code == 404

    db_session.get(Animal, animal_id).deleted_at = datetime.utcnow()
    db_session.flush()
    assert app.get(url(animal_id)).status_code == 404
    assert app.post(url(animal_id), json=payload()).status_code == 404
    assert (
        app.put(url(animal_id, activity["id"]), json=payload()).status_code
        == 404
    )
    assert app.delete(url(animal_id, activity["id"])).status_code == 404


@pytest.mark.parametrize(
    "data",
    [
        payload("   "),
        payload(activity_date="2026-02-30"),
        {"description": "Vaccino"},
        {"activity_date": "2026-01-01"},
    ],
)
def test_invalid_input(app, make_animal, data):
    animal_id = make_animal()
    assert app.post(url(animal_id), json=data).status_code == 422


def test_invalid_filter_dates(app, make_animal):
    animal_id = make_animal()
    for params in [
        {"from_date": "2026-02-30"},
        {"from_date": "2026-02-01", "to_date": "2026-01-01"},
    ]:
        assert app.get(url(animal_id), params=params).status_code == 422


@pytest.mark.parametrize(
    "method,permission,expected",
    [
        ("get", "BHA", 200),
        ("post", "CHA", 201),
        ("put", "EHA", 200),
        ("delete", "DHA", 204),
    ],
)
def test_independent_action_permissions(
    app,
    make_animal,
    method,
    permission,
    expected,
):
    animal_id = make_animal()
    activity_id = app.post(url(animal_id), json=payload()).json()["id"]
    endpoint = url(
        animal_id, activity_id if method in {"put", "delete"} else None
    )
    kwargs = {"json": payload()} if method in {"post", "put"} else {}

    def set_permissions(permissions):
        app.app.dependency_overrides[get_current_user] = lambda: TokenData(
            user_id=1,
            email="operator@test.it",
            is_active=True,
            is_superuser=False,
            role="operator",
            permissions=permissions,
        )

    set_permissions(
        [p for p in ["BHA", "CHA", "EHA", "DHA"] if p != permission]
    )
    assert app.request(method, endpoint, **kwargs).status_code == 403
    set_permissions([permission])
    assert app.request(method, endpoint, **kwargs).status_code == expected


def test_authentication_required(app, make_animal):
    animal_id = make_animal()
    app.app.dependency_overrides.pop(get_current_user)
    assert app.get(url(animal_id)).status_code == 401
