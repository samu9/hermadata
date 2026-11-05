module.exports = {
    apps: [
        {
            name: "hermadata-backend",
            cwd: "/opt/hermadata",
            script: "/opt/hermadata/.venv/bin/uvicorn",
            interpreter: "/opt/hermadata/.venv/bin/python",
            args: "hermadata.main:app --log-config=hermadata/log-configs.json --port 8888 --host 0.0.0.0",
            env: {
                ENV_PATH: "/opt/hermadata/.env",
                // boto3 (S3 image storage) uses this named profile from
                // ~/.aws/credentials. Read from the process env, NOT .prod.env.
                AWS_PROFILE: "hermadata",
            },
        },
    ],
}
