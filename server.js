// ============================================
// Job Switcher - Backend Server
// Secure API key handling & OpenAI integration
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: 'gpt-3.5-turbo',
    OPENAI_TEMP: 0.5,
    OPENAI_MAX_TOKENS: 300,
    MAX_RESUME_LENGTH: 4000
};

// Validate API key is configured
if (!CONFIG.OPENAI_API_KEY) {
    console.error('ERROR: OPENAI_API_KEY is not configured in environment variables');
    process.exit(1);
}

// ============================================
// UTILITIES
// ============================================

function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, CONFIG.MAX_RESUME_LENGTH);
}

function validateInput(text, maxLength = CONFIG.MAX_RESUME_LENGTH) {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
    }
    if (text.length > maxLength) {
        throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
    }
    return true;
}

// ============================================
// ROUTES
// ============================================

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Job Switcher API is running'
    });
});

/**
 * Extract skills from resume text using OpenAI
 * POST /api/extract-skills
 * Body: { resumeText: string }
 */
app.post('/api/extract-skills', async (req, res) => {
    try {
        const { resumeText } = req.body;

        // Validate input
        validateInput(resumeText);
        const sanitizedText = sanitizeInput(resumeText);

        // Call OpenAI API
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: CONFIG.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional resume analyst. Extract key technical and professional skills from the resume. Return only a comma-separated list of skills, no explanations. If no skills are found, return an empty string.'
                    },
                    {
                        role: 'user',
                        content: `Extract skills from this resume:\n\n${sanitizedText}`
                    }
                ],
                temperature: CONFIG.OPENAI_TEMP,
                max_tokens: CONFIG.OPENAI_MAX_TOKENS
            },
            {
                headers: {
                    'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const skillsText = response.data.choices[0].message.content;
        const skills = skillsText
            .split(',')
            .map(skill => skill.trim().toLowerCase())
            .filter(skill => skill.length > 2);

        res.json({
            success: true,
            skills: skills,
            count: skills.length,
            message: `Successfully extracted ${skills.length} skills`
        });

    } catch (error) {
        console.error('Error in /api/extract-skills:', error.message);

        // Handle OpenAI API errors
        if (error.response?.status === 401) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed. Please check your API key.'
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        if (error.response?.data?.error?.message) {
            return res.status(400).json({
                success: false,
                error: error.response.data.error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to extract skills. Please try again.'
        });
    }
});

/**
 * Match jobs based on skills
 * POST /api/match-jobs
 * Body: { skills: string[] }
 */
app.post('/api/match-jobs', (req, res) => {
    try {
        const { skills } = req.body;

        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Skills array is required and must not be empty'
            });
        }

        // Jobs database (in production, this would come from a database)
        const JOBS_DATABASE = [
            {
                id: 1,
                title: "Senior React Developer",
                company: "Google India",
                location: "Bangalore",
                skills: ["react", "javascript", "html", "css", "typescript"],
                salary: "₹15-25 LPA",
                type: "Full-Time"
            },
            {
                id: 2,
                title: "Backend Node.js Engineer",
                company: "Zomato",
                location: "Gurugram",
                skills: ["node", "express", "javascript", "mongodb", "aws"],
                salary: "₹12-20 LPA",
                type: "Full-Time"
            },
            {
                id: 3,
                title: "Python Data Scientist",
                company: "Meta",
                location: "Remote",
                skills: ["python", "machine learning", "sql", "tensorflow", "aws"],
                salary: "₹18-28 LPA",
                type: "Full-Time"
            },
            {
                id: 4,
                title: "UI/UX Graphic Designer",
                company: "Canva Studio",
                location: "Remote",
                skills: ["figma", "ui design", "ux", "photoshop", "html", "css"],
                salary: "₹8-15 LPA",
                type: "Full-Time"
            },
            {
                id: 5,
                title: "Technical Product Manager",
                company: "Microsoft",
                location: "Hyderabad",
                skills: ["agile", "product management", "scrum", "analytics", "sql"],
                salary: "₹20-30 LPA",
                type: "Full-Time"
            },
            {
                id: 6,
                title: "Full Stack Developer",
                company: "Flipkart",
                location: "Bangalore",
                skills: ["react", "node", "mongodb", "aws", "docker", "typescript"],
                salary: "₹14-24 LPA",
                type: "Full-Time"
            }
        ];

        // Match jobs with skills
        const matchedJobs = JOBS_DATABASE.map(job => {
            const matchedSkills = job.skills.filter(skill =>
                skills.some(s => s.toLowerCase() === skill.toLowerCase())
            );

            return {
                ...job,
                matchPercentage: (matchedSkills.length / job.skills.length) * 100,
                matchedSkills: matchedSkills,
                missingSkills: job.skills.filter(
                    skill => !matchedSkills.includes(skill)
                )
            };
        })
        .filter(job => job.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.json({
            success: true,
            matchedJobs: matchedJobs,
            totalMatches: matchedJobs.length,
            message: `Found ${matchedJobs.length} matching job(s)`
        });

    } catch (error) {
        console.error('Error in /api/match-jobs:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to match jobs. Please try again.'
        });
    }
});

