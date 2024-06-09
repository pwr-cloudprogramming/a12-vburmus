#!/bin/bash
cd backend
mvn clean packange
java -jar backend/target/backend-1.0.jar
cd ../frontend
npm install
npm start