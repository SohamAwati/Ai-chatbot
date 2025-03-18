const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

// API setup
const API_KEY = "AIzaSyDwnyuPuiEJIHWWGQRsesSGQNDWEpdJJPE"; // Add your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?
key=${API_KEY}`;

const userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// Generate bot response using the API
const generateBotResponse = async(incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");

    // Add user message to chat history
    chatHistory.push({
        role: "user",
        parts:[{text: userData.message}, ...(userData.file.data ? [{ inline_data: userData.file}] : [])]
       });

    // API request options
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       contents: chatHistory
    })

  }

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();
    if(!response.ok) throw new Error(data.error.message);

    // Extract and display bot response
    const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
    messageElement.innerText = apiResponseText;

    // Add bot response to chat history
    chatHistory.push({
        role: "model",
        parts:[{text: apiResponseText}]
       });
  } catch (error) {
    // Handle error in API response
    console.log(error);
    messageElement.innerText = error.message;
    messageElement.style.color = "#ff0000";
  } finally {
    // Reset user's file data , remove thinking indicator and scroll to the bottom
    userData.file ={};
    incomingMessageDiv.classList.remove("thinking");
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
  }
}

// Handle outgoing user message
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    fileUploadWrapper.classList.remove("file-uploaded");
    messageInput.dispatchEvent(new Event("input"));

    // Create and display user message
    const messageContent = `<div class="message-text"></div>
                            ${userData.file.data ? `<img src = "data:${userData.file.mime_type};base64,${userData.file.data}" class = "attachment"/>` : ""}`;

    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    // Simulate bot response with thinking indicator after a delay
    setTimeout(() => {
        const messageContent = ` <svg class = "bot-avatar" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <!-- Uploaded to SVGRepo https://www.svgrepo.com -->
                        <title>ic_fluent_bot_24_filled</title>
                        <desc>Created with Sketch.</desc>
                        <g id="🔍-Product-Icons" stroke="none" stroke-width="1">
                            <g id="ic_fluent_bot_24_filled" >
                                <path d="M17.7530511,13.999921 C18.9956918,13.999921 20.0030511,15.0072804 20.0030511,16.249921 L20.0030511,17.1550008 C20.0030511,18.2486786 19.5255957,19.2878579 18.6957793,20.0002733 C17.1303315,21.344244 14.8899962,22.0010712 12,22.0010712 C9.11050247,22.0010712 6.87168436,21.3444691 5.30881727,20.0007885 C4.48019625,19.2883988 4.00354153,18.2500002 4.00354153,17.1572408 L4.00354153,16.249921 C4.00354153,15.0072804 5.01090084,13.999921 6.25354153,13.999921 L17.7530511,13.999921 Z M11.8985607,2.00734093 L12.0003312,2.00049432 C12.380027,2.00049432 12.6938222,2.2826482 12.7434846,2.64872376 L12.7503312,2.75049432 L12.7495415,3.49949432 L16.25,3.5 C17.4926407,3.5 18.5,4.50735931 18.5,5.75 L18.5,10.254591 C18.5,11.4972317 17.4926407,12.504591 16.25,12.504591 L7.75,12.504591 C6.50735931,12.504591 5.5,11.4972317 5.5,10.254591 L5.5,5.75 C5.5,4.50735931 6.50735931,3.5 7.75,3.5 L11.2495415,3.49949432 L11.2503312,2.75049432 C11.2503312,2.37079855 11.5324851,2.05700336 11.8985607,2.00734093 L12.0003312,2.00049432 L11.8985607,2.00734093 Z M9.74928905,6.5 C9.05932576,6.5 8.5,7.05932576 8.5,7.74928905 C8.5,8.43925235 9.05932576,8.99857811 9.74928905,8.99857811 C10.4392523,8.99857811 10.9985781,8.43925235 10.9985781,7.74928905 C10.9985781,7.05932576 10.4392523,6.5 9.74928905,6.5 Z M14.2420255,6.5 C13.5520622,6.5 12.9927364,7.05932576 12.9927364,7.74928905 C12.9927364,8.43925235 13.5520622,8.99857811 14.2420255,8.99857811 C14.9319888,8.99857811 15.4913145,8.43925235 15.4913145,7.74928905 C15.4913145,7.05932576 14.9319888,6.5 14.2420255,6.5 Z" id="🎨-Color"></path>
                            </g>
                        </g>
                    </svg>
                    <div class = "message-text">
                        <div class = "thinking-indicator">
                            <div class = "dot"></div>
                            <div class = "dot"></div>
                            <div class = "dot"></div>
                        </div>
                    </div>`;

        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        generateBotResponse(incomingMessageDiv);
    },600);
}

// Handle Enter key press for sending messages
messageInput.addEventListener("keydown", (e) => {
 const userMessage = e.target.value.trim();
 if (e.key == "Enter" && userMessage && !e.shiftKey && window.innerWidth > 768) {
     handleOutgoingMessage(e);
 }
});

// Auto resize message input based on content
messageInput.addEventListener("input", () => {
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// Handle file input change and preview selected file
fileInput.addEventListener("change", (e) => {
    const file = fileInput.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        const bass64String = e.target.result.split(",")[1];

        // Store file data in userData
        userData.file = {
            data: bass64String,
            mime_type: file.type
        }
        
        fileInput.value = "";
    }

    reader.readAsDataURL(file);
});

// Clear file data on cancel
fileCancelButton.addEventListener("click", () => {
    userData.file = {};
    fileUploadWrapper.classList.remove("file-uploaded");
});

// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewPosition: "none",
    onEmojiSelect: (emoji) => {
        const {selectionStart: start, selectionEnd: end} = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
    },
    onClickOutside: (e) => {
        if(e.target.id === "emoji-picker") {
            document.body.classList.toggle("show-emoji-picker");
        } else {
            document.body.classList.remove("show-emoji-picker");
        }
    }
});

document.querySelector(".chat-form").appendChild(picker);

sendMessage.addEventListener("click", (e) => handleOutgoingMessage(e));
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot")); 
 