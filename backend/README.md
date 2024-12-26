# System dependancies

-   wkhtmltopdf

# Install

## Using Flit

https://flit.pypa.io/

```
flit install -s
```

`-s`is used to install as symlink for development mode

# Dependancies

### wkhtmltopdf

`apt install wkhtmltopdf`

# Build

## Using UV

```
uv build
```

# Testing

1. Create a database `hermadata-test`
2. Create all tables: `alembic -c tests/alembic.ini upgrade head`

# Report Templates

## Static files

To build the stylesheet from the used tailwind classes, use the following command:

```shell
npx tailwindcss build -i hermadata/reports/static/base.css -o hermadata/reports/static/tailwind.css --watch
```
