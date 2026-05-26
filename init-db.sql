-- Création des schémas isolés pour chaque microservice
-- Exécuté automatiquement au premier démarrage de PostgreSQL

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS media;
CREATE SCHEMA IF NOT EXISTS enrollment;
CREATE SCHEMA IF NOT EXISTS payment;
CREATE SCHEMA IF NOT EXISTS community;

-- Accorder les droits au user applicatif
GRANT ALL ON SCHEMA auth        TO zma_admin;
GRANT ALL ON SCHEMA users       TO zma_admin;
GRANT ALL ON SCHEMA catalog     TO zma_admin;
GRANT ALL ON SCHEMA media       TO zma_admin;
GRANT ALL ON SCHEMA enrollment  TO zma_admin;
GRANT ALL ON SCHEMA payment     TO zma_admin;
GRANT ALL ON SCHEMA community   TO zma_admin;
