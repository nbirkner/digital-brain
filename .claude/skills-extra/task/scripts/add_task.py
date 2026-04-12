#!/usr/bin/env python3
"""Add a task to Niki's personal Notion Tasks database."""

import argparse
import json
import os
import sys
from pathlib import Path

import requests

TASKS_DB = "2a82f4d2-943e-8112-9a73-f743c0fcf750"
NIKI_USER_ID = "d2981481-6c75-456b-ab4a-5dcfd8db938b"
NOTION_BASE = "https://api.notion.com/v1"
ENV_FILE = Path(__file__).parents[4] / "automations/meeting-summary/.env"


def load_api_key() -> str:
    key = os.environ.get("NOTION_PERSONAL_API_KEY")
    if key:
        return key
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("NOTION_PERSONAL_API_KEY="):
                return line.split("=", 1)[1].strip()
    print("ERROR: NOTION_PERSONAL_API_KEY not found", file=sys.stderr)
    sys.exit(1)


def _paragraph(text: str) -> dict:
    return {
        "object": "block",
        "type": "paragraph",
        "paragraph": {"rich_text": [{"type": "text", "text": {"content": text[:2000]}}]},
    }


def _todo(text: str) -> dict:
    return {
        "object": "block",
        "type": "to_do",
        "to_do": {
            "rich_text": [{"type": "text", "text": {"content": text[:2000]}}],
            "checked": False,
        },
    }


def search_existing(title: str, api_key: str) -> list[dict]:
    """Return tasks whose title is semantically close to the given title."""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }
    resp = requests.post(
        f"{NOTION_BASE}/databases/{TASKS_DB}/query",
        headers=headers,
        json={"page_size": 100},
        timeout=30,
    )
    if not resp.ok:
        return []
    pages = resp.json().get("results", [])
    title_lower = title.lower()
    keywords = set(w for w in title_lower.split() if len(w) > 3)
    matches = []
    for page in pages:
        name_parts = page.get("properties", {}).get("Task name", {}).get("title", [])
        page_title = "".join(p.get("plain_text", "") for p in name_parts).lower()
        page_keywords = set(w for w in page_title.split() if len(w) > 3)
        overlap = keywords & page_keywords
        if len(overlap) >= max(2, len(keywords) // 2):
            page_id = page["id"].replace("-", "")
            matches.append({"title": page_title, "url": f"https://www.notion.so/{page_id}"})
    return matches


def create_task(title: str, description: str | None, subtasks: list[str],
                due: str | None, tag: str | None, name: str | None = None,
                no_assignee: bool = False) -> dict:
    api_key = load_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }

    properties = {
        "Task name": {"title": [{"text": {"content": title[:255]}}]},
        "Status": {"status": {"name": "📥 Triage"}},
    }
    if not no_assignee:
        properties["Assignee"] = {"people": [{"object": "user", "id": NIKI_USER_ID}]}

    if due:
        properties["Due date"] = {"date": {"start": due}}

    if tag:
        properties["Tags"] = {"multi_select": [{"name": tag}]}

    if name:
        properties["Name"] = {"rich_text": [{"text": {"content": name}}]}

    # Build page body blocks
    children = []
    if description:
        children.append(_paragraph(description))
    for item in subtasks:
        children.append(_todo(item))

    payload = {"parent": {"database_id": TASKS_DB}, "properties": properties}
    if children:
        payload["children"] = children

    resp = requests.post(f"{NOTION_BASE}/pages", headers=headers, json=payload, timeout=30)

    if not resp.ok:
        print(f"ERROR: Notion API {resp.status_code}: {resp.text[:300]}", file=sys.stderr)
        sys.exit(1)

    return resp.json()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--title", required=True)
    parser.add_argument("--description", default=None)
    parser.add_argument("--subtask", action="append", default=[], dest="subtasks")
    parser.add_argument("--due", default=None)
    parser.add_argument("--tag", choices=["Work", "Personal"], default=None)
    parser.add_argument("--name", default=None)
    parser.add_argument("--no-assignee", action="store_true", default=False)
    args = parser.parse_args()

    api_key = load_api_key()
    dupes = search_existing(args.title, api_key)
    if dupes:
        print(json.dumps({"dupes": dupes, "title": args.title}))
        return

    page = create_task(args.title, args.description, args.subtasks, args.due, args.tag, args.name, args.no_assignee)
    page_id = page["id"].replace("-", "")
    url = f"https://www.notion.so/{page_id}"
    print(json.dumps({"url": url, "title": args.title}))


if __name__ == "__main__":
    main()
