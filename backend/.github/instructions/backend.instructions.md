---
applyTo: '**'
---

# Project starting instructions
1. Source the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
2. Run uvicorn:
   ```bash
   hermadata.main:app --log-config=hermadata/log-configs.json
   ```

# Commit Message Instructions

When writing commit messages, please follow these guidelines to ensure clarity and consistency:
1. Every commit message should start with "be:" meaning it refers to the backend codebase.