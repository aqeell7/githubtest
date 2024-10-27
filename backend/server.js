const express = require('express');
const cors = require('cors');
const { ReclaimProofRequest } = require('@reclaimprotocol/js-sdk');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = 3000;
const LOCAL_IP_ADDRESS = '192.168.0.106'; // Replace with your actual local IP address

const options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert')
};

app.use(express.json());

const corsOptions = {
  origin: 'https://localhost:3001', // Replace with your frontend URL
  methods: 'GET,POST',
};
app.use(cors(corsOptions));

// Initialize the Reclaim Proof Request with logging
const initializeProvider = async (providerId) => {
  try {
    const reclaimProofRequest = await ReclaimProofRequest.init(
      process.env.APP_ID,
      process.env.APP_SECRET,
      providerId,
      { log: true, acceptAiProviders: true }
    );
    return reclaimProofRequest;
  } catch (error) {
    console.error('Error initializing provider:', error);
    throw error;
  }
};

// Route to generate SDK configuration
app.get('/reclaim/generate-config', async (req, res) => {
  const PROVIDER_ID = process.env.PROVIDER_ID;
  try {
    const reclaimProofRequest = await initializeProvider(PROVIDER_ID);
    reclaimProofRequest.setAppCallbackUrl(`https://${LOCAL_IP_ADDRESS}:${port}/receive-proofs`);
    const reclaimProofRequestConfig = reclaimProofRequest.toJsonString();
    return res.json({ reclaimProofRequestConfig });
  } catch (error) {
    console.error('Error generating request config:', error);
    return res.status(500).json({ error: 'Failed to generate request config' });
  }
});

// Route to receive proofs
app.post('/receive-proofs', (req, res) => {
  const proofs = req.body;
  console.log('Received proofs:', proofs);
  // Process the proofs here
  return res.sendStatus(200);
});

https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://${LOCAL_IP_ADDRESS}:${port}`);
});
