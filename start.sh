#!/bin/bash
steam &
xset s off
xset s noblank
xset s noexpose
xset -dpms
xset dpms 3600 3600 3600

sudo mount -t ntfs-3g /dev/sda1 /mnt/999
sudo mount -t ntfs-3g /dev/sdc3 /mnt/222

bspc desktop -f 0
firefox &
sleep 3.5

bspc desktop -f 3
Telegram &
sleep 3.5

bspc desktop -f 4
easyeffects &
helvum &
pavucontrol &
sleep 2.5

bspc desktop -f 6
kitty --title "Gerproxy" -e fish -c "ssh -D 1080 -N -C root@168.119.168.160; fish" &
kitty --title "Obhod" -e fish -c "sudo bash /home/user/zapret-discord-youtube-linux/main_script.sh -nointeractive; fish" &
kitty --title "System Update" -e fish -c "yay -Syu; fish" &


