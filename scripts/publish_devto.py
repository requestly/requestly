#!/usr/bin/env python3
"""
Simple DEV.to publisher helper.

Usage:
  DEVTO_API_KEY=your_key python3 scripts/publish_devto.py docs/requestly-local-workspace.md

Notes:
- This script uses only the Python stdlib so it should work in most environments.
- It publishes the provided markdown as a DEV.to article. It will create a new article (not update an existing one).
- Set the environment variable DEVTO_API_KEY before running.
"""
import os
import sys
import json
import urllib.request
import urllib.error

API_URL = 'https://dev.to/api/articles'

def read_markdown(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def publish(api_key, title, body_markdown, tags=None, published=True):
    payload = {
        'article': {
            'title': title,
            'body_markdown': body_markdown,
            'published': published,
            'tags': tags or []
        }
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(API_URL, data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('api-key', api_key)
    try:
        with urllib.request.urlopen(req) as resp:
            res = resp.read().decode('utf-8')
            return json.loads(res)
    except urllib.error.HTTPError as e:
        print('HTTP error:', e.code, e.read().decode('utf-8'))
        raise
    except Exception as e:
        print('Error publishing:', e)
        raise

def guess_title(markdown):
    for line in markdown.splitlines():
        if line.strip().startswith('#'):
            return line.lstrip('#').strip()
    return 'Requestly Local Workspace'

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: DEVTO_API_KEY=your_key python3 scripts/publish_devto.py path/to/article.md')
        sys.exit(2)
    api_key = os.environ.get('DEVTO_API_KEY')
    if not api_key:
        print('Error: DEVTO_API_KEY environment variable is not set')
        sys.exit(2)
    md_path = sys.argv[1]
    if not os.path.exists(md_path):
        print('Error: file not found:', md_path)
        sys.exit(2)
    md = read_markdown(md_path)
    title = guess_title(md)
    tags = ['requestly', 'local-workspace', 'tutorial', 'api']
    print('Publishing', title)
    res = publish(api_key, title, md, tags=tags, published=True)
    print('Published!')
    print(json.dumps(res, indent=2))
