## how to deploy all my homelab sersices 

### my python bot for lenses
#### this python bot counts 15 days, and texts to me, when i need to change my lenses

1. create secret for tg token
kubectl create secret generic telegram-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN=TOKEN

2. create namespace and apply manifest
kubectl create namespace bots
kubectl apply -f lenses.yaml -n bots