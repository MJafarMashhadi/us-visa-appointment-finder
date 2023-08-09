build:
	docker build . -t usvisa

dev: build
	docker run --rm --init -it --cap-add=SYS_ADMIN --entrypoint sh usvisa

run: build
	docker run --rm --init -i --cap-add=SYS_ADMIN usvisa