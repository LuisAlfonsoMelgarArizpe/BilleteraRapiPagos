FROM mysql:5.7

WORKDIR /usr/src/app

COPY dbscript.sql ./

RUN mysql -u root -pbilletera < dbscript.sql

EXPOSE 3306
