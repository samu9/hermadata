# Get Started

## 1. Install system dependancies

```
apt install pango1.0-tools
```

## 2. Install the project (using uv)

1. [Install uv](https://docs.astral.sh/uv/getting-started/installation/)

2. Install all dependancies
    ```
    uv sync
    ```

## 3. Create the database

1. Create a MySQL database called `hermadata`
2. Create all tables
    ```
    alembic alembic.ini upgrade head
    ```

## 4. Setup AWS profile (optional)

If you want to use AWS S3 storage for generated documents storage, you need to setup your aws profile

## 3. Start the project

# Build (using uv)

```
uv build
```

# Testing

1. Create a database `hermadata-test`
2. Create all tables
    ```
    alembic -c tests/alembic.ini upgrade head
    ```
3. Install `pytest`
    ```
    uv add --dev pytest
    ```
4. Run:
    ```
    pytest
    ```

# Report Templates

## Static files

To build the stylesheet from the used tailwind classes, use the following command:

```shell
npx tailwindcss build -i hermadata/reports/static/base.css -o hermadata/reports/static/tailwind.css --watch
```
