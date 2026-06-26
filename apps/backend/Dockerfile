FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./package.json

RUN npm ci --omit=dev

EXPOSE 9000

CMD ["node", "dist/main.js"]