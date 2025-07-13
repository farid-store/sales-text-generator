// Memuat variabel lingkungan dari .env.
// Pastikan file .env ada di folder yang sama dengan server.js (yaitu di dalam 'backend')
require('dotenv').config();

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const port = 3000; // Port untuk backend Anda. Pastikan ini sama dengan di script.js!

// Middleware
app.use(cors()); // Mengizinkan permintaan dari frontend (penting untuk pengembangan lokal)
app.use(express.json()); // Mengizinkan parsing JSON di body request

// Inisialisasi Gemini API
// Pastikan process.env.GEMINI_API_KEY sudah terdefinisi dari file .env Anda
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tambahkan route GET dasar untuk root URL.
// Ini akan menghilangkan error "Cannot GET /" jika Anda membuka http://localhost:3000 langsung di browser.
app.get('/', (req, res) => {
    console.log('GET request received on /');
    res.send('AI Sales Text Generator API is running smoothly!');
});

// ... (bagian atas kode server.js Anda)

app.post('/generate-text', async (req, res) => {
    try {
        // Ambil juga 'language' dari request body
        const { productName, audience, sellingPoints, tone, length, language } = req.body; // BARIS BARU

        console.log('--- New Request ---');
        console.log('Received from frontend:', { productName, audience, sellingPoints, tone, length, language }); // Log juga bahasa

        if (!productName || !audience || !sellingPoints || !tone || !length || !language) { // Tambahkan validasi untuk bahasa
            console.error('Validation Error: Missing required fields.');
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompt yang disesuaikan untuk multibahasa dengan pilihan pengguna
        const prompt = `
            Generate a sales text for a product.
            Product Name: ${productName}
            Target Audience: ${audience}
            Key Selling Points: ${sellingPoints}
            Tone: ${tone}
            Length: ${length}
            Output Language: ${language}

            Please provide a compelling sales text based on these details in the specified language.
            Ensure the text is engaging and persuasive.
        `;
        console.log('Prompt sent to Gemini:\n', prompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();

        console.log('Successfully generated text from Gemini.');
        res.json({ salesText: generatedText });

    } catch (error) {
        console.error('--- Error Generating Sales Text ---');
        console.error('Detailed error from Gemini API or server logic:', error.message || error);
        if (error.message && error.message.includes('API key not valid')) {
             return res.status(500).json({ error: 'Invalid API Key. Please check your GEMINI_API_KEY in .env file.' });
        }
        res.status(500).json({ error: 'Failed to generate sales text. Please try again. Check backend logs for more details.' });
    }
});

// ... (bagian bawah kode server.js Anda)

// Jalankan server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
    console.log('--------------------------------------------------');
    console.log('Ready to receive requests from frontend.');
});