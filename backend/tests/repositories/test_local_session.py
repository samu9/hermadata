from threading import Thread

import pytest
from hermadata.repositories import SQLBaseRepository
from sqlalchemy.orm import Session


@pytest.skip()
def test_local_session(db_session: Session):
    repo = SQLBaseRepository()

    sessions = []

    def enter_repo(db_session):
        with repo(db_session):
            sessions.append(repo.session)

    threads = []
    # Set different values for each thread
    values = ["thread1_value", "thread2_value"]

    for i, value in enumerate(values):
        thread = Thread(target=enter_repo, args=(value,))
        threads.append(thread)
        thread.start()

    # Wait for all threads to finish
    for thread in threads:
        thread.join()

    assert sessions
