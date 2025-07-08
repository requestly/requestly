FROM node:18

WORKDIR /app

COPY . .

# Build the project
RUN chmod +x ./build.sh && ./install.sh
RUN chmod +x ./build.sh && ./build.sh local
EXPOSE 3000
CMD ["npm", "run", "emulated-start", "--prefix", "app", "--", "--host"]
