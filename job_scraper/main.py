"""Main orchestrator - runs the full job scraping pipeline."""

import logging
import os
import sys
from datetime import date

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


def run():
    from job_scraper.scrapers.drushim import DrushimScraper
    from job_scraper.scrapers.alljobs import AllJobsScraper
    from job_scraper.scrapers.ethosia import EthosiaScraper
    from job_scraper.scrapers.getro import GetroScraper
    from job_scraper.filter import filter_jobs
    from job_scraper.classifier import classify_with_ai
    from job_scraper.dedup import filter_new, mark_sent
    from job_scraper.report import generate_html, generate_subject
    from job_scraper.email_sender import send_email

    logger.info("=== Job Scraper Pipeline starting ===")

    # 1. Scrape all sources
    scrapers = [
        DrushimScraper(),
        AllJobsScraper(),
        EthosiaScraper(),
        GetroScraper(),
    ]

    all_jobs = []
    for scraper in scrapers:
        jobs = scraper.safe_scrape()
        all_jobs.extend(jobs)
        logger.info(f"[{scraper.name}] → {len(jobs)} raw jobs")

    logger.info(f"Total raw jobs: {len(all_jobs)}")

    # 2. Keyword filter
    matched = filter_jobs(all_jobs)
    logger.info(f"After keyword filter: {len(matched)} jobs")

    # 3. AI classification for unclassified (optional)
    matched = classify_with_ai(matched)
    logger.info(f"After AI classification: {len(matched)} jobs")

    # 4. Dedup - keep only new ones
    new_jobs = filter_new(matched)
    logger.info(f"New jobs (not seen before): {len(new_jobs)}")

    if not new_jobs:
        logger.info("No new jobs today. Skipping email.")
        return

    # 5. Generate and send email
    subject = generate_subject(new_jobs)
    html = generate_html(new_jobs)

    dry_run = os.environ.get("DRY_RUN", "").lower() in ("1", "true", "yes")
    if dry_run:
        logger.info(f"DRY_RUN mode - would send: {subject}")
        print(html)
    else:
        sent = send_email(subject, html)
        if sent:
            # 6. Mark as sent only after successful email
            mark_sent(new_jobs)
            logger.info(f"Marked {len(new_jobs)} jobs as sent")
        else:
            logger.error("Email failed - not marking jobs as sent (will retry next run)")

    logger.info("=== Pipeline complete ===")


if __name__ == "__main__":
    run()
