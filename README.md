# Remix of Remix of Lingua Buddy

Build a modern, friendly and user-friendly AI-powered application designed specifically for an online English tutor and their students.

The application must solve real problems that I experience as an English tutor: keeping accurate lesson notes, remembering student mistakes, creating personalised homework and vocabulary practice, planning what students should study between lessons, researching corrections I may have missed, and responding efficiently to new students.

The application must have THREE CORE AI FEATURES, plus an automated new-student onboarding feature.

1. AI LESSON NOTE SUMMARISER

Create an AI lesson note summariser that allows me to upload, paste or provide a transcript of an English lesson.

The AI must analyse the lesson and create a clear, structured summary containing ONLY relevant information from the lesson.

The summary must include:

Lesson Topic

What was the main topic discussed during the lesson?

What We Talked About

Give a concise summary of the main points, conversations and activities covered.

Mistakes & Corrections

Record important mistakes made by the student during the lesson.

For each important mistake, show:

What the student said

The corrected version

A simple explanation of the correction

Prioritise meaningful mistakes rather than listing every tiny error.

New Vocabulary

List the new vocabulary, expressions or phrases introduced during the lesson.

For each item include:

Word/phrase

Simple meaning

Example sentence

Homework

Generate homework based specifically on what was covered or what the student struggled with during the lesson.

Next Lesson Focus

Identify what the tutor and student should focus on during the next lesson.

The AI must not invent information that was not present in the lesson.

The tutor must be able to edit the AI-generated summary before it is saved or shared with the student.

Allow lesson summaries to be saved under each student's profile so that the tutor can review previous lessons.

2. AI TASK PLANNER

Create an AI-powered task planner for students.

The planner should use information from previous lesson summaries, mistakes, vocabulary and the student's English level to create personalised learning tasks.

The planner must have both:

Daily Tasks

Show the student a small number of achievable tasks for that day.

Examples:

Learn 5 new vocabulary words

Review yesterday's vocabulary

Create sentences using today's words

Complete a short grammar exercise

Practise speaking for 10 minutes

Listen to a short English conversation

The student should be able to mark tasks as completed.

Weekly Tasks

Generate a personalised weekly learning plan based on the student's recent lessons.

The plan should include:

Vocabulary

Grammar practice

Speaking

Listening

Reading where appropriate

Homework

Revision

Do not overwhelm the student with too many tasks.

The AI should prioritise the areas where the student needs the most improvement.

3. ENGLISH FUN FACTS

Add an interesting "English Fun Fact" feature to make learning less boring.

Students should be able to choose the category/topic of the fun fact they want to receive.

Possible categories include:

History

Culture

Science

Animals

Travel

Food

Technology

Business

Language

Countries

Interesting people

Sports

Random

The AI should generate a short, interesting and easy-to-understand English fun fact appropriate to the student's English level.

The student should be able to choose:

Topic

Difficulty/English level

How often they want to receive a fun fact

The purpose is to make English learning feel enjoyable rather than like constant studying.

4. AI RESEARCH ASSISTANT FOR THE TUTOR

Create an AI research assistant specifically for me as the tutor.

One of the problems I experience is that I sometimes miss mistakes when a student is speaking or writing quickly.

The Research Assistant should allow me to enter or paste a student's sentence and ask the AI to analyse it.

For example:

Student sentence:
"I am working in this company since three years."

The AI should identify the problem and explain:

Whether the sentence is correct

What is wrong

The corrected sentence

Why the correction is necessary

A natural alternative a native speaker might use

The relevant grammar concept

The assistant should also be able to analyse multiple sentences and identify recurring patterns in the student's mistakes.

For example:

"Analyse these 20 sentences and identify the student's three most common grammar problems."

The AI should help the tutor catch mistakes that may have been missed during a live lesson.

The Research Assistant should also allow the tutor to ask questions such as:

"Why is this sentence incorrect?"

"Is this sentence grammatically correct?"

"Give me a simpler explanation I can give my student."

"Create three practice exercises based on this mistake."

"What should I teach next based on these mistakes?"

"Give me examples appropriate for a B1 student."

The tutor remains responsible for reviewing AI-generated explanations before teaching them.

5. AUTOMATED NEW-STUDENT WELCOME MESSAGE

Create an automated onboarding feature for new students.

When a new student is added, the application should automatically generate and send a friendly welcome message.

The message should be warm, natural and conversational rather than sounding like an automated business email.

The purpose of the message is to introduce the tutor and collect important information about the new student.

The message should ask:

What are your English learning goals?

What is your current English level?

Why are you learning English?

What would you like to improve?

Is there a particular topic or industry you want to focus on?

The message should be automatically sent to every new student after they are added.

Allow the tutor to edit or customise the message if necessary.

Example tone:

"Hey! 😊 It's really nice to meet you! Before we get started, I'd love to learn a little more about you. What are your English learning goals, and what would you say your current English level is? Also, is there anything specific you'd like us to focus on during our lessons?"

