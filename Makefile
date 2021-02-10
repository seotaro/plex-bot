PROJECT_ID := xxxxxxxxx
ACCOUNT := xxxxxxxxx
APP := plex-bot

usage:
	@echo "usage: make <rule>"

set-cloud-configs:
	gcloud auth login
	gcloud config set project $(PROJECT_ID)

build:
	gcloud builds submit . --tag asia.gcr.io/$(PROJECT_ID)/$(APP)

deploy:
	gcloud services enable run.googleapis.com
	gcloud run deploy $(APP) \
		--project $(PROJECT_ID) \
		--image asia.gcr.io/$(PROJECT_ID)/$(APP) \
		--platform managed \
		--region asia-northeast1 \
		--memory 64Mi \
		--concurrency 1 \
		--max-instances 2 \
		--allow-unauthenticated \
		--flags-file .env.yaml 
