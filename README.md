# docker-mount-cache-action [![ts](https://github.com/int128/docker-mount-cache-action/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/docker-mount-cache-action/actions/workflows/ts.yaml)

This is an action to manage the cache of `--mount=type=cache` of Dockerfile.

## Getting Started

TODO

## Specification

### Inputs

| Name        | Default    | Description                         |
| ----------- | ---------- | ----------------------------------- |
| `path`      | (required) | Target path of `--mount=type=cache` |
| `from-tags` | (required) | Pull a cache image from tags        |
| `to-tags`   | (required) | Push a cache image to tags          |

### Outputs

| Name      | Description    |
| --------- | -------------- |
| `example` | example output |