The tutor should not have to manually type this message for every new student.

6. ENGLISH LEVELS

The application must support CEFR levels:

A1

A2

B1

B2

C1

C2

The AI must adapt vocabulary, grammar explanations, activities, fun facts, listening activities and task difficulty to the student's level.

7. INDUSTRY-SPECIFIC LEARNING

Students should be able to select their industry or professional field.

Include:

Sales

Marketing

Engineering

Medicine/Healthcare

Finance

Information Technology

Human Resources

Education

Business Administration

Hospitality

Customer Service

Project Management

The AI should use the student's selected industry to personalise vocabulary, examples, scenarios, conversations and activities.

8. REAL-LIFE ENGLISH TOPICS

Include practical topics such as:

Travel

Restaurants

Shopping

Social conversations

Workplace conversations

Meetings

Presentations

Job interviews

Networking

Customer service

Giving opinions

Problem-solving

Negotiations

Making phone calls

Emails

Everyday conversations

The goal is to help students use English in real situations.

9. LISTENING ACTIVITIES

Include a listening section with exposure to different English accents.

Include accents such as:

South African English

British English

American English

Australian English

Irish English

Indian English

The purpose is to help students understand different varieties of spoken English, not to rank accents.

Include:

Short listening activities

Conversations

Comprehension questions

Vocabulary from the audio

Transcripts

Replay functionality

Difficulty appropriate to the student's level

10. USER EXPERIENCE / UI DESIGN

The application must be extremely easy to navigate.

Use a modern, friendly and professional design.

Primary brand colours:

Navy blue

Yellow

Pink

Use navy blue as the main structural colour and yellow and pink as accent colours.

Maintain strong readability and accessibility. Do not use excessive colours.

Create two main experiences:

Tutor Dashboard

The tutor should be able to quickly access:

Students

Upcoming lessons

Lesson summaries

Student mistakes

Student vocabulary

Homework

Student progress

AI Research Assistant

New-student onboarding

Student Dashboard

The student should be able to see:

Their English level

Learning goals

Today's tasks

Weekly learning plan

Vocabulary

Homework

Progress

Fun Facts

Listening activities

Upcoming lesson

The most important information should be visible immediately without requiring the user to search through multiple menus.

11. RESPONSIBLE AI

Build responsible AI principles into the application.

The application must:

Clearly indicate when information has been generated by AI.

Allow tutors to review AI-generated lesson summaries.

Allow tutors to edit AI corrections and recommendations.

Protect student information.

Obtain appropriate consent before recording or analysing lessons.

Avoid making unsupported assumptions about a student's ability.

Avoid treating AI-generated corrections as automatically perfect.

Encourage human review.

Handle student recordings and transcripts responsibly.

Avoid judging accents as better or worse.

Clearly distinguish between information from the lesson and AI-generated recommendations.

12. PROMPT ENGINEERING

The application must demonstrate practical prompt engineering.

AI prompts should use relevant context such as:

Student's English level

Industry

Learning goals

Previous mistakes

Previous vocabulary

Lesson topic

Learning history

Specific task requirements

Use structured prompts and clearly defined output formats.

Demonstrate iterative prompt improvement.

For example:

Basic prompt:

"Find the mistakes in this sentence."

Improved prompt:

"You are an English tutor assistant. Analyse the following sentence written by a B1-level student. Identify the grammatical error, explain the problem in simple language suitable for a B1 learner, provide the corrected sentence, provide one natural alternative, and create one short practice exercise based on the mistake."

The application should demonstrate how providing more context produces more useful and personalised AI responses.

13. COMPLETE USER JOURNEY

The application should connect all features rather than treating them as separate tools.

The intended workflow is:

NEW STUDENT
↓
Automated welcome message
↓
Student provides English level, goals and interests
↓
Tutor teaches lesson
↓
Lesson transcript is provided to AI
↓
AI Lesson Note Summariser
↓
Topic + discussion + mistakes + corrections + vocabulary + homework + next lesson focus
↓
Tutor reviews and approves the summary
↓
AI Task Planner uses the lesson information
↓
Daily + weekly personalised tasks
↓
Student practises vocabulary and English
↓
Student receives interesting English Fun Facts
↓
Student completes listening and other activities
↓
Tutor uses AI Research Assistant to investigate missed mistakes
↓
Tutor prepares the next lesson
↓
Next lesson builds on previous weaknesses
↓
Student progress is continuously updated

The application should feel like one connected system that supports the student throughout their learning journey while reducing the tutor's administrative workload.

FINAL DESIGN GOAL

The application should demonstrate:

Practical AI implementation

Strong prompt engineering

Real-world problem solving

Responsible AI usage

User-friendly UX/UI design

Do not build a generic AI chatbot.

Build a focused AI English tutoring assistant that solves genuine problems for both the tutor and the student.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6f76fd9e-1aa2-4515-a150-e4c06dbf0dad).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
