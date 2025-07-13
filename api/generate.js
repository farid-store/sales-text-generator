// api/generate.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const { productName, audience, sellingPoints, tone, length, language } = request.body;

  // Basic validation
  if (!productName || !audience || !sellingPoints) {
    return response.status(400).json({ message: 'Product Name, Target Audience, and Key Selling Points are required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({ message: 'GEMINI_API_KEY environment variable is not configured.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Menggunakan Gemini 1.5 Flash

  try {
    let systemInstruction = "";
    let userPromptContent = "";

    // Determine language-specific instructions and prompt
    if (language === 'Indonesian') {
      systemInstruction = "Anda adalah pakar penulisan iklan penjualan yang sangat kreatif dan persuasif. Tugas Anda adalah membuat salinan penjualan yang menarik dalam Bahasa Indonesia. Fokus pada manfaat bagi audiens target dan gunakan nada yang diminta. Selalu respon dalam Bahasa Indonesia.";
      userPromptContent = `Buatkan teks penjualan untuk produk/layanan "${productName}".\n`;
      userPromptContent += `Target audiens: ${audience}.\n`;
      userPromptContent += `Poin-poin penjualan utama: ${sellingPoints}.\n`;
      userPromptContent += `Gunakan nada: ${tone}.\n`;
      userPromptContent += `Panjang yang diinginkan: ${length}.\n`;
      userPromptContent += `Buatlah singkat, padat, dan sangat menarik perhatian.`;
    } else if (language === 'English') {
      systemInstruction = "You are a highly creative and persuasive sales copy expert. Your task is to craft compelling sales copy in English. Focus on benefits for the target audience and use the requested tone. Always respond in English.";
      userPromptContent = `Generate sales text for the product/service "${productName}".\n`;
      userPromptContent += `Target audience: ${audience}.\n`;
      userPromptContent += `Key selling points: ${sellingPoints}.\n`;
      userPromptContent += `Use a ${tone} tone.\n`;
      userPromptContent += `Desired length: ${length}.\n`;
      userPromptContent += `Make it concise, impactful, and highly attention-grabbing.`;
    } else if (language === 'Spanish') {
        systemInstruction = "Eres un experto en redacción de textos de venta altamente creativo y persuasivo. Tu tarea es crear textos de venta atractivos en español. Céntrate en los beneficios para el público objetivo y utiliza el tono solicitado. Responde siempre en español.";
        userPromptContent = `Genera texto de ventas para el producto/servicio "${productName}".\n`;
        userPromptContent += `Público objetivo: ${audience}.\n`;
        userPromptContent += `Puntos clave de venta: ${sellingPoints}.\n`;
        userPromptContent += `Usa un tono: ${tone}.\n`;
        userPromptContent += `Longitud deseada: ${length}.\n`;
        userPromptContent += `Hazlo conciso, impactante y que capte la atención.`;
    } else if (language === 'French') {
        systemInstruction = "Vous êtes un expert en rédaction de textes de vente très créatif et persuasif. Votre tâche est de créer des textes de vente percutants en français. Concentrez-vous sur les avantages pour le public cible et utilisez le ton demandé. Répondez toujours en français.";
        userPromptContent = `Générez un texte de vente pour le produit/service "${productName}".\n`;
        userPromptContent += `Public cible : ${audience}.\n`;
        userPromptContent += `Points de vente clés : ${sellingPoints}.\n`;
        userPromptContent += `Utilisez un ton : ${tone}.\n`;
        userPromptContent += `Longueur souhaitée : ${length}.\n`;
        userPromptContent += `Rendez-le concis, percutant et très accrocheur.`;
    } else if (language === 'German') {
        systemInstruction = "Sie sind ein hochkreativer und überzeugender Experte für Verkaufstexte. Ihre Aufgabe ist es, ansprechende Verkaufstexte auf Deutsch zu erstellen. Konzentrieren Sie sich auf die Vorteile für die Zielgruppe und verwenden Sie den angeforderten Ton. Antworten Sie immer auf Deutsch.";
        userPromptContent = `Generieren Sie Verkaufstexte für das Produkt/die Dienstleistung "${productName}".\n`;
        userPromptContent += `Zielgruppe: ${audience}.\n`;
        userPromptContent += `Wichtigste Verkaufsargumente: ${sellingPoints}.\n`;
        userPromptContent += `Verwenden Sie einen Ton: ${tone}.\n`;
        userPromptContent += `Gewünschte Länge: ${length}.\n`;
        userPromptContent += `Machen Sie es prägnant, wirkungsvoll und sehr aufmerksamkeitsstark.`;
    }
    
    // Fallback if language is not explicitly handled (though it should be from the select)
    else {
        systemInstruction = "You are a creative and persuasive sales expert. Generate compelling sales copy. Focus on benefits for the target audience and use the requested tone.";
        userPromptContent = `Generate sales text for the product/service "${productName}".\n`;
        userPromptContent += `Target audience: ${audience}.\n`;
        userPromptContent += `Key selling points: ${sellingPoints}.\n`;
        userPromptContent += `Use a ${tone} tone.\n`;
        userPromptContent += `Desired length: ${length}.\n`;
        userPromptContent += `Make it concise, impactful, and highly attention-grabbing.`;
    }


    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: systemInstruction,
        },
        {
          role: "model",
          parts: "Siap! Berikan detail produk/layanan Anda.", // Ini bisa disesuaikan juga per bahasa
        },
      ],
      generationConfig: {
        maxOutputTokens: 500, // Tingkatkan max_tokens untuk opsi "Long"
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userPromptContent);
    const generatedText = result.response.text();
    return response.status(200).json({ text: generatedText });

  } catch (error) {
    console.error('Error generating sales text:', error);
    return response.status(500).json({ message: 'Failed to generate sales text. Please try again later.', error: error.message });
  }
}
