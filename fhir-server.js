// fhir-server.js
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const js2xmlparser = require('js2xmlparser');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json({ type: ['application/json', 'application/fhir+json'] }));
app.use(express.text({ type: 'application/fhir+xml' }));

// Accept header parser to determine response format
app.use((req, res, next) => {
  const acceptHeader = req.get('Accept') || '';
  req.wantsXml = acceptHeader.includes('application/fhir+xml') || acceptHeader.includes('application/xml');
  next();
});

// XML body parser middleware
app.use(async (req, res, next) => {
  if (req.is('application/fhir+xml') || req.is('application/xml')) {
    try {
      const parser = new xml2js.Parser({ 
        explicitArray: false,
        explicitRoot: true
      });
      req.body = await parser.parseStringPromise(req.body);
      
      // Extract the actual resource from the XML root
      const resourceType = Object.keys(req.body)[0];
      if (resourceType) {
        req.body = req.body[resourceType];
      }
    } catch (err) {
      return res.status(400).send('Invalid XML');
    }
  }
  next();
});

// In-memory database for demo purposes
const db = {
  patients: [
    {
      resourceType: "Patient",
      id: "pat-001",
      meta: {
        versionId: "1",
        lastUpdated: "2025-01-15T09:15:00Z"
      },
      name: [
        {
          use: "official",
          family: "Smith",
          given: ["John", "William"]
        }
      ],
      gender: "male",
      birthDate: "1970-05-12",
      address: [
        {
          use: "home",
          line: ["123 Main St"],
          city: "Anytown",
          state: "CA",
          postalCode: "12345",
          country: "USA"
        }
      ],
      telecom: [
        {
          system: "phone",
          value: "555-123-4567",
          use: "home"
        },
        {
          system: "email",
          value: "john.smith@example.com",
          use: "work"
        }
      ]
    },
    {
      resourceType: "Patient",
      id: "pat-002",
      meta: {
        versionId: "1",
        lastUpdated: "2025-01-15T10:30:00Z"
      },
      name: [
        {
          use: "official",
          family: "Johnson",
          given: ["Emily", "Rose"]
        }
      ],
      gender: "female",
      birthDate: "1985-08-25",
      address: [
        {
          use: "home",
          line: ["456 Oak Ave"],
          city: "Somewhere",
          state: "NY",
          postalCode: "67890",
          country: "USA"
        }
      ],
      telecom: [
        {
          system: "phone",
          value: "555-987-6543",
          use: "mobile"
        }
      ]
    },
    {
      resourceType: "Patient",
      id: "pat-003",
      meta: {
        versionId: "1",
        lastUpdated: "2025-01-15T14:22:00Z"
      },
      name: [
        {
          use: "official",
          family: "Williams",
          given: ["Michael"]
        }
      ],
      gender: "male",
      birthDate: "1992-11-30",
      address: [
        {
          use: "home",
          line: ["789 Pine St"],
          city: "Elsewhere",
          state: "TX",
          postalCode: "54321",
          country: "USA"
        }
      ],
      telecom: [
        {
          system: "phone",
          value: "555-456-7890",
          use: "home"
        }
      ]
    }
  ],
  observations: [
    {
      resourceType: "Observation",
      id: "obs-001",
      meta: {
        versionId: "1",
        lastUpdated: "2025-02-01T08:30:00Z"
      },
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "8867-4",
            display: "Heart rate"
          }
        ]
      },
      subject: {
        reference: "Patient/pat-001",
        display: "John Smith"
      },
      effectiveDateTime: "2025-02-01T08:25:00Z",
      issued: "2025-02-01T08:30:00Z",
      valueQuantity: {
        value: 78,
        unit: "beats/min",
        system: "http://unitsofmeasure.org",
        code: "/min"
      }
    },
    {
      resourceType: "Observation",
      id: "obs-002",
      meta: {
        versionId: "1",
        lastUpdated: "2025-02-01T08:32:00Z"
      },
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "8480-6",
            display: "Systolic blood pressure"
          }
        ]
      },
      subject: {
        reference: "Patient/pat-001",
        display: "John Smith"
      },
      effectiveDateTime: "2025-02-01T08:25:00Z",
      issued: "2025-02-01T08:32:00Z",
      valueQuantity: {
        value: 120,
        unit: "mmHg",
        system: "http://unitsofmeasure.org",
        code: "mm[Hg]"
      }
    },
    {
      resourceType: "Observation",
      id: "obs-003",
      meta: {
        versionId: "1",
        lastUpdated: "2025-02-01T09:15:00Z"
      },
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "laboratory",
              display: "Laboratory"
            }
          ]
        }
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: "2339-0",
            display: "Glucose"
          }
        ]
      },
      subject: {
        reference: "Patient/pat-002",
        display: "Emily Johnson"
      },
      effectiveDateTime: "2025-02-01T09:00:00Z",
      issued: "2025-02-01T09:15:00Z",
      valueQuantity: {
        value: 95,
        unit: "mg/dL",
        system: "http://unitsofmeasure.org",
        code: "mg/dL"
      }
    }
  ]
};

