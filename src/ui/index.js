// Gom các thành phần giao diện đã tách để app cũ dùng qua window.meobooksFeatures.ui.
import { JCard, JLoading } from './shared.js';
import { JlptGame } from './jlpt-game.js';
import { makeUseJlpt } from './jlpt-hook.js';
import { makeJlptStudy } from './jlpt-study.js';
import { drawStroke, InkView } from './ink.js';
import { makeReadView } from './read-view.js';
import { makeNbEditModal } from './nb-edit-modal.js';
import { makeN2Roadmap } from './n2-roadmap.js';
import { makePomodoroWidget } from './pomodoro-widget.js';
import { makeSubjectPicker } from './subject-picker.js';
import { VocabTable } from './vocab-table.js';
import { InteractiveSentenceCard } from './interactive-sentence-card.js';
import { makeGamesHub } from './games-hub.js';
import { makePageRead } from './page-read.js';
import { makeBookViewer } from './book-viewer.js';
import { makeSmartPlan } from './smart-plan.js';
import { makeMochiPet } from './mochi-pet.js';
import { makeRmLesson } from './rm-lesson.js';
import { makeNoiTu } from './noi-tu.js';
import { makeJlptVocab } from './jlpt-vocab.js';
import { makeInkLayer } from './ink-layer.js';
import { makeBanTu } from './bantu.js';
import { makeYtListening } from './yt-listening.js';

export const ui = { JCard, JLoading, JlptGame, makeUseJlpt, makeJlptStudy, drawStroke, InkView, makeReadView, makeNbEditModal, makeN2Roadmap, makePomodoroWidget, makeSubjectPicker, VocabTable, InteractiveSentenceCard, makeGamesHub, makePageRead, makeBookViewer, makeSmartPlan, makeMochiPet, makeRmLesson, makeNoiTu, makeJlptVocab, makeInkLayer, makeBanTu, makeYtListening };
