FROM node:15.14.0
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED 1

ADD package.json .
ADD yarn.lock . 
RUN yarn install

ENV NODE_ENV production

COPY . .
RUN yarn build 

EXPOSE 3000

CMD ["yarn", "start"]