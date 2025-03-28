// Chat elements
const chatElements = {
    messages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userMessage'),
    sendButton: document.getElementById('sendMessage')
};

// Chat state
const chatState = {
    messages: [],
    isProcessing: false
};

// Initialize chat
function initializeChat() {
    chatElements.sendButton.addEventListener('click', handleSendMessage);
    chatElements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Add initial message
    addAssistantMessage("Hello! I'm here to help explain the vlaai bargaining game. In this game, you'll negotiate how to split a traditional Limburg vlaai with another player. What percentage would you like to keep for yourself?");
}

// Handle sending a message
async function handleSendMessage() {
    if (chatState.isProcessing) {
        return;
    }

    const userMessage = chatElements.userInput.value.trim();
    if (!userMessage) {
        return;
    }

    // Clear input
    chatElements.userInput.value = '';

    // Add user message to chat
    addUserMessage(userMessage);

    // Process with GPT-4
    chatState.isProcessing = true;
    try {
        const response = await sendToGPT4(userMessage);
        addAssistantMessage(response);
    } catch (error) {
        console.error('Error:', error);
        addAssistantMessage("I apologize, but I encountered an error. Please try again.");
    } finally {
        chatState.isProcessing = false;
    }
}

// Add a user message to the chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.textContent = message;
    chatElements.messages.appendChild(messageDiv);
    chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
    
    // Store in chat history
    chatState.messages.push({ role: 'user', content: message });
}

// Add an assistant message to the chat
function addAssistantMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message assistant-message';
    messageDiv.textContent = message;
    chatElements.messages.appendChild(messageDiv);
    chatElements.messages.scrollTop = chatElements.messages.scrollHeight;
    
    // Store in chat history
    chatState.messages.push({ role: 'assistant', content: message });
}

// Send message to GPT-4
async function sendToGPT4(message) {
    // Note: Replace 'YOUR_API_KEY' with actual API key from environment variable
    const API_KEY = 'YOUR_API_KEY';
    const API_URL = 'https://api.openai.com/v1/chat/completions';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant explaining a vlaai bargaining game. The game involves two players deciding how to split a traditional Limburg vlaai (pie). Players take turns offering what percentage of the vlaai they want to keep for themselves. Be concise but friendly in your responses, and occasionally mention interesting facts about vlaai from the Limburg region.'
                    },
                    ...chatState.messages,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Initialize chat when the page loads
document.addEventListener('DOMContentLoaded', initializeChat); 