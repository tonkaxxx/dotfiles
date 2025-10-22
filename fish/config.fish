if status is-interactive
    abbr -a gerproxy "ssh -D 1080 -N -C root@168.119.168.160"
    
    abbr -a ga "git add"
    abbr -a gs "git status"
    abbr -a gc "git commit -m"
    abbr -a gps "git push"
    abbr -a gpl "git pull"

    abbr -a dcs "docker container stop"

    abbr -a k "kubectl"

    abbr -a auto "/home/user/.config/autostart"
    abbr -a obhod "sudo bash zapret-discord-youtube-linux/main_script.sh -nointeractive"

    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    export EDITOR=micro
    export KUBECONFIG=/home/user/.kube/homelab_adm
end
