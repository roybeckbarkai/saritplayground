"""Base scraper class and Job dataclass."""

import logging
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from typing import List, Optional

import requests
from bs4 import BeautifulSoup

from job_scraper.config import DEFAULT_HEADERS, REQUEST_DELAY

logger = logging.getLogger(__name__)


@dataclass
class Job:
    title: str
    company: str
    location: str
    date_posted: Optional[date]
    url: str
    source: str
    snippet: str = ""
    world: Optional[int] = None

    def __post_init__(self):
        self.title = self.title.strip()
        self.company = self.company.strip()
        self.location = self.location.strip()
        self.snippet = self.snippet.strip()


class BaseScraper(ABC):
    def __init__(self, name: str):
        self.name = name
        self.session = requests.Session()
        self.session.headers.update(DEFAULT_HEADERS)

    def get(self, url: str, params: Optional[dict] = None, timeout: int = 15) -> Optional[requests.Response]:
        try:
            time.sleep(REQUEST_DELAY)
            r = self.session.get(url, params=params, timeout=timeout)
            r.raise_for_status()
            r.encoding = "utf-8"
            return r
        except requests.exceptions.RequestException as e:
            logger.error(f"[{self.name}] Request failed for {url}: {e}")
            return None

    def parse_html(self, html: str) -> BeautifulSoup:
        return BeautifulSoup(html, "lxml")

    @abstractmethod
    def scrape(self) -> List[Job]:
        pass

    def safe_scrape(self) -> List[Job]:
        try:
            jobs = self.scrape()
            logger.info(f"[{self.name}] Found {len(jobs)} jobs")
            return jobs
        except Exception as e:
            logger.error(f"[{self.name}] Unexpected error: {e}", exc_info=True)
            return []