// Response formatter
function formatResponse(res, data) {
  if (res.req.wantsXml) {
    // For XML responses
    let xmlContent;
    
    if (data.resourceType === 'Bundle') {
      // Special handling for Bundle resources
      xmlContent = js2xmlparser.parse("Bundle", data, {
        declaration: {
          include: true,
          encoding: "UTF-8"
        },
        format: {
          doubleQuotes: true
        },
        cdataInvalidChars: true,
        wrapHandlers: {
          entry: function(entry) {
            // Ensure entry.resource is properly wrapped with its resourceType
            if (entry && entry.resource) {
              const resourceType = entry.resource.resourceType;
              const resourceData = { ...entry };
              
              // Create a resource wrapper with correct resourceType
              resourceData.resource = { 
                [resourceType]: { ...entry.resource }
              };
              
              // Remove original resourceType as it's now in the XML tag
              delete resourceData.resource[resourceType].resourceType;
              
              return resourceData;
            }
            return entry;
          }
        }
      });
    } else {
      // For single resources
      const resourceType = data.resourceType;
      const resourceData = { ...data };
      
      // Remove resourceType as it will be the XML root element name
      delete resourceData.resourceType;
      
      xmlContent = js2xmlparser.parse(resourceType, resourceData, {
        declaration: {
          include: true,
          encoding: "UTF-8"
        },
        format: {
          doubleQuotes: true
        },
        cdataInvalidChars: true
      });
    }
    
    res.type('application/fhir+xml').send(xmlContent);
  } else {
    // For JSON responses
    res.type('application/fhir+json').json(data);
  }
}

// Utility functions
function createBundle(resourceType, resources, total) {
  return {
    resourceType: "Bundle",
    id: uuidv4(),
    meta: {
      lastUpdated: new Date().toISOString()
    },
    type: "searchset",
    total: total,
    link: [
      {
        relation: "self",
        url: `http://localhost:${PORT}/${resourceType}`
      }
    ],
    entry: resources.map(resource => ({
      fullUrl: `http://localhost:${PORT}/${resource.resourceType}/${resource.id}`,
      resource: resource
    }))
  };
}

function createOperationOutcome(severity, code, diagnostics) {
  return {
    resourceType: "OperationOutcome",
    id: uuidv4(),
    meta: {
      lastUpdated: new Date().toISOString()
    },
    issue: [
      {
        severity: severity,
        code: code,
        diagnostics: diagnostics
      }
    ]
  };
}

// FHIR API Endpoints

// Patient Endpoints
// GET /Patient - Search for patients
app.get('/Patient', (req, res) => {
  let filteredPatients = [...db.patients];
  
  // Filter by id
  if (req.query._id) {
    filteredPatients = filteredPatients.filter(patient => patient.id === req.query._id);
  }
  
  // Filter by family name
  if (req.query.family) {
    filteredPatients = filteredPatients.filter(patient => 
      patient.name.some(name => 
        name.family && name.family.toLowerCase().includes(req.query.family.toLowerCase())
      )
    );
  }
  
  // Filter by given name
  if (req.query.given) {
    filteredPatients = filteredPatients.filter(patient => 
      patient.name.some(name => 
        name.given && name.given.some(given => 
          given.toLowerCase().includes(req.query.given.toLowerCase())
        )
      )
    );
  }
  
  // Filter by birthdate
  if (req.query.birthdate) {
    filteredPatients = filteredPatients.filter(patient => 
      patient.birthDate === req.query.birthdate
    );
  }
  
  // Filter by gender
  if (req.query.gender) {
    filteredPatients = filteredPatients.filter(patient => 
      patient.gender === req.query.gender
    );
  }
  
  // Apply _count parameter if provided
  const count = req.query._count ? parseInt(req.query._count) : 10;
  const limitedPatients = filteredPatients.slice(0, count);
  
  // Return bundle
  formatResponse(res, createBundle('Patient', limitedPatients, filteredPatients.length));
});

