import React, { useState } from 'react';
import axios from 'axios';
import './App.css';


function App() {
  const [cedula, setCedula] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [error, setError] = useState(null);
  const [qrBase64, setQrBase64] = useState(null);

  const handleInputChange = (event) => {
    setCedula(event.target.value);
  };

  const generarCodigoQR = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/generar_qr', { cedula });
      console.log(response.data);
      if (response.data.qr_base64) {
        setQrBase64(response.data.qr_base64); // Guarda el código QR en formato base64
        setCodigoGenerado(true);
        setError(null);
      } else {
        setError('No se pudo generar el código QR. Inténtalo de nuevo.');
        setCodigoGenerado(null);
      }
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      setError('Error al generar el código QR. Inténtalo de nuevo.');
      setCodigoGenerado(null);
    }
  };

  return (
      <div className="App">
        <h1>Bienvenido al portal</h1>
        <input
            type="text"
            value={cedula}
            onChange={handleInputChange}
            placeholder="Ingrese su número de cédula"
        />
        <button onClick={generarCodigoQR}>Generar Código QR</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {codigoGenerado && qrBase64 && (
            <div>
              <p>Diríjase a la app de Agesic y escanee el código QR:</p>
              {/* Mostrar el código QR como una imagen base64 */}
              <img src={`data:image/png;base64,${qrBase64}`} alt="Código QR" />
            </div>
        )}
      </div>
  );
}

export default App;
