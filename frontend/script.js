document.addEventListener('DOMContentLoaded', () => {
    const productNameInput = document.getElementById('productName');
    const audienceInput = document.getElementById('audience');
    const sellingPointsTextarea = document.getElementById('sellingPoints');
    const toneSelect = document.getElementById('tone');
    const lengthSelect = document.getElementById('length');
    // Tambahkan referensi ke elemen bahasa
    const languageSelect = document.getElementById('language'); // BARIS BARU

    const generateBtn = document.getElementById('generateBtn');
    const generatedTextarea = document.getElementById('generatedText');
    const copyBtn = document.getElementById('copyBtn');

    const backendUrl = 'https://sales-text-generator.vercel.app/api/generate-text';

    generateBtn.addEventListener('click', async () => {
        const productName = productNameInput.value.trim();
        const audience = audienceInput.value.trim();
        const sellingPoints = sellingPointsTextarea.value.trim();
        const tone = toneSelect.value;
        const length = lengthSelect.value;
        // Ambil nilai bahasa
        const language = languageSelect.value; // BARIS BARU

        if (!productName || !audience || !sellingPoints) {
            alert('Please fill in all required fields.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        generatedTextarea.value = 'Generating sales text, please wait...';
        copyBtn.style.display = 'none';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productName,
                    audience,
                    sellingPoints,
                    tone,
                    length,
                    language // SERTAKAN BAHASA KE BACKEND
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            generatedTextarea.value = data.salesText;
            copyBtn.style.display = 'block';

        } catch (error) {
            console.error('Error:', error);
            generatedTextarea.value = `Error generating text: ${error.message}. Please check your backend server and network connection.`;
            alert(`Failed to generate sales text: ${error.message}`);
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Sales Text';
        }
    });

    copyBtn.addEventListener('click', () => {
        generatedTextarea.select();
        generatedTextarea.setSelectionRange(0, 99999);
        document.execCommand('copy');
        alert('Text copied to clipboard!');
    });
});