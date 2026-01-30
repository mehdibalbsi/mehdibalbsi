const inputText = document.getElementById("inputText");
const analyzeButton = document.getElementById("analyzeButton");
const resetButton = document.getElementById("resetButton");

const scoreValue = document.getElementById("scoreValue");
const scoreSummary = document.getElementById("scoreSummary");
const readabilityValue = document.getElementById("readabilityValue");
const repetitionValue = document.getElementById("repetitionValue");
const vocabValue = document.getElementById("vocabValue");

const sentenceSplit = /[.!?]+/g;
const wordSplit = /[^\p{L}\p{N}']+/gu;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const analyzeText = (text) => {
  const words = text
    .trim()
    .split(wordSplit)
    .filter(Boolean);

  const sentences = text
    .split(sentenceSplit)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

  const wordCounts = words.reduce((acc, word) => {
    const lowered = word.toLowerCase();
    acc.set(lowered, (acc.get(lowered) ?? 0) + 1);
    return acc;
  }, new Map());

  const repeatedWords = [...wordCounts.values()].filter((count) => count > 2)
    .length;
  const repetitionRatio = repeatedWords / Math.max(wordCounts.size, 1);

  const uniqueRatio = wordCounts.size / Math.max(words.length, 1);

  const readabilityScore = clamp(100 - Math.abs(avgWordsPerSentence - 18) * 3, 40, 100);
  const repetitionScore = clamp(100 - repetitionRatio * 120, 40, 100);
  const vocabScore = clamp(uniqueRatio * 140, 40, 100);

  const aiLikelihood = clamp(
    100 - (readabilityScore * 0.35 + repetitionScore * 0.35 + vocabScore * 0.3),
    1,
    99
  );

  return {
    aiLikelihood: Math.round(aiLikelihood),
    readabilityScore: Math.round(readabilityScore),
    repetitionScore: Math.round(repetitionScore),
    vocabScore: Math.round(vocabScore),
  };
};

const summarizeScore = (score) => {
  if (score < 35) {
    return "Low AI signature. The text feels varied and natural.";
  }
  if (score < 65) {
    return "Moderate AI signature. Consider adding more personal detail.";
  }
  return "High AI signature. Try adding unique phrasing and context.";
};

const updateUI = ({
  aiLikelihood,
  readabilityScore,
  repetitionScore,
  vocabScore,
}) => {
  scoreValue.textContent = String(aiLikelihood);
  scoreSummary.textContent = summarizeScore(aiLikelihood);
  readabilityValue.textContent = `${readabilityScore} / 100`;
  repetitionValue.textContent = `${repetitionScore} / 100`;
  vocabValue.textContent = `${vocabScore} / 100`;
};

analyzeButton.addEventListener("click", () => {
  const text = inputText.value;
  if (!text.trim()) {
    scoreValue.textContent = "--";
    scoreSummary.textContent = "Add text to see the analysis.";
    readabilityValue.textContent = "--";
    repetitionValue.textContent = "--";
    vocabValue.textContent = "--";
    return;
  }

  updateUI(analyzeText(text));
});

resetButton.addEventListener("click", () => {
  inputText.value = "";
  scoreValue.textContent = "--";
  scoreSummary.textContent = "Add text to see the analysis.";
  readabilityValue.textContent = "--";
  repetitionValue.textContent = "--";
  vocabValue.textContent = "--";
});
