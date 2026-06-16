"""Ethosia.co.il scraper - senior positions category."""

import logging
import re
from datetime import date, timedelta
from typing import List, Optional
from urllib.parse import urljoin

from job_scraper.config import ETHOSIA_URL
from job_scraper.scrapers.base import BaseScraper, Job

logger = logging.getLogger(__name__)
ETHOSIA_BASE = "https://www.ethosia.co.il"


def parse_date(raw: str) -> Optional[date]:
    raw = raw.strip()
    today = date.today()
    m = re.search(r"(\d{1,2})[./](\d{1,2})[./](\d{4})", raw)
    if m:
        try:
            return date(int(m.group(3)), int(m.group(2)), int(m.group(1)))
        except ValueError:
            pass
    if "היום" in raw or "שעה" in raw:
        return today
    if "אתמול" in raw:
        return today - timedelta(days=1)
    if "יום" in raw or "ימים" in raw:
        n = re.search(r"(\d+)", raw)
        return today - timedelta(days=int(n.group(1)) if n else 1)
    return today


class EthosiaScraper(BaseScraper):
    def __init__(self):
        super().__init__("Ethosia")

    def _parse_card(self, card) -> Optional[Job]:
        try:
            title_el = (
                card.select_one("h2 a, h3 a, .job-title a, a.job-link")
                or card.find("a", href=re.compile(r"/job", re.I))
            )
            if not title_el:
                return None
            title = title_el.get_text(strip=True)
            href = title_el.get("href", "")
            if not href:
                return None
            url = href if href.startswith("http") else urljoin(ETHOSIA_BASE, href)

            company_el = card.select_one("[class*='company'], [class*='employer']")
            company = company_el.get_text(strip=True) if company_el else ""

            loc_el = card.select_one("[class*='location'], [class*='city'], [class*='place']")
            location = loc_el.get_text(strip=True) if loc_el else ""

            date_el = card.select_one("time, [class*='date'], [class*='time']")
            raw_date = (date_el.get("datetime") or date_el.get_text(strip=True)) if date_el else ""
            date_posted = parse_date(raw_date)

            snippet_el = card.select_one("[class*='desc'], [class*='summary'], p")
            snippet = snippet_el.get_text(strip=True)[:300] if snippet_el else ""

            return Job(title=title, company=company, location=location,
                       date_posted=date_posted, url=url, source="Ethosia", snippet=snippet)
        except Exception as e:
            logger.debug(f"[Ethosia] Card parse error: {e}")
            return None

    def scrape(self) -> List[Job]:
        logger.info("[Ethosia] Scraping senior positions category...")
        response = self.get(ETHOSIA_URL)
        if not response:
            return []

        soup = self.parse_html(response.text)
        cards = (
            soup.select("article.job, div.job-item, li.job")
            or soup.select("[class*='job-card'], [class*='job-item']")
            or soup.select("article, .job")
        )

        jobs = [j for j in (self._parse_card(c) for c in cards) if j]

        # Paginate up to 3 pages
        for page in range(2, 4):
            resp = self.get(f"{ETHOSIA_URL}page/{page}/")
            if not resp:
                break
            soup = self.parse_html(resp.text)
            page_cards = (
                soup.select("article.job, div.job-item, li.job")
                or soup.select("[class*='job-card'], [class*='job-item']")
            )
            page_jobs = [j for j in (self._parse_card(c) for c in page_cards) if j]
            if not page_jobs:
                break
            jobs.extend(page_jobs)

        return jobs
