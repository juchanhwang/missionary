import '@testing-library/jest-dom';

vi.mock('*.svg', () => ({
  default: 'svg-mock',
}));

// Create the #__next element for react-modal tests
const root = document.createElement('div');
root.id = '__next';
document.body.appendChild(root);
