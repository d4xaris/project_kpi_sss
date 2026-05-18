FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/ .
RUN yarn install --frozen-lockfile && yarn build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
CMD ["yarn", "start"]
