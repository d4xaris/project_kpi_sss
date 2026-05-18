FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/ .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN yarn install --frozen-lockfile && yarn build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build/client ./build/client
CMD ["serve", "-s", "build/client", "-l", "3000"]
