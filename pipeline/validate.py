#!/usr/bin/env python3
"""Validate lane: website liveness checks (spec docs/spec.md §6, tasks.md T07).

stdin:  TSV lines of  organization_id<TAB>website_url
stdout: TSV lines of  organization_id<TAB>ok<TAB>http_status<TAB>detail

Stdlib only (no installs). HEAD first, GET fallback (many small-nonprofit hosts
reject HEAD). On SSL certificate failure, retries unverified and reports the
site as alive-but-insecure rather than dead — cert hygiene goes to the review
queue as detail, not as a false "this program is gone".
"""

import ssl
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

TIMEOUT = 12
THREADS = 24
UA = ("Mozilla/5.0 (compatible; ASNM-validate/1.0; "
      "+https://github.com/adaptivesportsnearme/asnm)")


def fetch(url: str, method: str, context: ssl.SSLContext | None):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=TIMEOUT, context=context)


def check(org_id: str, url: str) -> tuple[str, bool, int | None, str]:
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    for method in ("HEAD", "GET"):
        try:
            with fetch(url, method, None) as r:
                return org_id, True, r.status, ""
        except urllib.error.HTTPError as e:
            if method == "GET" or e.code not in (403, 405, 501):
                return org_id, e.code < 400 or e.code in (401, 403), e.code, f"http-{e.code}"
        except ssl.SSLError:
            try:
                insecure = ssl.create_default_context()
                insecure.check_hostname = False
                insecure.verify_mode = ssl.CERT_NONE
                with fetch(url, "GET", insecure) as r:
                    return org_id, True, r.status, "insecure-ssl"
            except Exception as e2:  # noqa: BLE001
                return org_id, False, None, f"ssl:{type(e2).__name__}"
        except Exception as e:  # noqa: BLE001
            if method == "GET":
                return org_id, False, None, f"{type(e).__name__}: {str(e)[:80]}"
    return org_id, False, None, "unreachable"


def main() -> None:
    rows = [line.rstrip("\n").split("\t") for line in sys.stdin if "\t" in line]
    with ThreadPoolExecutor(max_workers=THREADS) as pool:
        for org_id, ok, status, detail in pool.map(lambda r: check(r[0], r[1]), rows):
            print(f"{org_id}\t{'t' if ok else 'f'}\t{status if status is not None else ''}\t{detail}")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
