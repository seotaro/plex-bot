PROJECT_ID := 
APP := plex-bot

usage:
	@echo "usage: make <rule>"

login-gcp:
	gcloud auth login

deploy:
	gcloud builds submit . --tag asia.gcr.io/$(PROJECT_ID)/$(APP)
	gcloud services enable run.googleapis.com
	gcloud run deploy $(APP) \
		--project $(PROJECT_ID) \
		--image asia.gcr.io/$(PROJECT_ID)/$(APP) \
		--platform managed \
		--region asia-northeast1 \
		--memory 128Mi \
		--concurrency 1 \
		--max-instances 2 \
		--allow-unauthenticated \
		--flags-file .env.yaml 
