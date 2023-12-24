# docker-mount-cache-action [![ts](https://github.com/int128/docker-mount-cache-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/docker-mount-cache-action/actions/workflows/ts.yaml)

This is an action to manage the cache of `--mount=type=cache` of Dockerfile.

## Getting Started

```yaml
jobs:
  build:
    steps:
      - uses: int128/docker-mount-cache-action/restore@v0
        with:
          path: /root/.cache/go-build
          tags: ghcr.io/${{ github.repository }}:go-build-cache
      - uses: docker/build-push-action@v5
        id: build
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:main
      - uses: int128/docker-mount-cache-action/save@v0
        with:
          path: /root/.cache/go-build
          tags: ghcr.io/${{ github.repository }}:go-build-cache
```

## Specification

### Inputs

| Name   | Default    | Description                         |
| ------ | ---------- | ----------------------------------- |
| `path` | (required) | Target path of `--mount=type=cache` |
| `tags` | (required) | Tags of cache images                |

### Outputs

None.
