import OpenAI from "openai";

let openai;

function showApiKeyModal() {
  const modal = document.getElementById("apikey-modal");
  modal.style.display = "flex";
}

function hideApiKeyModal() {
  const modal = document.getElementById("apikey-modal");
  modal.style.display = "none";
}

function getApiKey() {
  return localStorage.getItem("openai_api_key");
}

function setApiKey(key) {
  localStorage.setItem("openai_api_key", key);
}

function initOpenAI() {
  const key = getApiKey();
  if (!key) {
    showApiKeyModal();
    return false;
  }
  openai = new OpenAI({
    dangerouslyAllowBrowser: true,
    apiKey: key,
  });
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!initOpenAI()) {
    document.getElementById("apikey-save").onclick = () => {
      const key = document.getElementById("apikey-input").value.trim();
      if (key.startsWith("sk-")) {
        setApiKey(key);
        hideApiKeyModal();
        initOpenAI();
      } else {
        alert("Please enter a valid OpenAI API key starting with sk-");
      }
    };
  }
});

const btn = document.querySelector(`button[type="submit"]`)
const form = document.querySelector(`form`)

form.addEventListener("submit", async (e) =>{
  e.preventDefault()
  if (btn.innerText === "Start Over") {
    form.reset();
    document.querySelector(".lang").style.display = "block";
    document.querySelector(".head1").innerHTML = "Text to translate &#128071;";
    document.querySelector(".head2").innerHTML = "Select language &#128071;";
    form.querySelector("#output").style.display = "none";
    btn.innerText = "Translate";
    return;
  }
  if (!openai && !initOpenAI()) {
    return;
  }
  const formData = new FormData(form);
  const result = await translate(formData.get("input"), formData.get("lang"))
  document.querySelector(".lang").style.display = "none";
  document.querySelector(".head1").innerHTML = "Original Text &#128071;";
  document.querySelector(".head2").innerHTML = "Your translation &#128071;";
  form.querySelector("#output").innerText = result;
  btn.innerText = "Start Over";
  form.querySelector("#output").style.display = "block";
})

const translate = async (text, lang) => {
  if (!openai && !initOpenAI()) {
    return "No API key provided.";
  }
  const messages = [
    {
      role: "system",
      content: `You are a helpful polyglot assistant that is an expert in translating text into various languages. You will translate the text provided by the user into the specified language. In your answer, you will only provide the translated text without any additional commentary or explanation. You may add a descriptive emoji if applicable.`
    },
    {
      role: "user",
      content: "Translate the following text into " + lang + ": " + text
    }
  ]
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  });

  if (!response || !response.choices || response.choices.length === 0) {
    return "No response from the AI model. Try again later.";
  }
  
  return response.choices[0].message.content;
}