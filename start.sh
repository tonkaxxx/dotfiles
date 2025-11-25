#!/bin/bash
steam &

bspc desktop -f 0
firefox &
sleep 3.5

bspc desktop -f 3
Telegram &
sleep 3.5

bspc desktop -f 4
easyeffects &
helvum &
sleep 2.5

bspc desktop -f 6
kitty --title "Gerproxy" -e fish -c "ssh -D 1080 -N -C root@168.119.168.160; fish" &
kitty --title "Obhod" -e fish -c "sudo bash /home/user/zapret-discord-youtube-linux/main_script.sh -nointeractive; fish" &
kitty --title "System Update" -e fish -c "yay -Syu; fish" &


