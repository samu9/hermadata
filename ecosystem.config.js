module.exports = {
    apps: [
        {
            name: "hermadata-backend",
            script: "uvicorn",
            cwd: "/opt/hermadata",
            interpreter: ".venv/bin/pyhton",
            args: "hermadata.main:app --log-config=log-configs.json --port 8888 --host 0.0.0.0",
        },
    ],
}
