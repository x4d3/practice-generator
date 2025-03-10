# FTP server details
SRC_DIR := public

FTP_HOST := $(FTP_HOST)
FTP_DIR := /xade/practice-generator/
FTP_USER := $(FTP_USERNAME)
FTP_PASS := $(FTP_PASSWORD)

.PHONY: upload
upload:
	@echo "Uploading files to $(FTP_HOST)$(FTP_DIR)"
    @find public -type f | while read file; do \
        curl -T $$file ftp://$(FTP_USER):$(FTP_PASS)@$(FTP_HOST)$(FTP_DIR); \
    done
	@echo "Upload complete"


.PHONY: format
format:
	prettier --write public/main.js public/index.html --print-width 120







