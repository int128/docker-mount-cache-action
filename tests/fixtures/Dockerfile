FROM golang:1.21.0 AS builder

WORKDIR /workspace
COPY go.* .
RUN go mod download

COPY . .

RUN --mount=type=cache,target=/root/.cache/go-build \
    ls -aC /root/.cache/go-build && \
    go build -v -o main main.go && \
    ls -aC /root/.cache/go-build

FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=builder /workspace/main .
USER 65532:65532
ENTRYPOINT ["/main"]
