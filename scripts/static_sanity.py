#!/usr/bin/env python3
"""Dependency-free repository checks for mistakes that should never reach a PR."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_DIRS = {'.git', 'node_modules', 'dist', 'build', '.dart_tool', 'coverage'}
TEXT_SUFFIXES = {'.ts', '.tsx', '.js', '.dart', '.yaml', '.yml', '.json', '.md', '.xml', '.kt', '.kts', '.sql'}
errors: list[str] = []


def text_files():
    for path in ROOT.rglob('*'):
        if not path.is_file() or any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        if path.suffix.lower() in TEXT_SUFFIXES or path.name in {'Dockerfile', '.gitignore'}:
            yield path


active_code = [p for p in text_files() if any(part in {'node_backend', 'econoway_app', 'web_frontend'} for part in p.parts)]
forbidden = {
    'JWT fallback dev_secret': re.compile(r"dev_secret", re.I),
    'legacy hardcoded JWT secret': re.compile(r"CHAVE_SECRETA_DO_ECONOWAY"),
    'hardcoded LAN API in Flutter': re.compile(r"192\.168\.\d{1,3}\.\d{1,3}:3333"),
    'legacy SharedPreferences token storage': re.compile(r"SharedPreferences"),
    'browser JWT persisted in localStorage': re.compile(r"localStorage\.setItem\([^\n]*(token|jwt)", re.I),
    'token printed to log': re.compile(r"(?:print|console\.log)\([^\n]*(TOKEN|jwt_token|Bearer \\$token)", re.I),
}

for path in active_code:
    try:
        data = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    for label, pattern in forbidden.items():
        if pattern.search(data):
            errors.append(f'{label}: {path.relative_to(ROOT)}')

for path in text_files():
    try:
        data = path.read_text(encoding='utf-8')
    except UnicodeDecodeError:
        continue
    if re.search(r'^(<<<<<<<|=======|>>>>>>>)', data, re.M):
        errors.append(f'Git conflict marker: {path.relative_to(ROOT)}')


# Controllers devem permanecer na camada HTTP; acesso SQL direto pertence a services/repositories.
controllers_dir = ROOT / 'node_backend' / 'src' / 'controllers'
if controllers_dir.exists():
    for path in controllers_dir.glob('*.ts'):
        data = path.read_text(encoding='utf-8')
        if re.search(r"from ['\"]\.\./database['\"]", data) or 'pool.query' in data or 'pool.connect' in data:
            errors.append(f'Controller accesses database directly: {path.relative_to(ROOT)}')
        if 'console.error(' in data or 'console.log(' in data:
            errors.append(f'Controller bypasses structured logger: {path.relative_to(ROOT)}')

manifest = ROOT / 'econoway_app/android/app/src/main/AndroidManifest.xml'
if not manifest.exists() or 'android:usesCleartextTraffic="false"' not in manifest.read_text(encoding='utf-8'):
    errors.append('Android main manifest must explicitly disable cleartext traffic.')

openapi = ROOT / 'docs/api/openapi.yaml'
if not openapi.exists() or not openapi.read_text(encoding='utf-8').startswith('openapi: 3.1.2'):
    errors.append('OpenAPI canonical file missing or unexpected version.')

index = ROOT / 'docs/00-INDEX.md'
if not index.exists():
    errors.append('Obsidian documentation index is missing.')

if errors:
    print('STATIC SANITY: FAILED')
    for error in sorted(set(errors)):
        print(f' - {error}')
    sys.exit(1)

print(f'STATIC SANITY: OK ({len(active_code)} active source/config files scanned)')
