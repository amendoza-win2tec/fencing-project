#!/bin/bash

echo "🚀 Starting Fencing XML Processor..."
echo

echo "📦 Installing dependencies..."
npm install

echo
echo "🏗️ Building project..."
npm run build

echo
echo "🚀 Starting application..."
npm run start:dev

