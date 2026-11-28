import LegacyHost from './LegacyHost.jsx';
import { ui } from '../ui/index.js';
import * as pomodoro from '../features/pomodoro.js';
import * as mochiPet from '../features/mochi-pet.js';
import * as bantu from '../features/bantu.js';
import { youtubeText } from '../features/youtube-text.js';
import * as noitu from '../features/noitu.js';
import * as reader from '../features/reader.js';
import * as roadmap from '../features/roadmap.js';
import * as vocab from '../features/vocab.js';
import * as plan from '../features/plan.js';
import * as srs from '../features/srs.js';
import * as answer from '../features/answer.js';
import * as smartSession from '../features/smart-session.js';
import * as question from '../features/question.js';
import * as progression from '../features/progression.js';
import * as studyFlow from '../features/study-flow.js';
import * as studySession from '../features/study-session.js';
import * as vocabList from '../features/vocab-list.js';
import * as bulkVocab from '../features/bulk-vocab.js';
import * as dataMerge from '../features/data-merge.js';
import * as seed from '../features/seed.js';
import * as syncPolicy from '../features/sync-policy.js';

// Legacy là script thuần nên không import được từ src/. App gắn các hàm logic lên window
// trước khi nạp app cũ; legacy đọc qua window.meobooksFeatures (cùng trang).
window.meobooksFeatures = { pomodoro, mochiPet, bantu, youtubeText, noitu, reader, roadmap, vocab, plan, srs, answer, smartSession, question, progression, studyFlow, studySession, vocabList, bulkVocab, dataMerge, seed, syncPolicy, ui };

// Giai đoạn 1: app cũ được nạp trực tiếp vào trang (không còn iframe).
const LEGACY_URL = `${import.meta.env.BASE_URL}legacy/index.html`;

export default function App() {
  return <LegacyHost url={LEGACY_URL} />;
}
