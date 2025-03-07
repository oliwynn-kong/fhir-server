# FHIR Node.js Server with XML Support

A simple implementation of a FHIR R4 server using Node.js and Express. This server provides example endpoints for Patient and Observation resources with dummy data. It supports both JSON and XML formats for FHIR resources.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Docker (optional, for containerized deployment)

### Installation

#### Local Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

#### Docker Installation

1. Build the Docker image:

```bash
docker build -t fhir-server .
```

2. Run the container:

```bash
docker run -p 3000:3000 -d fhir-server
```

This will start the FHIR server on port 3000 of your host machine.

## Dockerfile

The project includes a Dockerfile for containerization:

```dockerfile
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

## Content Negotiation

The server supports both JSON and XML formats for FHIR resources through content negotiation:

- For JSON responses, use `Accept: application/fhir+json` header
- For XML responses, use `Accept: application/fhir+xml` header
- For XML requests, use `Content-Type: application/fhir+xml` header
- For JSON requests, use `Content-Type: application/fhir+json` or `Content-Type: application/json` header

## API Endpoints

### Patient Resource

#### Search for patients
```
GET /Patient
```

Query parameters:
- _id: The logical ID of the patient
- family: Patient family name
- given: Patient given name
- birthdate: Patient birth date
- gender: Patient gender
- _count: Maximum number of results to return (default: 10)

#### Create a patient
```
POST /Patient
```

Request body should contain a valid FHIR Patient resource.

#### Get a patient by ID
```
GET /Patient/{id}
```

#### Update a patient
```
PUT /Patient/{id}
```

Request body should contain a valid FHIR Patient resource.

#### Delete a patient
```
DELETE /Patient/{id}
```

### Observation Resource

#### Search for observations
```
GET /Observation
```

Query parameters:
- patient: Patient reference (e.g., "Patient/pat-001")
- code: Observation code
- date: Observation date

#### Create an observation
```
POST /Observation
```

Request body should contain a valid FHIR Observation resource.

## Example Requests

### JSON Examples

#### Search for patients (JSON)

```bash
curl -X GET "http://localhost:3000/Patient?family=Smith&_count=5" -H "Accept: application/fhir+json"
```

#### Create a patient (JSON)

```bash
curl -X POST "http://localhost:3000/Patient" \
  -H "Content-Type: application/fhir+json" \
  -d '{
    "resourceType": "Patient",
    "name": [
      {
        "use": "official",
        "family": "Doe",
        "given": ["Jane"]
      }
    ],
    "gender": "female",
    "birthDate": "1990-01-15"
  }'
```

### XML Examples

#### Search for patients (XML)

```bash
curl -X GET "http://localhost:3000/Patient?family=Smith&_count=5" -H "Accept: application/fhir+xml"
```

#### Create a patient (XML)

```bash
curl -X POST "http://localhost:3000/Patient" \
  -H "Content-Type: application/fhir+xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<Patient>
  <name>
    <use>official</use>
    <family>Doe</family>
    <given>Jane</given>
  </name>
  <gender>female</gender>
  <birthDate>1990-01-15</birthDate>
</Patient>'
```

#### Get a patient by ID (XML)

```bash
curl -X GET "http://localhost:3000/Patient/pat-001" -H "Accept: application/fhir+xml"
```

#### Search for observations for a specific patient (XML)

```bash
curl -X GET "http://localhost:3000/Observation?patient=Patient/pat-001" -H "Accept: application/fhir+xml"
```

## Docker Commands

### Build the container
```bash
docker build -t fhir-server .
```

### Run the container
```bash
docker run -p 3000:3000 -d fhir-server
```

### View running containers
```bash
docker ps
```

### Stop the container
```bash
docker stop <container_id>
```

### Remove the container
```bash
docker rm <container_id>
```

## Notes

- This is a simple implementation for demonstration purposes
- Data is stored in memory and will be lost when the server is restarted
- Error handling is basic and could be improved for production use
- Authentication and authorization are not implemented
- XML parsing and generation is simplified and may not handle all complex FHIR elements perfectly
