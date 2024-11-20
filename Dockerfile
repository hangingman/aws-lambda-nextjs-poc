FROM node:20-bullseye-slim AS base

FROM base AS builder

WORKDIR /workspace/next_app

RUN apt-get update && apt-get upgrade -y
COPY package.json yarn.lock* ./

COPY components ./components
COPY lib ./lib
COPY pages ./pages
COPY posts ./posts
COPY public ./public
COPY styles ./styles
COPY tsconfig.json *.js ./

RUN yarn --frozen-lockfile

# Next.jsによってテレメトリデータを収集するのを無効にする
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

RUN  yarn build

FROM base AS runner

WORKDIR /workspace

USER node

COPY --from=builder /workspace/public ./public

# 自動的に出力トレースを活用することで、イメージサイズを削減する
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /workspace/.next/standalone ./
COPY --from=builder --chown=node:node /workspace/.next/static ./.next/static

# Next.jsによってテレメトリデータを収集するのを無効にする
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# 注意: ポートのマッピングはdocker-composeで行うため、設定しない

CMD ["node", "server.js"]
