import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Aplicación Principal — El Huarique de Catacaos', () => {
  it('renderiza la cabecera institucional y el logo oficial', () => {
    render(<App />);
    const logo = screen.getByAltText('Huarique de Catacaos');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/brand/huarique-logo-transparente.png');
  });

  it('muestra las pestañas de navegación para salones y mesas', () => {
    render(<App />);
    expect(screen.getByText('Salones y Mesas')).toBeInTheDocument();
    expect(screen.getByText('Toma de Pedidos')).toBeInTheDocument();
  });

  it('renderiza las mesas del salón principal con el formato de moneda peruana S/', () => {
    render(<App />);
    expect(screen.getByText(/^MESA 1$/i)).toBeInTheDocument();
    expect(screen.getByText(/Salón Principal/i)).toBeInTheDocument();
  });
});
