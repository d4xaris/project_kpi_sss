FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN yarn install --frozen-lockfile && yarn build && ls build/server/index.js

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
CMD ["yarn", "start"]
