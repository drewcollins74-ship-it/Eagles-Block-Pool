#!/bin/zsh

project_dir="${0:A:h}"
cd "$project_dir" || exit 1

# Open Safari after the foreground server has had a moment to start.
(sleep 1; open "http://localhost:4173/weekly-pool/") &

echo "Eagles Block Pool preview"
echo "Keep this window open while viewing the site."
echo "Press Control-C when you are finished."
echo

exec /usr/bin/python3 -m http.server 4173 --bind 127.0.0.1 --directory "$project_dir"
