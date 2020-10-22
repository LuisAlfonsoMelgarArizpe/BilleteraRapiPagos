CREATE DATABASE IF NOT EXISTS billetera; 

USE billetera;

CREATE TABLE usuario (
    id           INTEGER NOT NULL,
    telefono     INTEGER NOT NULL,
    nombre       VARCHAR(128) NOT NULL,
    dpi          VARCHAR(16) NOT NULL,
    nacimiento   DATE NOT NULL,
    correo       VARCHAR(128) NOT NULL,
    imagen_dpi   VARCHAR(128) NOT NULL,
    saldo        NUMERIC NOT NULL,
    CONSTRAINT usuario_pk PRIMARY KEY (id)
);


CREATE TABLE amistad (
    solicitante_id   INTEGER NOT NULL,
    amigo_id         INTEGER NOT NULL,
    CONSTRAINT amistad_pk PRIMARY KEY (solicitante_id, amigo_id),
    CONSTRAINT amigo_fk FOREIGN KEY (amigo_id) REFERENCES usuario (id),
    CONSTRAINT solicitante_fk FOREIGN KEY (solicitante_id) REFERENCES usuario (id)
);

CREATE TABLE contador (
    id           INTEGER NOT NULL,
    tipo         INTEGER NOT NULL,
    numero       VARCHAR(64) NOT NULL,
    usuario_id   INTEGER NOT NULL,
    CONSTRAINT contador_pk PRIMARY KEY (id),
    CONSTRAINT contador_usuario_fk FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

CREATE TABLE tarjeta (
    id                INTEGER NOT NULL,
    numero            VARCHAR(24) NOT NULL,
    mes_vencimiento   INTEGER NOT NULL,
    ano_vencimiento   INTEGER NOT NULL,
    cvv               VARCHAR(8) NOT NULL,
    usuario_id        INTEGER NOT NULL,
    CONSTRAINT tarjeta_pk PRIMARY KEY (id),
    CONSTRAINT tarjeta_usuario_fk FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);

CREATE TABLE transaccion (
    id            INTEGER NOT NULL,
    tipo          INTEGER NOT NULL,
    monto         NUMERIC NOT NULL,
    descripcion   VARCHAR(128) NOT NULL,
    fecha         DATE NOT NULL,
    usuario_id    INTEGER NOT NULL,
    CONSTRAINT transaccion_pk PRIMARY KEY (id),
    CONSTRAINT transaccion_usuario_fk FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);