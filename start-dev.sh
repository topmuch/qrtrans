#!/bin/bash
set -e
cd /home/z/my-project/qrtrans
rm -f dev.log
nohup setsid bun run dev > dev.log 2>&1 < /dev/null &
disown
echo "Started dev server. PID: $!"