/**
 * Process resume end-to-end
 * POST /api/process-resume
 * Body: { resumeText: string }
 */
app.post('/api/process-resume', async (req, res) => {
    try {
        const { resumeText } = req.body;

        // Validate input
        validateInput(resumeText);

        // Step 1: Extract skills using OpenAI
        const sanitizedText = sanitizeInput(resumeText);

        const openaiResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: CONFIG.OPENAI_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional resume analyst. Extract key technical and professional skills. Return only a comma-separated list.'
                    },
                    {
                        role: 'user',
                        content: `Extract skills from this resume:\n\n${sanitizedText}`
                    }
                ],
                temperature: CONFIG.OPENAI_TEMP,
                max_tokens: CONFIG.OPENAI_MAX_TOKENS
            },
            {
                headers: {
                    'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const skillsText = openaiResponse.data.choices[0].message.content;
        const skills = skillsText
            .split(',')
            .map(skill => skill.trim().toLowerCase())
            .filter(skill => skill.length > 2);

        if (skills.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No skills detected in resume. Please check your resume content.'
            });
        }

        // Step 2: Match jobs (reuse database from /api/match-jobs)
        const JOBS_DATABASE = [
            {
                id: 1,
                title: "Senior React Developer",
                company: "Google India",
                location: "Bangalore",
                skills: ["react", "javascript", "html", "css", "typescript"],
                salary: "₹15-25 LPA",
                type: "Full-Time"
            },
            {
                id: 2,
                title: "Backend Node.js Engineer",
                company: "Zomato",
                location: "Gurugram",
                skills: ["node", "express", "javascript", "mongodb", "aws"],
                salary: "₹12-20 LPA",
                type: "Full-Time"
            },
            {
                id: 3,
                title: "Python Data Scientist",
                company: "Meta",
                location: "Remote",
                skills: ["python", "machine learning", "sql", "tensorflow", "aws"],
                salary: "₹18-28 LPA",
                type: "Full-Time"
            },
            {
                id: 4,
                title: "UI/UX Graphic Designer",
                company: "Canva Studio",
                location: "Remote",
                skills: ["figma", "ui design", "ux", "photoshop", "html", "css"],
                salary: "₹8-15 LPA",
                type: "Full-Time"
            },
            {
                id: 5,
                title: "Technical Product Manager",
                company: "Microsoft",
                location: "Hyderabad",
                skills: ["agile", "product management", "scrum", "analytics", "sql"],
                salary: "₹20-30 LPA",
                type: "Full-Time"
            },
            {
                id: 6,
                title: "Full Stack Developer",
                company: "Flipkart",
                location: "Bangalore",
                skills: ["react", "node", "mongodb", "aws", "docker", "typescript"],
                salary: "₹14-24 LPA",
                type: "Full-Time"
            }
        ];

        const matchedJobs = JOBS_DATABASE.map(job => {
            const matchedSkills = job.skills.filter(skill =>
                skills.some(s => s.toLowerCase() === skill.toLowerCase())
            );

            return {
                ...job,
                matchPercentage: (matchedSkills.length / job.skills.length) * 100,
                matchedSkills: matchedSkills
            };
        })
        .filter(job => job.matchPercentage > 0)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

        res.json({
            success: true,
            skills: skills,
            skillsCount: skills.length,
            matchedJobs: matchedJobs,
            jobsCount: matchedJobs.length,
            message: `Successfully processed resume. Found ${skills.length} skills and ${matchedJobs.length} matching jobs.`
        });

    } catch (error) {
        console.error('Error in /api/process-resume:', error.message);

        if (error.response?.status === 401) {
            return res.status(401).json({
                success: false,
                error: 'Authentication failed. Backend API key issue.'
            });
        }

        if (error.response?.status === 429) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to process resume. Please try again.'
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
    console.log(`✅ Job Switcher API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔐 API Key loaded: ${CONFIG.OPENAI_API_KEY ? '✓' : '✗'}`);
});

module.exports = app;
