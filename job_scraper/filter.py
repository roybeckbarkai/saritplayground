"""Keyword-based job title filter - assigns world 1/2/3 or None."""

from typing import List, Optional

from job_scraper.config import WORLDS
from job_scraper.scrapers.base import Job


def _matches(text: str, keywords: List[str]) -> bool:
    t = text.lower()
    return any(kw.lower() in t for kw in keywords)


def classify_job(job: Job) -> Optional[int]:
    """Return world number (1/2/3) or None if no match."""
    for world_id, world_data in WORLDS.items():
        if _matches(job.title, world_data["keywords"]):
            return world_id
    return None


def filter_jobs(jobs: List[Job]) -> List[Job]:
    """Filter and classify jobs. Returns only matched jobs with world set."""
    matched = []
    for job in jobs:
        world = classify_job(job)
        if world is not None:
            job.world = world
            matched.append(job)
    return matched
