update:
	npm update
	ssh -t root@5.75.131.163 'cd wiptimelinebot; npm update --omit=dev;'

deploy:
	ssh -t root@5.75.131.163 'cd wiptimelinebot; git pull origin; pm2 restart wip;'

deploy-update:
	npm update
	ssh -t root@5.75.131.163 'cd wiptimelinebot; git pull origin; npm update --omit=dev; pm2 restart wip;'