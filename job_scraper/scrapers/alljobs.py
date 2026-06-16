"""AllJobs.co.il scraper."""

import logging
import re
from datetime import date, timedelta
from typing import List, Optional
from urllib.parse import urljoin

from job_scraper.config import ALLJOBS_BASE_URL, ALLJOBS_POSITION_CODES, ALLJOBS_SEARCH_TERMS
from job_scraper.scrapers.base import BaseScraper, Job

logger = logging.getLogger(__name__)
ALLJOBS_BASE = "https://www.alljobs.co.il"


def parse_date(raw: str) -> Optional[date]:
    raw = raw.strip()
    today = date.today()
    if not raw:
        return today
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
    if "ימים" in raw or "יום" in raw:
        n = re.search(r"(\d+)", raw)
        return today - timedelta(days=int(n.group(1)) if n else 1)
    return today


class AllJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__("AllJobs")

    def _parse_card(self, card) -> Optional[Job]:
        try:
            title_el = (
                card.select_one("a.job-title, .job_title a")
                or card.select_one("h2 a, h3 a")
                or card.find("a", href=re.compile(r"/Job/", re.I))
            )
            if not title_el:
                return None
            title = title_el.get_text(strip=True)
            href = title_el.get("href", "")
            if not href:
                return None
            url = href if href.startswith("http") else urljoin(ALLJOBS_BASE, href)

            company_el = card.select_one(".company-name, .job_company, [class*='company']")
            company = company_el.get_text(strip=True) if company_el else ""

            loc_el = card.select_one(".location, .job_location, [class*='location'], [class*='city']")
            location = loc_el.get_text(strip=True) if loc_el else ""

            date_el = card.select_one(".date, .job_date, time, [class*='date']")
            raw_date = date_el.get_text(strip=True) if date_el else ""
            date_posted = parse_date(raw_date)

            snippet_el = card.select_one(".description, .job_description, [class*='desc']")
            snippet = snippet_el.get_text(strip=True)[:300] if snippet_el else ""

            return Job(title=title, company=company, location=location,
                       date_posted=date_posted, url=url, source="AllJobs", snippet=snippet)
        except Exception as e:
            logger.debug(f"[AllJobs] Card parse error: {e}")
            return None

    def _scrape_url(self, url: str, params: Optional[dict] = None) -> List[Job]:
        response = self.get(url, params=params)
        if not response:
            return []
        soup = self.parse_html(response.text)
        cards = (
            soup.select("div.job-item, li.job-item, article.job-item")
            or soup.select("div[class*='job-item'], li[class*='job-item']")
            or soup.select("div[class*='job'], li[class*='job']")
        )
        return [j for j in (self._parse_card(c) for c in cards) if j]

    def scrape(self) -> List[Job]:
        all_jobs: List[Job] = []
        seen: set = set()

        def add(jobs):
            for j in jobs:
                if j.url not in seen:
                    seen.add(j.url)
                    all_jobs.append(j)

        for code in ALLJOBS_POSITION_CODES:
            logger.info(f"[AllJobs] Position code: {code}")
            add(self._scrape_url(ALLJOBS_BASE_URL, params={"position": code, "type": 0}))

        for term in ALLJOBS_SEARCH_TERMS:
            logger.info(f"[AllJobs] Text search: {term}")
            add(self._scrape_url(ALLJOBS_BASE_URL, params={"position": 0, "type": 0, "txt": term}))

        return all_jobs
