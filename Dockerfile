FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_DATABASE_URL
ARG VITE_NEON_API_KEY
ARG VITE_NEON_PROJECT_ID

# Set them as environment variables for Vite
ENV VITE_DATABASE_URL=$VITE_DATABASE_URL
ENV VITE_NEON_API_KEY=$VITE_NEON_API_KEY
ENV VITE_NEON_PROJECT_ID=$VITE_NEON_PROJECT_ID

COPY package*.json ./
RUN npm ci

COPY . .

RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist /usr/share/nginx/html/quit_staging

RUN rm /etc/nginx/conf.d/default.conf
COPY vite-nginx.conf /etc/nginx/conf.d/nginx.conf

EXPOSE 80

CMD ["nginx","-g","daemon off;"]
