#!/bin/bash
eval "$(rbenv init -)"
git pull
sh getData.sh
sh getSession.sh
git add .
git commit -m "Auto update"
git push origin master
