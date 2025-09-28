FROM node:22 

WORKDIR  /home/ubuntu/Backend

RUN npm install 

ENV MONGO_URI=value
ENV JWT_SECRET=value
ENV PORT=3000


EXPOSE 3000

CMD ["npm", "index.js"]