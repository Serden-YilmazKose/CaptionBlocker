#!/bin/sh

[ -n "$1" ] && file="$1"
curl -X POST -H 'Content-Type: application/json' -d @"$file" "http://127.0.0.1:5000/videos"
