#!/bin/bash

bspc desktop -f 6
kitty --title "System Update" -e fish -c "yay -Syu; fish" &
sleep 0.5
kitty --title "Gerproxy" -e fish -c "ssh -D 1080 -N -C root@168.119.168.160; fish" &
sleep 0.5
kitty --title "Obhod" -e fish -c "sudo bash /home/user/zapret-discord-youtube-linux/main_script.sh -nointeractive; fish" &
sleep 0.5

bspc desktop -f 4
easyeffects &
sleep 0.5
helvum &
sleep 0.7

bspc desktop -f 3
Telegram &
sleep 3

bspc desktop -f 6

