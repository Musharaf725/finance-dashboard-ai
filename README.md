# 💰 Finance Dashboard with AI Insights

An intelligent full-stack finance tracking application that helps users manage income, expenses, budgets, and savings goals with AI-powered insights and anomaly detection.

---

## 🚀 Features

- 📊 Track income & expenses
- 📁 Categorize financial records
- 🎯 Set and monitor savings goals
- 💡 AI-powered financial insights (Gemini API)
- 🚨 Smart anomaly detection:
  - Unusual high expenses
  - Misclassified transactions
  - Budget threshold alerts
  - Goal delays
- ⚡ In-memory caching to handle API limits
- 🔁 Graceful fallback when AI fails

---

## 🛠 Tech Stack

**Frontend**
- React.js
- CSS Modules

**Backend**
- Node.js
- Express.js

**AI Integration**
- Gemini API (Google Generative AI)

**Other**
- REST APIs
- Async data aggregation
- Error handling & retry logic

---

## ⚠️ Challenges Solved

- Handled API rate limits (429 errors) using caching and fallback strategies  
- Ensured stable UI despite AI failures  
- Built structured JSON parsing from AI responses  

---

## 📌 Future Enhancements

- 📈 ML-based spending prediction
- 🤖 Personalized financial recommendations
- 📊 Data visualization improvements
- 🌍 Deployment (Vercel + Render)

---

## 🧪 Setup

```bash
git clone <repo-url>
cd project
npm install
npm start