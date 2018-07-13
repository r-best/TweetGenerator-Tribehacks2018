FROM node as tweetgen
WORKDIR /tweetgen
COPY package.json .
RUN npm install
COPY . .
RUN npm run build
RUN mkdir -p /usr/share/nginx/html/tweetgen
RUN cp -r dist/* /usr/share/nginx/html/tweetgen
VOLUME [ "/usr/share/nginx/html/tweetgen" ]
