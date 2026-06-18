# 🚀 Job Switcher - AI Powered Professional Network

> Smart job matching platform that uses AI to analyze your resume and match you with relevant job opportunities.

[![Node.js](https://img.shields.io/badge/Node.js->=14.0.0-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-^4.18.2-black?logo=express)](https://expressjs.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-412991?logo=openai)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ Features

- **🤖 AI Resume Analysis** - Automatically extract skills from your resume using OpenAI GPT
- **📊 Smart Job Matching** - Get personalized job recommendations based on your skills
- **🔒 Secure API Integration** - Backend server handles sensitive API keys securely
- **♿ Accessible Design** - WCAG compliant UI with full keyboard navigation
- **📱 Responsive Layout** - Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Rate Limited API** - Protected endpoints prevent abuse
- **🎨 Modern UI** - Clean, professional interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and animations
- **Vanilla JavaScript** - No dependencies, pure JS
- **PDF.js** - Client-side PDF text extraction

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **OpenAI API** - AI-powered skill extraction
- **axios** - HTTP client
- **express-rate-limit** - API rate limiting

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) - Comes with Node.js
- **OpenAI API Key** - [Get one](https://platform.openai.com/api-keys)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/disaleshubham0-sketch/Job-Switcher-.git
cd Job-Switcher-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-proj-your-actual-key-here
```

### 4. Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

### 5. Open Frontend

Open `index.html` in your browser or serve it locally:

```bash
# Using Python 3
python -m http.server 3000

# Using Python 2
python -m SimpleHTTPServer 3000

# Using Node.js (http-server)
npx http-server -p 3000
```

Visit `http://localhost:3000` in your browser.

## 📖 How to Use

1. **Setup API Key**
   - Enter your OpenAI API key in the yellow setup box at the top

2. **Upload Resume**
   - Click the file upload button and select your PDF resume
   - File size limit: 25MB

3. **Run AI Scan**
   - Click "AI Scan Shuru Karein ✨" button
   - The app will extract text from your PDF and analyze it

4. **View Results**
   - See detected skills in the right panel
   - Browse matched jobs with match percentages
   - Click "Apply Now" to apply for jobs

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status.

### Extract Skills from Resume
```
POST /api/extract-skills
Content-Type: application/json

{
  "resumeText": "Your resume text here..."
}
```

**Response:**
```json
{
  "success": true,
  "skills": ["react", "javascript", "node"],
  "count": 3,
  "message": "Successfully extracted 3 skills"
}
```

### Match Jobs Based on Skills
```
POST /api/match-jobs
Content-Type: application/json

{
  "skills": ["react", "javascript", "node"]
}
```

**Response:**
```json
{
  "success": true,
  "matchedJobs": [
    {
      "id": 1,
      "title": "Senior React Developer",
      "company": "Google India",
      "location": "Bangalore",
      "matchPercentage": 100,
      "matchedSkills": ["react", "javascript"]
    }
  ],
  "totalMatches": 5
}
```

### Process Resume End-to-End
```
POST /api/process-resume
Content-Type: application/json

{
  "resumeText": "Your resume text here..."
}
```

**Response:**
```json
{
  "success": true,
  "skills": ["react", "javascript"],
  "skillsCount": 2,
  "matchedJobs": [...],
  "jobsCount": 5
}
```

## 🔐 Security Features

- ✅ **API Key Protection** - Keys stored on backend, never exposed to frontend
- ✅ **Input Sanitization** - All inputs validated and sanitized to prevent XSS
- ✅ **Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **CORS Configuration** - Restricted to allowed origins
- ✅ **Error Handling** - Secure error messages without exposing sensitive data
- ✅ **Environment Variables** - Sensitive config stored in `.env`

## 📁 Project Structure

```
Job-Switcher-/
├── index.html              # Frontend UI
├── server.js               # Backend API server
├── package.json            # Node.js dependencies
├── .env.example            # Environment variables template
├── .env                    # Environment variables (create from .env.example)
└── README.md               # This file
```

## 🎯 Available Jobs Database

The app includes a mock database of 6 sample jobs:

1. **Senior React Developer** - Google India (Bangalore)
2. **Backend Node.js Engineer** - Zomato (Gurugram)
3. **Python Data Scientist** - Meta (Remote)
4. **UI/UX Graphic Designer** - Canva Studio (Remote)
5. **Technical Product Manager** - Microsoft (Hyderabad)
6. **Full Stack Developer** - Flipkart (Bangalore)

*In production, this would connect to a real job database API.*

## 🛠️ Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Structure

**Frontend (index.html)**
- Configuration section (PDF limits, skill keywords)
- Utility functions (text sanitization, skill extraction)
- API integration (OpenAI calls)
- UI rendering and event handling

**Backend (server.js)**
- Express middleware setup
- Route handlers for API endpoints
- Error handling
- Rate limiting configuration

## 🐛 Troubleshooting

### "PDF.js library not loaded"
- Check your internet connection
- Verify CDN URL is accessible

### "No skills detected"
- Ensure your PDF is text-based (not scanned images)
- Try uploading a different resume

### "Authentication failed"
- Check your OpenAI API key is correct
- Verify your account has credits

### "Rate limit exceeded"
- Wait 15 minutes before making more requests
- Reduce the number of API calls

### Backend not responding
- Ensure `npm install` was run successfully
- Check `.env` file has `OPENAI_API_KEY` set
- Verify port 5000 is not in use

## 🚀 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-proj-your-key

# Deploy
git push heroku main
```

### Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## 📚 Learning Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com/guide/routing.html)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Shubham Disale**

- GitHub: [@disaleshubham0-sketch](https://github.com/disaleshubham0-sketch)
- Email: disaleshubham0@gmail.com

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for the powerful GPT API
- [Mozilla](https://www.mozilla.org/) for PDF.js library
- [Express.js](https://expressjs.com/) community
- All contributors and supporters

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an [Issue](https://github.com/disaleshubham0-sketch/Job-Switcher-/issues)
3. Contact the author

---

<div align="center">

**Made with ❤️ by Job Switcher Team**

⭐ If you found this helpful, please give it a star!

</div>
