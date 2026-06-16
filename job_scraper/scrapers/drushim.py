"""Drushim.co.il scraper - senior/management category."""

import logging
import re
from datetime import date, timedelta
from typing import List, Optional
from urllib.parse import urljoin

from job_scraper.config import DRUSHIM_CATEGORY_URL, DRUSHIM_SEARCH_URL, ALLJOBS_SEARCH_TERMS
from job_scraper.scrapers.base import BaseScraper, Job

logger = logging.getLogger(__name__)
DRUSHIM_BASE = "https://www.drushim.co.il"

DRUSHIM_KEYWORDS = [
    "מנכ\"ל", "VP Product", "CPO", "CMO", "VP Marketing",
    "סמנכ\"ל מוצר", "סמנכ\"ל שיווק", "Head of Product", "Head of Digital",
    "מנהל מוצר", "מנהל דיגיטל", "CEO",
]


def parse_hebrew_date(raw: str) -> Optional[date]:
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
    if "שעה" in raw or "דקה" in raw or "עכשיו" in raw or "היום" in raw:
        return today
    if "אתמול" in raw:
        return today - timedelta(days=1)
    if "יום" in raw or "ימים" in raw:
        n = re.search(r"(\d+)", raw)
        return today - timedelta(days=int(n.group(1)) if n else 1)
    if "שבוע" in raw or "שבועות" in raw:
        n = re.search(r"(\d+)", raw)
        return today - timedelta(weeks=int(n.group(1)) if n else 1)
    if "חודש" in raw or "חודשים" in raw:
        n = re.search(r"(\d+)", raw)
        return today - timedelta(days=30 * (int(n.group(1)) if n else 1))
    return today


class DrushimScraper(BaseScraper):
    def __init__(self):
        super().__init__("Drushim")

    def _parse_card(self, card) -> Optional[Job]:
        try:
            title_el = (
                card.select_one("a.job-title")
                or card.select_one("h2 a")
                or card.select_one("h3 a")
                or card.find("a", href=re.compile(r"/job/\d+", re.I))
            )
            if not title_el:
                return None
            title = title_el.get_text(strip=True)
            href = title_el.get("href", "")
            if not href:
                return None
            url = href if href.startswith("http") else urljoin(DRUSHIM_BASE, href)

            company_el = card.select_one(".company-name, .jobCompany, [class*='company']")
            company = company_el.get_text(strip=True) if company_el else ""

            loc_el = card.select_one(".job-location, .jobLocation, [class*='location'], [class*='city']")
            location = loc_el.get_text(strip=True) if loc_el else ""

            date_el = card.select_one(".job-date, .jobDate, time, [class*='date']")
            raw_date = date_el.get_text(strip=True) if date_el else ""
            date_posted = parse_hebrew_date(raw_date)

            snippet_el = card.select_one(".job-description, .jobDesc, [class*='desc'], [class*='summary']")
            snippet = snippet_el.get_text(strip=True)[:300] if snippet_el else ""

            return Job(title=title, company=company, location=location,
                       date_posted=date_posted, url=url, source="Drushim", snippet=snippet)
        except Exception as e:
            logger.debug(f"[Drushim] Card parse error: {e}")
            return None

    def _scrape_url(self, url: str, params: Optional[dict] = None) -> List[Job]:
        response = self.get(url, params=params)
        if not response:
            return []
        soup = self.parse_html(response.text)
        cards = (
            soup.select("div.job-item, article.job-item, li.job-item")
            or soup.select("div[class*='job-card'], li[class*='job-item']")
            or soup.select("[class*='job']")
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

        # Senior/management category (paginate 3 pages)
        logger.info("[Drushim] Scraping /jobs/cat2/ ...")
        add(self._scrape_url(DRUSHIM_CATEGORY_URL))
        for page in range(2, 4):
            jobs = self._scrape_url(f"{DRUSHIM_CATEGORY_URL}{page}/")
            if not jobs:
                break
            add(jobs)

        # Keyword searches
        for term in DRUSHIM_KEYWORDS:
            logger.info(f"[Drushim] Searching: {term}")
            add(self._scrape_url(DRUSHIM_SEARCH_URL, params={"q": term, "Range": 3}))

        return all_jobs
