const socket = io();

const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const joinButton = document.getElementById('join-btn');
const chatContainer = document.getElementById('chat-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const typing = document.getElementById('typing');
const usersList = document.getElementById('users-list');

let username = '';
let typingTimeout;

const joinChat = (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (username) {
    socket.emit('user join', username);
    usernameForm.classList.add('hidden');
    chatContainer.classList.remove('hidden');
  }
};

// Listen for both form submit and button click
usernameForm.addEventListener('submit', joinChat);
joinButton.addEventListener('click', joinChat);

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat message', message);
    messageInput.value = '';
  }
});

messageInput.addEventListener('input', () => {
  socket.emit('typing');
});

socket.on('chat message', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(data.username === username ? 'sent' : 'received');
  
  const usernameDiv = document.createElement('div');
  usernameDiv.classList.add('username');
  usernameDiv.textContent = data.username;
  
  const messageContent = document.createElement('div');
  messageContent.textContent = data.message;
  
  messageDiv.appendChild(usernameDiv);
  messageDiv.appendChild(messageContent);
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('user joined', (username) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.textContent = `${username} joined the chat`;
  messages.appendChild(messageDiv);
});

socket.on('user left', (username) => {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.textContent = `${username} left the chat`;
  messages.appendChild(messageDiv);
});

socket.on('active users', (users) => {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
});

socket.on('user typing', (username) => {
  typing.textContent = `${username} is typing...`;
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typing.textContent = '';
  }, 1000);
});