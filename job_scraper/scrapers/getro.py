"""Getro-based VC job boards scraper."""

import logging
import re
from datetime import date, timedelta
from typing import List, Optional
from urllib.parse import urljoin, urlencode

from job_scraper.config import GETRO_URLS
from job_scraper.scrapers.base import BaseScraper, Job

logger = logging.getLogger(__name__)

ROLE_FILTERS = ["product", "marketing"]
SENIOR_KEYWORDS = [
    "vp", "svp", "cpo", "cmo", "ceo", "chief", "head of", "director",
    "vice president", "managing director", "general manager",
]


def is_senior(title: str) -> bool:
    t = title.lower()
    return any(kw in t for kw in SENIOR_KEYWORDS)


class GetroScraper(BaseScraper):
    def __init__(self):
        super().__init__("Getro")

    def _parse_card(self, card, base_url: str) -> Optional[Job]:
        try:
            title_el = (
                card.select_one("h2, h3, [class*='title'], [class*='job-name']")
            )
            if not title_el:
                return None
            title = title_el.get_text(strip=True)
            if not title:
                return None

            link_el = card.find("a", href=True)
            if not link_el:
                return None
            href = link_el.get("href", "")
            url = href if href.startswith("http") else urljoin(base_url, href)

            company_el = card.select_one("[class*='company'], [class*='org'], [class*='employer']")
            company = company_el.get_text(strip=True) if company_el else ""

            loc_el = card.select_one("[class*='location'], [class*='city'], [class*='remote']")
            location = loc_el.get_text(strip=True) if loc_el else ""

            return Job(title=title, company=company, location=location,
                       date_posted=date.today(), url=url, source="Getro-VC", snippet="")
        except Exception as e:
            logger.debug(f"[Getro] Card parse error: {e}")
            return None

    def _scrape_url(self, url: str) -> List[Job]:
        response = self.get(url)
        if not response:
            return []
        soup = self.parse_html(response.text)
        cards = (
            soup.select("li[class*='job'], div[class*='job'], article")
            or soup.select("[class*='opportunity'], [class*='position']")
        )
        base = "/".join(url.split("/")[:3])
        return [j for j in (self._parse_card(c, base) for c in cards) if j]

    def scrape(self) -> List[Job]:
        all_jobs: List[Job] = []
        seen: set = set()

        for base_url in GETRO_URLS:
            for role in ROLE_FILTERS + [None]:
                url = f"{base_url}?role={role}" if role else base_url
                logger.info(f"[Getro] Scraping: {url}")
                jobs = self._scrape_url(url)
                for j in jobs:
                    if j.url not in seen and is_senior(j.title):
                        seen.add(j.url)
                        all_jobs.append(j)

        return all_jobs
