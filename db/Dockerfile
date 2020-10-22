FROM mysql:5.7

WORKDIR /usr/src/app

COPY . .

RUN mysql -u root -pbilletera source ./dbscript.sql

EXPOSE 3306

