import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyBbVPQFff6Wgtacmnny8Jr5X1SvhWPGPYs";

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseModalities: [],
  responseMimeType: "text/plain",
};

function getExtensionFromMimeType(mimeType) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "text/plain": "txt",
    "text/html": "html",
  };
  return mimeMap[mimeType] || "bin";
}

async function run(prompt) {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  try {
    // Adjust the prompt to remove unnecessary introductions
    const cleanPrompt = `Respond with only the direct answer. No introductions, no explanations. Format the output properly.\n\n${prompt}`;

    const result = await chatSession.sendMessage(cleanPrompt);
    const candidates = result.response.candidates;

    // Optional: Download binary content if needed
    for (let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      for (let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
        const part = candidates[candidate_index].content.parts[part_index];
        if (part.inlineData) {
          const blob = new Blob(
            [Buffer.from(part.inlineData.data, "base64")],
            { type: part.inlineData.mimeType }
          );
          const url = URL.createObjectURL(blob);
          const ext = getExtensionFromMimeType(part.inlineData.mimeType);
          const a = document.createElement("a");
          a.href = url;
          a.download = `output_${candidate_index}_${part_index}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }
    }

    // ✅ Return only the text response!
    return result.response.text();

  } catch (error) {
    console.error("Error during chat request:", error);
    return undefined;
  }
}

export default run;
