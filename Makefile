.PHONY: zip clean

ZIP := dist/imagesourcerer.zip
SRC_DIR := src/imagesourcerer

zip: $(ZIP)

$(ZIP): $(SRC_DIR)
	@mkdir -p $(dir $(ZIP))
	@rm -f $(ZIP)
	@cd $(SRC_DIR) && zip -rq ../../$(ZIP) . \
		-x "*.DS_Store" \
		-x "__MACOSX/*"

clean:
	@rm -f $(ZIP)