// POST /Patient - Create a patient
app.post('/Patient', (req, res) => {
  const patient = req.body;
  
  // Validate resource type
  if (!patient.resourceType || patient.resourceType !== 'Patient') {
    const outcome = createOperationOutcome('error', 'invalid', 'Resource type must be Patient');
    return formatResponse(res.status(400), outcome);
  }
  
  // Create new patient
  const newPatient = {
    ...patient,
    id: `pat-${uuidv4().slice(0, 8)}`,
    meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString()
    }
  };
  
  db.patients.push(newPatient);
  
  res.status(201).header('Location', `http://localhost:${PORT}/Patient/${newPatient.id}`);
  formatResponse(res, newPatient);
});

// GET /Patient/{id} - Get a patient by ID
app.get('/Patient/:id', (req, res) => {
  const patient = db.patients.find(p => p.id === req.params.id);
  
  if (!patient) {
    const outcome = createOperationOutcome('error', 'not-found', `Patient with ID ${req.params.id} not found`);
    return formatResponse(res.status(404), outcome);
  }
  
  formatResponse(res, patient);
});

// PUT /Patient/{id} - Update a patient
app.put('/Patient/:id', (req, res) => {
  const patientIndex = db.patients.findIndex(p => p.id === req.params.id);
  
  if (patientIndex === -1) {
    const outcome = createOperationOutcome('error', 'not-found', `Patient with ID ${req.params.id} not found`);
    return formatResponse(res.status(404), outcome);
  }
  
  // Validate resource type
  if (!req.body.resourceType || req.body.resourceType !== 'Patient') {
    const outcome = createOperationOutcome('error', 'invalid', 'Resource type must be Patient');
    return formatResponse(res.status(400), outcome);
  }
  
  // Update patient
  const updatedPatient = {
    ...req.body,
    id: req.params.id,
    meta: {
      versionId: String(parseInt(db.patients[patientIndex].meta.versionId) + 1),
      lastUpdated: new Date().toISOString()
    }
  };
  
  db.patients[patientIndex] = updatedPatient;
  
  formatResponse(res, updatedPatient);
});

// DELETE /Patient/{id} - Delete a patient
app.delete('/Patient/:id', (req, res) => {
  const patientIndex = db.patients.findIndex(p => p.id === req.params.id);
  
  if (patientIndex === -1) {
    const outcome = createOperationOutcome('error', 'not-found', `Patient with ID ${req.params.id} not found`);
    return formatResponse(res.status(404), outcome);
  }
  
  db.patients.splice(patientIndex, 1);
  
  res.status(204).send();
});

// Observation Endpoints
// GET /Observation - Search for observations
app.get('/Observation', (req, res) => {
  let filteredObservations = [...db.observations];
  
  // Filter by patient
  if (req.query.patient) {
    const patientId = req.query.patient.replace('Patient/', '');
    filteredObservations = filteredObservations.filter(obs => 
      obs.subject && obs.subject.reference && obs.subject.reference.includes(patientId)
    );
  }
  
  // Filter by code
  if (req.query.code) {
    filteredObservations = filteredObservations.filter(obs => 
      obs.code && obs.code.coding && obs.code.coding.some(coding => 
        coding.code === req.query.code
      )
    );
  }
  
  // Filter by date
  if (req.query.date) {
    filteredObservations = filteredObservations.filter(obs => 
      obs.effectiveDateTime && obs.effectiveDateTime.startsWith(req.query.date)
    );
  }
  
  // Return bundle
  formatResponse(res, createBundle('Observation', filteredObservations, filteredObservations.length));
});

// POST /Observation - Create an observation
app.post('/Observation', (req, res) => {
  const observation = req.body;
  
  // Validate resource type
  if (!observation.resourceType || observation.resourceType !== 'Observation') {
    const outcome = createOperationOutcome('error', 'invalid', 'Resource type must be Observation');
    return formatResponse(res.status(400), outcome);
  }
  
  // Create new observation
  const newObservation = {
    ...observation,
    id: `obs-${uuidv4().slice(0, 8)}`,
    meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString()
    }
  };
  
  db.observations.push(newObservation);
  
  res.status(201).header('Location', `http://localhost:${PORT}/Observation/${newObservation.id}`);
  formatResponse(res, newObservation);
});

// Start the server
app.listen(PORT, () => {
  console.log(`FHIR server running at http://localhost:${PORT}`);
  console.log('Server supports both JSON and XML formats');
  console.log('Available endpoints:');
  console.log('- GET /Patient - Search for patients');
  console.log('- POST /Patient - Create a patient');
  console.log('- GET /Patient/{id} - Get patient by ID');
  console.log('- PUT /Patient/{id} - Update patient');
  console.log('- DELETE /Patient/{id} - Delete patient');
  console.log('- GET /Observation - Search for observations');
  console.log('- POST /Observation - Create an observation');
});