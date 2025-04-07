// Chat elements
const chatElements = {
    messages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userMessage'),
    sendButton: document.getElementById('sendMessage'),
    toggleChat: document.getElementById('toggleChat'),
    chatContent: document.getElementById('chatContent'),
    chatSection: document.getElementById('chatSection')
};

// Chat state
const chatState = {
    messages: [],
    isProcessing: false,
    isEnabled: true // Track if chat is enabled
};

// Initialize chat
function initializeChat() {
    // Set up message handlers
    chatElements.sendButton.addEventListener('click', handleSendMessage);
    chatElements.userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Set up chat toggle
    chatElements.toggleChat.addEventListener('change', handleChatToggle);
    
    // Load chat state from localStorage
    loadChatState();

    // Add initial message if chat is enabled
    if (chatState.isEnabled) {
        addAssistantMessage("Hello! I'm here to help explain the vlaai bargaining game. Feel free to ask questions about the negotiation process!");
    }
}

// Load chat state from localStorage
function loadChatState() {
    const savedState = localStorage.getItem('vlaaiGameChatEnabled');
    if (savedState !== null) {
        chatState.isEnabled = savedState === 'true';
        chatElements.toggleChat.checked = chatState.isEnabled;
        updateChatVisibility();
    }
}

// Handle chat toggle
function handleChatToggle(e) {
    chatState.isEnabled = e.target.checked;
    localStorage.setItem('vlaaiGameChatEnabled', chatState.isEnabled);
    updateChatVisibility();
}

// Update chat visibility based on state
function updateChatVisibility() {
    if (chatState.isEnabled) {
        chatElements.chatContent.classList.remove('hidden');
        chatElements.chatSection.style.flex = '1';
    } else {
        chatElements.chatContent.classList.add('hidden');
        chatElements.chatSection.style.flex = '0 0 auto';
    }
}

// Handle sending a message
async function handleSendMessage() {
    if (chatState.isProcessing || !chatState.isEnabled) {
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
                        content: 'You are a helpful assistant explaining a vlaai bargaining game. The game involves two players deciding how to split a traditional Limburg vlaai (pie). Players take turns offering what percentage of the vlaai they want to keep for themselves. Be concise but friendly in your responses, and occasionally mention interesting facts about vlaai from the Limburg region. Focus on helping players understand fair negotiation strategies.'
                    },
                    ...chatState.messages,
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 150,
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

// Toggle chat visibility
function toggleChat() {
    const chatSection = document.querySelector('.chat-section');
    const chatContent = document.querySelector('.chat-content');
    const isEnabled = document.getElementById('chatToggle').checked;
    
    // Save preference
    localStorage.setItem('chatEnabled', isEnabled);
    
    // Toggle visibility with animation
    if (isEnabled) {
        chatSection.classList.remove('hidden');
        // Small delay to allow the section to expand before showing content
        setTimeout(() => {
            chatContent.classList.remove('hidden');
        }, 300);
    } else {
        chatContent.classList.add('hidden');
        // Wait for content to fade out before collapsing section
        setTimeout(() => {
            chatSection.classList.add('hidden');
        }, 300);
    }
}

// Initialize chat state
function initializeChat() {
    const chatEnabled = localStorage.getItem('chatEnabled') === 'true';
    const chatToggle = document.getElementById('chatToggle');
    const chatSection = document.querySelector('.chat-section');
    const chatContent = document.querySelector('.chat-content');
    
    // Set initial state
    chatToggle.checked = chatEnabled;
    if (!chatEnabled) {
        chatSection.classList.add('hidden');
        chatContent.classList.add('hidden');
    }
    
    // Add event listener
    chatToggle.addEventListener('change', toggleChat);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChat); 