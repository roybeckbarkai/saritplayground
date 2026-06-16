"""SQLite deduplication layer - tracks which jobs have been sent."""

import logging
import os
import sqlite3
from datetime import date
from pathlib import Path
from typing import List

from job_scraper.scrapers.base import Job

logger = logging.getLogger(__name__)

DEFAULT_DB_PATH = Path.home() / ".job_scraper" / "seen_jobs.db"


def get_db_path() -> Path:
    path = Path(os.environ.get("DB_PATH", DEFAULT_DB_PATH))
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def get_connection() -> sqlite3.Connection:
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS seen_jobs (
            url TEXT PRIMARY KEY,
            title TEXT,
            company TEXT,
            source TEXT,
            world INTEGER,
            first_seen DATE,
            sent_date DATE
        )
    """)
    conn.commit()
    return conn


def filter_new(jobs: List[Job]) -> List[Job]:
    """Return only jobs not previously seen."""
    if not jobs:
        return []
    conn = get_connection()
    try:
        urls = [j.url for j in jobs]
        placeholders = ",".join("?" * len(urls))
        seen = set(
            row[0] for row in
            conn.execute(f"SELECT url FROM seen_jobs WHERE url IN ({placeholders})", urls)
        )
        return [j for j in jobs if j.url not in seen]
    finally:
        conn.close()


def mark_sent(jobs: List[Job]) -> None:
    """Insert jobs into seen_jobs DB."""
    if not jobs:
        return
    conn = get_connection()
    today = date.today().isoformat()
    try:
        conn.executemany(
            "INSERT OR IGNORE INTO seen_jobs (url, title, company, source, world, first_seen, sent_date) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            [(j.url, j.title, j.company, j.source, j.world, today, today) for j in jobs]
        )
        conn.commit()
    finally:
        conn.close()
