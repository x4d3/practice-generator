# FTP server details
SRC_DIR := public

FTP_HOST := $(FTP_HOST)
FTP_DIR := /xade/practice-generator/
FTP_USER := $(FTP_USERNAME)
FTP_PASS := $(FTP_PASSWORD)

.PHONY: upload
upload:
	@echo "Uploading files to $(FTP_HOST)$(FTP_DIR)"
	@find $(SRC_DIR) -type f | while read file; do \
		relative_path=$${file#$(SRC_DIR)/}; \
		curl --ftp-create-dirs -T $$file ftp://$(FTP_USER):$(FTP_PASS)@$(FTP_HOST)$(FTP_DIR)$$relative_path; \
	done
	@echo "Upload complete"

.PHONY: format
format:
	prettier --write . --print-width 120
