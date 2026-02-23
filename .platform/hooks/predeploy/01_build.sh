#!/bin/bash
set -e
# Next.js 빌드 (EB가 npm install 완료 후 실행하는 predeploy 훅)
npm run build
