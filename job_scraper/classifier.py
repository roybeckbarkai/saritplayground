"""Optional AI classifier for ambiguous job titles using Claude API."""

import logging
import os
from typing import List, Optional

from job_scraper.config import WORLDS
from job_scraper.scrapers.base import Job

logger = logging.getLogger(__name__)

CLASSIFICATION_PROMPT = """You are classifying Israeli job titles into one of three categories.

Categories:
1 = Product Management & Innovation (VP Product, CPO, Head of Product, Head of Innovation, etc.)
2 = Marketing & Digital (VP Marketing, CMO, Head of Digital, Digital Products Manager, etc.)
3 = CEO / General Management (CEO, Managing Director, General Manager, Business Unit Head, etc.)
0 = None of the above

Job title: "{title}"
Company context: "{company}"

Reply with ONLY the number (0, 1, 2, or 3). No explanation."""


def classify_with_ai(jobs: List[Job]) -> List[Job]:
    """Use Claude to classify jobs that have world=None. Requires ANTHROPIC_API_KEY."""
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        logger.debug("ANTHROPIC_API_KEY not set, skipping AI classification")
        return jobs

    unclassified = [j for j in jobs if j.world is None]
    if not unclassified:
        return jobs

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
    except ImportError:
        logger.warning("anthropic package not installed, skipping AI classification")
        return jobs

    classified_count = 0
    for job in unclassified:
        try:
            prompt = CLASSIFICATION_PROMPT.format(title=job.title, company=job.company)
            message = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=10,
                messages=[{"role": "user", "content": prompt}],
            )
            result = message.content[0].text.strip()
            world = int(result) if result in ("1", "2", "3") else None
            if world:
                job.world = world
                classified_count += 1
        except Exception as e:
            logger.debug(f"AI classification failed for '{job.title}': {e}")

    logger.info(f"AI classified {classified_count}/{len(unclassified)} ambiguous jobs")
    # Return only jobs that now have a world assigned
    return [j for j in jobs if j.world is not None]
