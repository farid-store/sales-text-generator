// api/generate.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metode tidak diizinkan.' });
  }

  const { prompt, keywords, language } = request.body; // Terima parameter language

  if (!prompt) {
    return response.status(400).json({ message: 'Deskripsi produk/layanan diperlukan.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({ message: 'GEMINI_API_KEY tidak dikonfigurasi di Vercel.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  // Gunakan model yang paling cocok untuk teks, misalnya 'gemini-pro'.
  // Pastikan model ini tersedia di region Anda.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    let systemInstruction = "";
    let userPromptContent = "";

    // Logika untuk menyesuaikan prompt berdasarkan bahasa
    if (language === 'id') {
      systemInstruction = "Anda adalah asisten penjualan yang kreatif dan sangat persuasif. Hasilkan salinan penjualan dalam Bahasa Indonesia yang menarik dan efektif. Selalu respon dalam Bahasa Indonesia.";
      userPromptContent = `Hasilkan teks penjualan untuk: ${prompt}. `;
      if (keywords) {
        userPromptContent += `Sertakan kata kunci ini: ${keywords}. `;
      }
      userPromptContent += `Buatlah singkat, padat, dan sangat persuasif. Fokus pada manfaat bagi pelanggan.`;
    } else { // Default ke English
      systemInstruction = "You are a creative and highly persuasive sales assistant. Generate compelling and effective sales copy in English. Always respond in English.";
      userPromptContent = `Generate sales text for: ${prompt}. `;
      if (keywords) {
        userPromptContent += `Include these keywords: ${keywords}. `;
      }
      userPromptContent += `Make it concise, impactful, and highly persuasive. Focus on customer benefits.`;
    }

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: systemInstruction, // System instruction sebagai bagian dari history
        },
        {
          role: "model",
          parts: language === 'id' ? "Baik, saya siap membantu. Berikan detail produk/layanan Anda." : "Okay, I'm ready to help. Please provide your product/service details.",
        },
      ],
      generationConfig: {
        maxOutputTokens: 300, // Batasi panjang respons
        temperature: 0.7,    // Kontrol kreativitas
      },
    });

    const result = await chat.sendMessage(userPromptContent);
    const generatedText = result.response.text();
    return response.status(200).json({ text: generatedText });

  } catch (error) {
    console.error('Error saat menghasilkan teks penjualan:', error);
    return response.status(500).json({ message: 'Gagal menghasilkan teks penjualan. Coba lagi nanti.', error: error.message });
  }
}
