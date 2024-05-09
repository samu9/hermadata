# System dependancies
- wkhtmltopdf

# Install
## Using Flit
https://flit.pypa.io/
```
flit install -s
```
`-s`is used to install as symlink for development mode

# Build
## Using Flit

```
flit build
```

# Testing
1. Create a database `hermadata-test`
2. Create all tables: `alembic -c tests/alembic.ini upgrade head`