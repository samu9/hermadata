#!/usr/bin/env python3
"""
Script to create a test super user for development/testing purposes.
Run this script to create a user you can test with.
"""

from hermadata.initializations import user_service
from hermadata.services.user_service import RegisterUserModel
from hermadata.dependancies import get_session_maker


def create_test_user():
    """Create a test super user"""
    email = "admin@hermadata.com"
    password = "admin123"

    try:
        sessionmaker = get_session_maker()
        with sessionmaker() as session:
            # Initialize the user service with a session
            service = user_service(session)

            # Register a new user
            user_data = RegisterUserModel(email=email, password=password)
            user_id = service.register(user_data)

            # Update the user to be a superuser
            from hermadata.repositories.user_repository import UpdateUserModel

            service.user_repository.update(user_id, UpdateUserModel(is_superuser=True, is_active=True))
            session.commit()

            print(f"✅ Created test super user:")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print(f"   Super User: Yes")
            print(f"   User ID: {user_id}")

    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        print("This might be because the user already exists or database is not set up.")


if __name__ == "__main__":
    create_test_user()
