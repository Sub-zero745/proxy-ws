# Usa una imagen oficial de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia tu archivo de script al contenedor
COPY proxy.js .

# Expone el puerto 8080 para Google Cloud Run
EXPOSE 8080

# Comando para ejecutar tu script
CMD ["node", "proxy.js"]
