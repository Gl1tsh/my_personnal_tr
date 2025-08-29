# Étape 1 : Build
FROM node:22 AS builder

WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./

RUN npm install

# Copier la configuration TypeScript et le code source
COPY tsconfig.json ./
COPY src ./src

# Compiler TypeScript
RUN npm run build


# Étape 2 : Run
FROM node:22-slim

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
