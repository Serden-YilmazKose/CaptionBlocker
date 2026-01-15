#!/bin/sh

[ -n "$1" ] && video_id="$1"
curl "http://127.0.0.1:5000/videos?video_id=$video_id"
