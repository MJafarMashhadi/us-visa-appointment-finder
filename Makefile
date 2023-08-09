build:
	docker build . -t usvisa

dev: build
	docker run --rm -it --entrypoint sh usvisa
