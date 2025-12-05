#!/bin/bash

ls $(pnpm bin) | grep prettier
pnpm prettier --version
pnpm prettier --write --config-path .prettierrc "$@"
