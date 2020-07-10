#!/bin/bash
git pull
sh getData.sh
git add .
git commit -m "Auto update"
git push origin master
