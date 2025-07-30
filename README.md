# Chatapp

A modern, feature-rich real-time chat application built with React and Firebase. Chatapp enables users to send text messages, images, videos, and PDF files, with a clean, responsive interface and support for AI-powered messaging.

## Features

- **Real-Time Messaging:** Exchange messages instantly using Firebase as the backend.
- **Media Support:** Share images, videos, and PDF files directly in the chat.
- **AI Integration:** Send messages to an AI assistant and receive smart responses.
- **User Presence:** See when a user is online or their last seen status.
- **Responsive UI:** Sleek design with light (day) and dark (night) modes, fully responsive for mobile and desktop.
- **Profile Avatars:** Users can set profile pictures and personalize their chats.
- **Markdown & Syntax Highlighting:** Messages support markdown formatting and code syntax highlighting.
- **File Previews:** Inline previews for images, videos, and PDF files.
- **Notifications:** Toast notifications for errors and important actions.
- **Sidebar Navigation:** Easy access to chats and contacts via sidebars.
- **Search & Add Contacts:** Search for users and start new chats seamlessly.


## Getting Started

### Prerequisites

- Node.js (v16 or above recommended)
- npm or yarn
- A Firebase project (Firestore, Authentication enabled)
- (Optional) Supabase account for file storage

### Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Krish-H/Chatapp.git
    cd Chatapp
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up Firebase:**
    - Create a `.env` file in the project root with your Firebase config:

        ```
        VITE_API_KEY=your_api_key
        VITE_AUTH_DOMAIN=your_auth_domain
        VITE_PROJECT_ID=your_project_id
        VITE_STORAGE_BUCKET=your_storage_bucket
        VITE_MESSAGING_SENDER_ID=your_sender_id
        VITE_APP_ID=your_app_id
        ```

    - (Optional) Add Supabase keys if using for file storage.

4. **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

5. **Open the app:**
    - Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- **Register/Login:** Create an account or log in with email and password.
- **Profile Setup:** Set your profile picture and name.
- **Start Chatting:** Search for users, add them to your chat list, and start messaging.
- **Send Files:** Use the gallery icon to send images, videos, or PDFs.
- **Try AI Chat:** Click on the AI icon in the chat input to interact with the AI assistant.

## Technologies Used

- **Frontend:** React, React Context, CSS Modules
- **Backend:** Firebase (Firestore, Authentication)
- **AI Assistant:** Gemini API
- **File Storage:** Firebase Storage, Supabase (for images/videos)
- **Notifications:** react-toastify
- **Markdown/Code:** react-markdown, react-syntax-highlighter

## Folder Structure

```
src/
  components/
    ChatBox/
    LeftSidebar/
    RightSidebar/
  context/
    AppContext.jsx
  pages/
    Chat/
  config/
    firebase.js
  assets/
public/
index.html
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.


## Author

[Krish-H](https://github.com/Krish-H)

---

> _Chatapp: Chat anytime, anywhere!_
