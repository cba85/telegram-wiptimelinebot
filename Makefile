update:
	npm update
	ssh -t root@5.75.131.163 'cd telegram-wiptimelinebot; npm update --omit=dev;'

deploy:
	ssh -t root@5.75.131.163 'cd telegram-wiptimelinebot; git pull origin; pm2 restart wipbot;'

deploy-update:
	ssh -t root@5.75.131.163 'cd telegram-wiptimelinebot; git pull origin; npm update --omit=dev; pm2 restart wipbot;'