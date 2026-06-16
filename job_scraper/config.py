"""Configuration for the job scraper system."""

WORLDS = {
    1: {
        "name": "Product Management & Innovation",
        "name_he": "ניהול מוצר וחדשנות",
        "keywords": [
            "VP Product", "SVP Product", "CPO", "Chief Product Officer",
            "מנהל מוצר", "סמנכ\"ל מוצר", "Head of Product", "Director of Product",
            "Head of Innovation", "VP Innovation", "Director of Innovation",
            "מנהל חדשנות", "ראש תחום מוצר", "מנהל אגף מוצר",
            "Head of Product Development", "Director of Product Development",
        ],
    },
    2: {
        "name": "Marketing & Digital",
        "name_he": "שיווק ודיגיטל",
        "keywords": [
            "VP Marketing", "SVP Marketing", "CMO", "Chief Marketing Officer",
            "סמנכ\"ל שיווק", "Head of Digital", "VP Digital", "מנהל דיגיטל",
            "Digital Products Manager", "מנהל נכסים דיגיטליים",
            "VP Marketing & New Products", "מנהל שיווק ודיגיטל",
            "סמנכ\"ל שיווק ודיגיטל", "סמנכ\"ל שיווק ומוצרים חדשים",
        ],
    },
    3: {
        "name": "CEO / General Management",
        "name_he": "מנכ\"ל וניהול כללי",
        "keywords": [
            "CEO", "Chief Executive Officer", "מנכ\"ל", "Managing Director",
            "General Manager", "Head of Business Unit", "Business Unit Manager",
            "מנהל יחידה עסקית", "מנהל כללי",
        ],
    },
}

# AllJobs numeric position codes
ALLJOBS_POSITION_CODES = [
    1156,  # מנהל מוצר - תוכנה
    514,   # מנהל מוצר בשיווק
    # TODO: find codes for VP Marketing, CEO, Head of Digital
]

ALLJOBS_SEARCH_TERMS = [
    "VP Product", "CPO", "CMO", "VP Marketing", "CEO",
    "מנהל מוצר", "מנכ\"ל", "סמנכ\"ל שיווק", "סמנכ\"ל מוצר",
    "Head of Product", "Head of Digital",
]

ALLJOBS_BASE_URL = "https://www.alljobs.co.il/SearchResultsGuest.aspx"
DRUSHIM_CATEGORY_URL = "https://www.drushim.co.il/jobs/cat2/"
DRUSHIM_SEARCH_URL = "https://www.drushim.co.il/jobs/search/"
ETHOSIA_URL = "https://www.ethosia.co.il/job-categories/%D7%91%D7%9B%D7%99%D7%A8%D7%99%D7%9D/"
GETRO_URLS = [
    "https://jobsinvc.getro.com/jobs",
    "https://israelvcforum.getro.com/jobs",
]

REQUEST_DELAY = 1.5

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}
