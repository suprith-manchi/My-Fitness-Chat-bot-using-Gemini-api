import { GoogleGenerativeAI } from "@google/generative-ai";
import md from "markdown-it";

// Initialize the model
const genAI = new GoogleGenerativeAI(`${" PUT YOUR GEMINI API HEAR "}`);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let history = [];

const healthKeywords = [
  "health", "wellness", "fitness", "nutrition", "exercise", "diet", 
  "mental health", "therapy", "hi", "symptoms", "workout", "training", 
  "strength", "cardio", "weightlifting", "crossfit", "bodybuilding", 
  "aerobics", "pilates", "yoga", "flexibility", "mobility", "endurance", 
  "hiit", "fat loss", "muscle gain", "calisthenics", "recovery", "hydration", 
  "protein", "calories", "supplements", "macros", "vitamins", "sleep", 
  "stretching", "warm-up", "cool-down", "heart rate", "metabolism", 
  "personal trainer", "injury prevention", "body composition", "core strength", 
  "circuit training", "powerlifting", "squats", "deadlifts", "bench press", 
  "kettlebells", "dumbbells", "resistance bands", "physical therapy","BMI","body","mass","bmi","body mass index","calorie","deficiet","suppress"
];


function isHealthRelated(prompt) {
  return healthKeywords.some(keyword => prompt.toLowerCase().includes(keyword));
}

async function getResponse(prompt) {
  const healthPrompt = `As a health and wellness assistant, please answer the following question: ${prompt}`;
  
  const chat = await model.startChat({ history: history });
  const result = await chat.sendMessage(healthPrompt);
  const response = await result.response;
  const text = response.text();

  console.log(text);
  return text;
}

// User chat div
export const userDiv = (data) => {
  return `
  <!-- User Chat -->
          <div class="flex items-center gap-2 justify-start m-2">
            <img src="human.png" alt="user icon" class="w-10 h-10 rounded-full"/>
            <div class="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2">${data}</div>
          </div>
  `;
};

// AI Chat div
export const aiDiv = (data) => {
  return `
  <!-- AI Chat -->
          <div class="flex gap-2 justify-end m-2">
            <div class="bg-gemDeep text-white p-1 rounded-md shadow-md mx-2">${data}</div>
            <img src="bot.png" alt="bot icon" class="w-10 h-10 rounded-full"/>
          </div>
  `;
};

async function handleSubmit(event) {
  event.preventDefault();

  let userMessage = document.getElementById("prompt");
  const chatArea = document.getElementById("chat-container");

  var prompt = userMessage.value.trim();
  if (prompt === "") {
    return;
  }

  console.log("user message", prompt);

  chatArea.innerHTML += userDiv(md().render(prompt));
  userMessage.value = "";

  if (prompt.toLowerCase() === "what are the questions i can ask" || prompt.toLowerCase() === "sample questions") {
    const sampleQuestionsText = "Here are some sample questions you can ask:\n\n" + sampleQuestions.map(q => `- ${q}`).join("\n");
    chatArea.innerHTML += aiDiv(md().render(sampleQuestionsText));
  } else if (isHealthRelated(prompt)) {
    const aiResponse = await getResponse(prompt);
    let md_text = md().render(aiResponse);
    chatArea.innerHTML += aiDiv(md_text);

    let newUserRole = {
      role: "user",
      parts: prompt,
    };
    let newAIRole = {
      role: "model",
      parts: aiResponse,
    };

    history.push(newUserRole);
    history.push(newAIRole);
  } else {
    const redirectMessage = "Please ask questions related to health and wellness.";
    chatArea.innerHTML += aiDiv(md().render(redirectMessage));
  }

  console.log(history);
}

// Function to greet the user when the page loads
function greetUser() {
  const chatArea = document.getElementById("chat-container");
  const greeting = "Hello, welcome to MyFitness chatbot. I can assist you with health and fitness-related queries.";
  chatArea.innerHTML += aiDiv(md().render(greeting));
}

// Attach the form submit event listener
const chatForm = document.getElementById("chat-form");
chatForm.addEventListener("submit", handleSubmit);

chatForm.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) handleSubmit(event);
});

// Greet the user when the page loads
window.onload = () => {
  greetUser();  // Greets user as soon as the page loads
};
