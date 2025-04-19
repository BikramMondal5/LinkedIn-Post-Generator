// Import the Google Generative AI library
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const generateBtn = document.getElementById('generateBtn');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const editBtn = document.getElementById('editBtn');
    const apiKeyModal = document.getElementById('apiKeyModal');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
    const closeModalBtn = document.getElementById('closeModal');
    const outputSection = document.getElementById('outputSection');
    const loader = document.getElementById('loader');
    const postContent = document.getElementById('postContent');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    // Check if API key exists
    let apiKey = localStorage.getItem('geminiApiKey');
    if (!apiKey) {
        apiKeyModal.classList.add('visible');
    }

    // Save API key
    saveApiKeyBtn.addEventListener('click', () => {
        const keyInput = document.getElementById('apiKey');
        if (keyInput.value.trim() === '') {
            showError('Please enter a valid API key');
            return;
        }

        localStorage.setItem('geminiApiKey', keyInput.value.trim());
        apiKey = keyInput.value.trim();
        apiKeyModal.classList.remove('visible');
        showSuccess('API key saved successfully!');
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
        apiKeyModal.classList.remove('visible');
    });

    // Generate post
    generateBtn.addEventListener('click', generatePost);
    regenerateBtn.addEventListener('click', generatePost);

    // Copy to clipboard
    copyBtn.addEventListener('click', () => {
        const textToCopy = postContent.innerText;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                showSuccess('Post copied to clipboard!');
            })
            .catch(err => {
                showError('Failed to copy text: ' + err);
            });
    });

    // Edit post
    editBtn.addEventListener('click', () => {
        outputSection.classList.remove('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    async function generatePost() {
        // Get values
        const industry = document.getElementById('industry').value;
        const topic = document.getElementById('topic').value;
        const keyPoints = document.getElementById('keyPoints').value;
        const style = document.querySelector('input[name="style"]:checked').value;
        const includeEmoji = document.getElementById('includeEmoji').checked;
        const includeHashtags = document.getElementById('includeHashtags').checked;
        const includeQuestion = document.getElementById('includeQuestion').checked;
        const includeStats = document.getElementById('includeStats').checked;
        const length = document.getElementById('length').value;

        // Validate inputs
        if (!topic) {
            showError('Please enter a post topic');
            return;
        }

        if (!industry) {
            showError('Please select your industry');
            return;
        }

        // Check API key
        if (!apiKey) {
            apiKeyModal.classList.add('visible');
            return;
        }

        try {
            // Show loader
            loader.classList.add('visible');
            outputSection.classList.remove('visible');
            hideError();
            hideSuccess();

            // Create prompt
            const prompt = createPrompt(industry, topic, keyPoints, style, includeEmoji, includeHashtags, includeQuestion, includeStats, length);

            // Call Gemini API
            const generatedContent = await callGeminiApi(prompt);

            // Display result
            postContent.textContent = generatedContent;
            outputSection.classList.add('visible');

            // Scroll to result
            outputSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            showError('Error generating post: ' + error.message);
            console.error('Error:', error);
        } finally {
            // Hide loader
            loader.classList.remove('visible');
        }
    }

    function createPrompt(industry, topic, keyPoints, style, includeEmoji, includeHashtags, includeQuestion, includeStats, length) {
        let lengthDescription;
        switch (length) {
            case 'short':
                lengthDescription = '1-2 paragraphs';
                break;
            case 'medium':
                lengthDescription = '3-4 paragraphs';
                break;
            case 'long':
                lengthDescription = '5+ paragraphs';
                break;
        }

        let inclusions = [];
        if (includeEmoji) inclusions.push('emojis');
        if (includeHashtags) inclusions.push('relevant hashtags');
        if (includeQuestion) inclusions.push('engaging questions');
        if (includeStats) inclusions.push('relevant statistics or data points if applicable');

        let prompt = `Create a professional LinkedIn post for someone in the ${industry} industry about ${topic}.`;

        if (keyPoints) {
            prompt += ` Include these key points: ${keyPoints}.`;
        }

        prompt += ` The post should have a ${style.toLowerCase()} tone and be ${lengthDescription} in length.`;

        if (inclusions.length > 0) {
            prompt += ` Please include ${inclusions.join(', ')}.`;
        }

        prompt += ` Make sure the post is engaging, professional, and follows LinkedIn best practices. Do not include any introductory or explanatory text - just provide the final post content ready to be copied and pasted.`;

        return prompt;
    }

    async function callGeminiApi(prompt) {
        try {
            // Initialize Gemini API with the correct class
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Generate content
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return text;
        } catch (error) {
            console.error('API Error:', error);
            if (error.message.includes('API key')) {
                localStorage.removeItem('geminiApiKey');
                apiKeyModal.classList.add('visible');
                throw new Error('Invalid API key. Please enter a valid Google Gemini API key.');
            }
            throw error;
        }
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('visible');
        setTimeout(() => {
            errorMessage.classList.remove('visible');
        }, 5000);
    }

    function hideError() {
        errorMessage.classList.remove('visible');
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.classList.add('visible');
        setTimeout(() => {
            successMessage.classList.remove('visible');
        }, 3000);
    }

    function hideSuccess() {
        successMessage.classList.remove('visible');
    }
});