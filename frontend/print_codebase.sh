#!/bin/bash
find . -type f -not -path "./node_modules/*" -not -path "./dist/*" -not -path "./.git/*" -not -path "./public/avatars/*" -not -path "./.claude/*" -not -name "pnpm-lock.yaml" -not -name "files.txt" -not -name "CHANGES.md" -not -name "*.svg" -not -name "*.jpeg" -not -name "codebase.txt" -print0 | xargs -0 -I {} sh -c 'echo "--- {} ---"; cat "{}"; echo' > codebase.txt
