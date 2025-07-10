FROM node:18

WORKDIR /app

COPY . .

# Install project deps
RUN  ./install.sh
# Build project and sub modules(like extension)
RUN  ./build.sh local

EXPOSE 3000

CMD ["npm", "run", "emulated-start", "--prefix", "app", "--", "--host"]
