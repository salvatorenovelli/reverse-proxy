# You should always specify a full version here to ensure all of your developers
# are running the same version of Node.
FROM node:8.5.0-alpine

# The base node image sets a very verbose log level.
ENV NPM_CONFIG_LOGLEVEL warn

# Copy all local files into the image.
COPY . .

RUN npm install

# Set the command to start the node server.
CMD node Server.js

# Tell Docker about the port we'll run on.
EXPOSE 3001
