if status is-interactive
    abbr -a cat "bat --paging=never --plain"
    
    abbr -a ga "git add"
    abbr -a gs "git status"
    abbr -a gc "git commit -m"
    abbr -a gps "git push"
    abbr -a gpl "git pull"

    abbr -a dcs "docker container stop"
    abbr -a dcu "docker compose up -d"
    abbr -a dcd "docker compose down"
    abbr -a dcl "docker compose logs -f"

    abbr -a k "kubectl"

    abbr -a auto "/home/user/.config/autostart"
    abbr -a obhod "sudo bash zapret-discord-youtube-linux/main_script.sh -nointeractive"
    abbr -a gerproxy "ssh -D 1080 -N -C root@168.119.168.160"

    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    export EDITOR=micro
    export KUBECONFIG=/home/user/.kube/homelab_adm
end

# Created by `pipx` on 2025-11-30 16:53:35
set PATH $PATH /home/user/.local/bin
