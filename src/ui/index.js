// Gom các thành phần giao diện đã tách để app cũ dùng qua window.meobooksFeatures.ui.
import { JCard, JLoading } from './shared.js';
import { JlptGame } from './jlpt-game.js';
import { makeUseJlpt } from './jlpt-hook.js';
import { makeJlptStudy } from './jlpt-study.js';
import { drawStroke, InkView } from './ink.js';
import { makeReadView } from './read-view.js';
import { makeNbEditModal } from './nb-edit-modal.js';

export const ui = { JCard, JLoading, JlptGame, makeUseJlpt, makeJlptStudy, drawStroke, InkView, makeReadView, makeNbEditModal };
