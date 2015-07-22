# Dockerfile to create a nodeclub image
FROM google/nodejs
MAINTAINER Haoyw2

# Add files to the image
RUN mkdir -p /opt/nodejs
ADD . /opt/nodejs
WORKDIR /opt/nodejs

# Install the dependencies modules
RUN npm install

# Run make build
RUN make build

# Expose environment variables
ENV MONGO_ADD 182.92.236.19
ENV MONGO_NAME yappam_club_test

# Expose the container port
EXPOSE 5000

ENTERPOINT ['bin/www']
