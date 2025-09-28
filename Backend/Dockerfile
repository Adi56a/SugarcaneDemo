FROM node:22

WORKDIR /Backend

COPY Backend/package*.json ./

RUN npm install 

COPY Backend/ .

ENV MONGO_URI=value
ENV JWT_SECRET=value
ENV PORT=5000

EXPOSE 5000

CMD ['node' , 'index.js']
