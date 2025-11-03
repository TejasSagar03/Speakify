const pdfInput = document.getElementById('pdfInput');
const extractBtn = document.getElementById('extractBtn');
const pdfTextContainer = document.getElementById('pdfText');
const controls = document.getElementById('controls');
const textContainer = document.getElementById('textContainer');
const voiceSelect = document.getElementById('voiceSelect');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');

const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const stopBtn = document.getElementById('stopBtn');

let allText = '';
let utterance = null;

// Load available voices
function loadVoices() {
  const voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  voices.forEach(v => {
    const option = document.createElement('option');
    option.value = v.name;
    option.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(option);
  });
}

speechSynthesis.onvoiceschanged = loadVoices;

// Extract text from PDF
extractBtn.addEventListener('click', async () => {
  const file = pdfInput.files[0];
  if (!file) return alert('Please select a PDF file first.');

  const fileReader = new FileReader();
  fileReader.onload = async function() {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let extracted = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extracted += pageText + '\n\n';
    }
    allText = extracted;
    pdfTextContainer.textContent = allText;
    controls.classList.remove('hidden');
    textContainer.classList.remove('hidden');
  };
  fileReader.readAsArrayBuffer(file);
});

// Update speed label
speedRange.addEventListener('input', () => {
  speedValue.textContent = speedRange.value;
});

// Play speech
playBtn.addEventListener('click', () => {
  if (!allText.trim()) return alert('Please extract text first!');
  speechSynthesis.cancel(); // stop previous
  utterance = new SpeechSynthesisUtterance(allText);
  utterance.rate = parseFloat(speedRange.value);
  const selectedVoice = speechSynthesis.getVoices().find(v => v.name === voiceSelect.value);
  if (selectedVoice) utterance.voice = selectedVoice;
  speechSynthesis.speak(utterance);
});

// Pause
pauseBtn.addEventListener('click', () => speechSynthesis.pause());

// Resume
resumeBtn.addEventListener('click', () => speechSynthesis.resume());

// Stop
stopBtn.addEventListener('click', () => speechSynthesis.cancel());