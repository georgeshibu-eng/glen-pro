from backend.server import app, run_dev


# Render uses `gunicorn server:app`, so this must expose `app`.
# Locally you can run `python server.py`.
if __name__ == "__main__":
    run_dev()

