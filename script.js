const FEEDBACK_KEY = 'arcade_feedback_v1';
let feedbacks = JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [
  { id: 1, text: 'Bitte mehr Herausforderungen hinzufügen!', vote: 'up' }
];

const list = document.getElementById('feedbackList');
const input = document.getElementById('feedbackInput');
const sentiment = document.getElementById('feedbackSentiment');
const btnSend = document.getElementById('btnSendFeedback');

function renderFeedback() {
  list.innerHTML = '';
  feedbacks.forEach(f => {
    const li = document.createElement('li');
    const icon = f.vote === 'up' ? '👍' : '👎';
    li.textContent = `${icon} ${f.text}`;
    list.appendChild(li);
  });
}

btnSend.addEventListener('click', () => {
  const val = input.value.trim();
  if (!val) return alert('Bitte gib einen Text ein!');
  feedbacks.unshift({ id: Date.now(), text: val, vote: sentiment.value });
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  input.value = '';
  renderFeedback();
});

renderFeedback();
