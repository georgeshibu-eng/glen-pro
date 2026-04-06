import re

from flask import Flask, jsonify, render_template, request

from .database import create_contact, get_contacts, get_visitors, increment_visitors, init_db


app = Flask(__name__, template_folder="templates", static_folder="static")


def _to_contact_json(c):
    created_at = getattr(c, "created_at", None)
    # SQLAlchemy may return a naive datetime depending on backend.
    created_at_str = created_at.isoformat() if created_at is not None else None
    return {
        "name": c.name,
        "email": c.email,
        "message": c.message,
        "created_at": created_at_str,
    }


init_db()


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/admin", methods=["GET"])
def admin():
    contacts = get_contacts()
    visitors = get_visitors()
    return render_template("admin.html", contacts=contacts, visitors=visitors)


@app.route("/api/health", methods=["GET"])
def api_health():
    return jsonify({"status": "ok"})


@app.route("/api/contact", methods=["POST"])
def api_contact():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    # Basic server-side validation to match the frontend.
    if not name or not email or not message:
        return jsonify({"error": "name, email, and message are required"}), 400

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"error": "invalid email"}), 400

    try:
        contact = create_contact(name=name, email=email, message=message)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({"ok": True, "contact": _to_contact_json(contact)}), 201


@app.route("/api/contacts", methods=["GET"])
def api_contacts():
    contacts = get_contacts()
    return jsonify({"contacts": [_to_contact_json(c) for c in contacts]})


@app.route("/api/visit", methods=["POST"])
def api_visit():
    visitors = increment_visitors()
    return jsonify({"visitors": visitors})


@app.route("/api/visitors", methods=["GET"])
def api_visitors():
    visitors = get_visitors()
    return jsonify({"visitors": visitors})


def run_dev():
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    run_dev()

