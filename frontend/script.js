const chatbotTrigger = document.getElementById('chatbot-trigger');
const chatbotWindow = document.getElementById('chatbot-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');
const chatMessages = document.getElementById('chatbot-messages');

const API_ENDPOINT = 'https://babynest-ubhk.onrender.com/api/chat';
const SESSION_ID = 'temp-user-session-123';

chatbotTrigger.addEventListener('click', () => {
    chatbotWindow.classList.add('active');
    chatbotTrigger.style.display = 'none';
    chatInput.focus();
});

closeChat.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
    chatbotTrigger.style.display = 'flex';
});

function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'user-message' : 'bot-message';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = content;

    messageContent.appendChild(messageParagraph);
    messageDiv.appendChild(messageContent);

    const quickButtons = document.querySelector('.quick-buttons');
    if (quickButtons && quickButtons.parentElement === chatMessages) {
        chatMessages.insertBefore(messageDiv, quickButtons);
    } else {
        chatMessages.appendChild(messageDiv);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'bot-message typing-message';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    const quickButtons = document.querySelector('.quick-buttons');
    if (quickButtons && quickButtons.parentElement === chatMessages) {
        chatMessages.insertBefore(typingDiv, quickButtons);
    } else {
        chatMessages.appendChild(typingDiv);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentElement) {
        indicator.parentElement.removeChild(indicator);
    }
}

async function sendMessageToAPI(message, action = null) {
    const typingIndicator = showTypingIndicator();

    try {
        const userRequestContent = action ? action : message;

        if (!userRequestContent) {
            removeTypingIndicator(typingIndicator);
            console.warn('Attempted to send empty message/action.');
            return; 
        }

        const payload = {
            user_request: userRequestContent, 
            session_id: SESSION_ID,
        };

        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        removeTypingIndicator(typingIndicator);

        if (data.output) {
            addMessage(data.output);
        } else if (data.message) {
            addMessage(data.message);
        } else {
            addMessage('I received your message. How else can I help you?');
        }
    } catch (error) {
        removeTypingIndicator(typingIndicator);
        console.error('Error communicating with chatbot:', error);
        addMessage('Sorry, I\'m having trouble connecting right now. Please try again later.');
    }
}

function handleSendMessage() {
    const message = chatInput.value.trim();

    if (message) {
        addMessage(message, true);
        chatInput.value = '';
        sendMessageToAPI(message);
    }
}

sendButton.addEventListener('click', handleSendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

const quickButtons = document.querySelectorAll('.quick-button');
quickButtons.forEach(button => {
    button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        const buttonText = button.textContent;

        addMessage(buttonText, true);

        sendMessageToAPI(null, action);
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    button.addEventListener('click', () => {
        chatbotWindow.classList.add('active');
        chatbotTrigger.style.display = 'none';
        chatInput.focus();
    });
});
