FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN mkdir -p /app && chown node:node /app 
WORKDIR /app
USER node
RUN mkdir tmp

COPY --chown=node:node ./package*.json ./
RUN pnpm install
COPY --chown=node:node . .

FROM dependencies AS build
RUN node ace build

FROM base as production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN pnpm install
COPY --chown=node:node --from=build /app/build .

EXPOSE $PORT

CMD ["node", "bin/server.js"]