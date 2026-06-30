#!/usr/bin/env python3
"""Regenerate and save both score-digit axes for the test week."""

import json
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

week_id = sys.argv[1] if len(sys.argv) > 1 else "2026-01"
WEEK_PATH = Path(__file__).parent.parent / "data" / "weeks" / f"week-{week_id}.json"

if not WEEK_PATH.exists():
    raise SystemExit(f"Unknown week: {week_id}")


def shuffled_digits():
    digits = list(range(10))
    # Each call shuffles a fresh list, so the Eagles and opponent axes are
    # generated independently. The result is saved to the week JSON file.
    random.SystemRandom().shuffle(digits)
    return digits


week = json.loads(WEEK_PATH.read_text(encoding="utf-8"))
week["eagles_digits"] = shuffled_digits()
week["opponent_digits"] = shuffled_digits()
week["digits_generated_at"] = datetime.now(timezone.utc).isoformat()
WEEK_PATH.write_text(f"{json.dumps(week, indent=2)}\n", encoding="utf-8")

print(f"Regenerated saved digits for Week {week['week']}: {WEEK_PATH}")
