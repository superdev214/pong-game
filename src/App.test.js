import { render, screen ,waitFor } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  const { } = render(<App />);
  
})

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
