import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from './lib/axios.js';
import FormData from 'form-data';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configuration for Ollama
const OLLAMA_BASE_URL = 'http://localhost:11434'; // Default Ollama URL
const OLLAMA_MODEL = 'llama4:scout'; // Default model for image captioning

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers image sont autorisés !'));
    }
  }
});

// Check if Ollama is running
async function checkOllamaStatus() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    console.log('Ollama status: Connected');
    
    // Check if the required model is available
    const availableModels = response.data.models || [];
    const modelExists = availableModels.some(model => model.name === OLLAMA_MODEL);
    
    if (!modelExists) {
      console.warn(`Model "${OLLAMA_MODEL}" not found in Ollama. You may need to pull it with: ollama pull ${OLLAMA_MODEL}`);
    } else {
      console.log(`Model "${OLLAMA_MODEL}" is available`);
    }
    
    return true;
  } catch (error) {
    console.error('Ollama status: Not connected. Make sure Ollama is running on your machine.');
    console.error('Error details:', error.message);
    return false;
  }
}

// Function to encode image to base64
async function encodeImageToBase64(imagePath) {
  // Resize image to reasonable dimensions for model input
  const resizedImageBuffer = await sharp(imagePath)
    .resize(800, 800, { fit: 'inside' })
    .toBuffer();
  
  return resizedImageBuffer.toString('base64');
}

// Function to generate image description using Ollama
async function generateImageDescription(imagePath) {
  try {
    const base64Image = await encodeImageToBase64(imagePath);
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: "Décris cette image en détail en français. Utilise un langage descriptif et précis pour expliquer ce que tu vois, y compris les couleurs, les objets, les personnes, l'environnement et l'atmosphère générale.",
      images: [base64Image],
      stream: false
    });
    
    return response.data.response;
  } catch (error) {
    console.error('Error generating description with Ollama:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw new Error('Failed to generate description with Ollama');
  }
}

// Handle image upload and generate description
app.post('/describe', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier image fourni' });
    }

    // Check if Ollama is running
    const ollamaRunning = await checkOllamaStatus();
    if (!ollamaRunning) {
      return res.status(503).json({ 
        error: 'Le service Ollama n\'est pas disponible. Assurez-vous qu\'Ollama fonctionne sur votre machine.' 
      });
    }

    const imagePath = req.file.path;
    
    // Generate description using Ollama
    const description = await generateImageDescription(imagePath);
    
    // Remove the uploaded file after processing
    fs.unlinkSync(imagePath);
    
    // Return the generated description
    res.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: error.message || 'Failed to generate description' });
  }
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  
  // Check Ollama status on startup
  await checkOllamaStatus();
});
