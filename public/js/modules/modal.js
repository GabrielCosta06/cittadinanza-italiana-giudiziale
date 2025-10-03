import { dom } from './dom.js';

export function openModal() {
  dom.processModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeModal() {
  dom.processModal.classList.remove('active');
  document.body.style.overflow = '';
}
