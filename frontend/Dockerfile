FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile

FROM node:20-alpine AS build-env
WORKDIR /app
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=development-dependencies-env /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY --from=build-env /app/package.json ./
CMD ["yarn", "start"]
