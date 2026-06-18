const request = require('supertest');
const app = require('../server');

describe('Job Switcher API', () => {
    // ==================== HEALTH CHECK ====================
    describe('GET /api/health', () => {
        it('should return 200 and server status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('status', 'OK');
            expect(res.body).toHaveProperty('message');
        });
    });

    // ==================== EXTRACT SKILLS ====================
    describe('POST /api/extract-skills', () => {
        it('should extract skills from resume text', async () => {
            const resumeText = 'I have 5 years of experience with React, Node.js, and MongoDB. I also know Python and AWS.';
            const res = await request(app)
                .post('/api/extract-skills')
                .send({ resumeText });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('skills');
            expect(Array.isArray(res.body.skills)).toBe(true);
            expect(res.body.skills.length).toBeGreaterThan(0);
        });

        it('should return error for empty resume text', async () => {
            const res = await request(app)
                .post('/api/extract-skills')
                .send({ resumeText: '' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return error for missing resumeText', async () => {
            const res = await request(app)
                .post('/api/extract-skills')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should handle text exceeding max length', async () => {
            const longText = 'a'.repeat(10000);
            const res = await request(app)
                .post('/api/extract-skills')
                .send({ resumeText: longText });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });
    });

    // ==================== MATCH JOBS ====================
    describe('POST /api/match-jobs', () => {
        it('should match jobs based on skills', async () => {
            const skills = ['react', 'javascript', 'node'];
            const res = await request(app)
                .post('/api/match-jobs')
                .send({ skills });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('matchedJobs');
            expect(Array.isArray(res.body.matchedJobs)).toBe(true);
            
            if (res.body.matchedJobs.length > 0) {
                const job = res.body.matchedJobs[0];
                expect(job).toHaveProperty('title');
                expect(job).toHaveProperty('company');
                expect(job).toHaveProperty('matchPercentage');
                expect(job).toHaveProperty('matchedSkills');
            }
        });

        it('should return error for empty skills array', async () => {
            const res = await request(app)
                .post('/api/match-jobs')
                .send({ skills: [] });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return error for missing skills', async () => {
            const res = await request(app)
                .post('/api/match-jobs')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return empty array for no matching skills', async () => {
            const skills = ['xyz123', 'abc456'];
            const res = await request(app)
                .post('/api/match-jobs')
                .send({ skills });

            expect(res.statusCode).toBe(200);
            expect(res.body.matchedJobs.length).toBe(0);
        });

        it('should sort jobs by match percentage', async () => {
            const skills = ['react', 'javascript', 'node', 'express', 'mongodb'];
            const res = await request(app)
                .post('/api/match-jobs')
                .send({ skills });

            expect(res.statusCode).toBe(200);
            
            if (res.body.matchedJobs.length > 1) {
                for (let i = 0; i < res.body.matchedJobs.length - 1; i++) {
                    expect(res.body.matchedJobs[i].matchPercentage)
                        .toBeGreaterThanOrEqual(res.body.matchedJobs[i + 1].matchPercentage);
                }
            }
        });
    });

    // ==================== PROCESS RESUME ====================
    describe('POST /api/process-resume', () => {
        it('should process resume end-to-end', async () => {
            const resumeText = 'Senior Developer with 5 years experience in React, Node.js, MongoDB, and AWS. Proficient in JavaScript and TypeScript.';
            const res = await request(app)
                .post('/api/process-resume')
                .send({ resumeText });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('skills');
            expect(res.body).toHaveProperty('skillsCount');
            expect(res.body).toHaveProperty('matchedJobs');
            expect(res.body).toHaveProperty('jobsCount');
            expect(Array.isArray(res.body.skills)).toBe(true);
            expect(Array.isArray(res.body.matchedJobs)).toBe(true);
        });

        it('should return error for empty resume', async () => {
            const res = await request(app)
                .post('/api/process-resume')
                .send({ resumeText: '' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should return error for missing resumeText', async () => {
            const res = await request(app)
                .post('/api/process-resume')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should handle no skills detected', async () => {
            const resumeText = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
            const res = await request(app)
                .post('/api/process-resume')
                .send({ resumeText });

            // Could either be error or return empty skills, depending on backend behavior
            expect([200, 400]).toContain(res.statusCode);
        });
    });

    // ==================== ERROR HANDLING ====================
    describe('Error Handling', () => {
        it('should return 404 for non-existent endpoint', async () => {
            const res = await request(app).get('/api/nonexistent');
            expect(res.statusCode).toBe(404);
            expect(res.body).toHaveProperty('success', false);
        });

        it('should handle malformed JSON', async () => {
            const res = await request(app)
                .post('/api/extract-skills')
                .set('Content-Type', 'application/json')
                .send('invalid json');

            expect(res.statusCode).toBe(400);
        });
    });

    // ==================== RATE LIMITING ====================
    describe('Rate Limiting', () => {
        it('should allow requests within rate limit', async () => {
            const skills = ['react'];
            for (let i = 0; i < 3; i++) {
                const res = await request(app)
                    .post('/api/match-jobs')
                    .send({ skills });
                
                expect(res.statusCode).toBe(200);
            }
        });
    });
});
