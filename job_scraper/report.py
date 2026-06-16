"""HTML email report generator."""

from datetime import date
from typing import List

from job_scraper.config import WORLDS
from job_scraper.scrapers.base import Job


def generate_subject(jobs: List[Job]) -> str:
    today = date.today().strftime("%d/%m/%Y")
    return f"משרות בכירות חדשות - {today} - {len(jobs)} חדשות"


def _job_row(job: Job) -> str:
    date_str = job.date_posted.strftime("%d/%m/%Y") if job.date_posted else ""
    snippet = f"<br><small style='color:#666'>{job.snippet}</small>" if job.snippet else ""
    return f"""
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">
        <a href="{job.url}" style="font-weight:bold;color:#1a73e8;text-decoration:none">{job.title}</a>
        {snippet}
      </td>
      <td style="padding:8px;border-bottom:1px solid #eee">{job.company}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">{job.location}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;white-space:nowrap">{date_str}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">{job.source}</td>
    </tr>"""


def _world_section(world_id: int, jobs: List[Job]) -> str:
    world = WORLDS[world_id]
    rows = "".join(_job_row(j) for j in jobs)
    return f"""
    <h2 style="color:#333;border-bottom:2px solid #1a73e8;padding-bottom:6px">
      עולם {world_id}: {world['name_he']}
    </h2>
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px">
      <thead>
        <tr style="background:#f5f5f5">
          <th style="padding:8px;text-align:right">תפקיד</th>
          <th style="padding:8px;text-align:right">חברה</th>
          <th style="padding:8px;text-align:right">מיקום</th>
          <th style="padding:8px;text-align:right">תאריך</th>
          <th style="padding:8px;text-align:right">מקור</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>"""


def generate_html(jobs: List[Job]) -> str:
    today = date.today().strftime("%d/%m/%Y")
    total = len(jobs)

    by_world = {1: [], 2: [], 3: []}
    for job in jobs:
        if job.world in by_world:
            by_world[job.world].append(job)

    sections = "".join(
        _world_section(wid, wjobs)
        for wid, wjobs in by_world.items()
        if wjobs
    )

    if not sections:
        sections = "<p>לא נמצאו משרות חדשות היום.</p>"

    return f"""<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:Arial,sans-serif;direction:rtl;max-width:900px;margin:0 auto;padding:20px;color:#333">
  <div style="background:#1a73e8;color:white;padding:20px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:22px">🔍 משרות בכירות חדשות</h1>
    <p style="margin:5px 0 0">{today} &nbsp;|&nbsp; {total} משרות חדשות</p>
  </div>
  <div style="background:white;padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px">
    {sections}
    <hr style="border:none;border-top:1px solid #eee;margin-top:30px">
    <p style="color:#999;font-size:12px">
      דוח זה נוצר אוטומטית על ידי Job Scraper Agent.<br>
      לביטול הרשמה או שינוי הגדרות, ערכי את קובץ .env.
    </p>
  </div>
</body>
</html>"""
