#!/bin/bash

# Posizione del progetto
cd "$(dirname "$0")"

# Verifica se il file .env è presente
if [ ! -f .env ]; then
  echo "❌ File .env non trovato. Crealo prima di procedere."
  exit 1
fi

# Assicurati che le variabili SSL siano settate
export HTTPS=true
export SSL_CRT_FILE=./ssl/localhost.crt
export SSL_KEY_FILE=./ssl/localhost.key

# Avvia il frontend React
echo "🚀 Avvio dell'app in HTTPS su https://localhost:3000"
npm start
