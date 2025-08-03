## how to deploy all my homelab sersices 

### prometheus alerts
#### this metrics can allert me via tg messages, that one of my nodes heated too much

1. install sensors package and prometheus-node-exporter
sudo apk add lm_sensors prometheus-node-exporter

2. add kernel module (for intel cpu)
sudo modprobe coretemp

3. create openrc service
sudo nano /etc/init.d/prometheus-node-exporter

```bash
#!/sbin/openrc-run
name="prometheus-node-exporter"
description="Prometheus Node Exporter"
command="/usr/bin/node_exporter"
command_args="--collector.hwmon --collector.thermal_zone"
command_user="nobody"
pidfile="/var/run/${name}.pid"

depend() {
    need net
}

start_pre() {
    checkpath -d -o nobody:nobody -m 755 "/var/lib/node_exporter"
}
```

4. make it executable
sudo chmod +x /etc/init.d/prometheus-node-exporter

5. enable service 
sudo rc-service prometheus-node-exporter start
sudo rc-update add prometheus-node-exporter default

6. test metrics (look for `node_hwmon_temp_celsius`)
curl http://localhost:9100/metrics | grep temp








### my python bot for lenses
#### this python bot counts 15 days, and texts to me, when i need to change my lenses

1. create namespace
kubectl create namespace bots

2. create secret with tg token
kubectl -n bots create secret generic lenses-bot-secret \
  --from-literal=TELEGRAM_BOT_TOKEN=UR_TOKEN

3. apply manifest
kubectl apply -f lenses.yaml -n bots