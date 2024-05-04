# System dependancies
- wkhtmltopdf

# Install
## Using Flit
https://flit.pypa.io/
```
flit install -s
```
# Build
## Using Flit

```
flit build
```

# Testing
1. Create a database `hermadata-test`
2. Create all tables: `alembic -c tests/alembic.ini upgrade head`