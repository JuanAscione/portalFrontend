import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import './App.css';
import logo from './Gub.uy_.png';
import validadoImg from './validado.png'; // Importa la imagen de validado
import denegadoImg from './denegado.png'; // Importa la imagen de denegado

function App() {
  const [cedula, setCedula] = useState('');
  const [codigoGenerado, setCodigoGenerado] = useState(null);
  const [error, setError] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(true); // Booleano para controlar la visibilidad del botón

  const [validationResult, setValidationResult] = useState(null);

  const handleInputChange = (event) => {
    setCedula(event.target.value);
  };

  const generarCodigoQR = async () => {
    if (!cedula) {
      setError('Por favor, ingrese su número de cédula.');
      return;
    }

    setLoading(true);
    setError(null);
    setCodigoGenerado(null);

    try {
      const response = await axios.post('https://5lw7slyaa0.execute-api.us-east-2.amazonaws.com/dev/generarQR', { cedula });
      console.log(response.data);
      const responseBody = JSON.parse(response.data.body);
      if (responseBody.response) {
        const qrString = `cedula: ${responseBody.response.cedula}, challengeId: ${responseBody.response.challengeId}, url: ${responseBody.response.url}`;
        setQrData(qrString); // Guarda los datos del QR como una cadena
        setCodigoGenerado(true);
      } else {
        setError('No se pudo generar el código QR. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al generar el código QR:', error);
      setError('Error al generar el código QR. Inténtalo de nuevo.');
    } finally {
      setShouldShowButton(false);
      setLoading(false);
    }
  };

  const handleValidationComplete = async () => {
    setLoading(true);
    try {
      const challengeId = qrData.split('challengeId: ')[1].split(',')[0];
      const response = await axios.get('https://5lw7slyaa0.execute-api.us-east-2.amazonaws.com/dev/checkState', {
        params: { challenge_id: challengeId },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Validation response:', response.data); // Imprime la respuesta completa
      const responseBody = response.data; // La respuesta ya está en formato JSON
      if (responseBody.status) {
        console.log('Estado de validación:', responseBody.status);
        setValidationResult(responseBody.status); // Guarda el resultado de la validación
      } else {
        setError('No se pudo obtener el estado de la validación. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al validar el usuario:', error);
      setError('Error al validar el usuario. Inténtalo de nuevo.');
    }finally {
      setLoading(false);
    }
  };

  const getValidationMessage = () => {
    switch (validationResult) {
      case 'Pending':
        return 'Proceso en curso';
      case 'Validado':
        return 'Usuario Validado';
      case 'Denegado':
        return 'Usuario Denegado';
      default:
        return '';
    }
  };

  const getValidationImage = () => {
    switch (validationResult) {
      case 'Validado':
        return (<div><img src={validadoImg} alt="Validado" className="status-image" /><p className="validated-message">El usuario ha sido validado con éxito</p></div>);
      case 'Denegado':
        return (<div><img src={denegadoImg} alt="Denegado" className="status-image" /><p className="pending-message">Error en la validación</p></div>);
      default:
        return null;
    }
  };

  return (
    <div className="App-container">
      <img src={logo} alt="Gub.uy Logo" className="logo" />
      <div className="content">
        {validationResult === 'Validado' || validationResult === 'Denegado' ? (
          <div className="validation-result">
            {getValidationImage()}
            <h2>{getValidationMessage()}</h2>
          </div>
        ) : (
          <>
            <h1>Bienvenido al portal</h1>
            <div className="input-container">
              <input
                type="text"
                value={cedula}
                onChange={handleInputChange}
                placeholder="Ingrese su número de cédula"
                disabled={!shouldShowButton}
              />
              <div className="button-group">
                {shouldShowButton && (
                    <button onClick={generarCodigoQR} disabled={loading}>
                      {loading ? 'Generando...' : 'Generar Código QR'}
                    </button>
                )}
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            {codigoGenerado && qrData && (
              <div className="qr-container">
                <p>Diríjase a la app de Agesic y escanee el código QR:</p>
                <QRCode value={qrData} className="qr-image" />
                {validationResult === 'Pending' && (
                  <p className="pending-message">Proceso en curso</p>
                )}
                <div className="buttonbottom-group">
                  {codigoGenerado && (
                      <button onClick={handleValidationComplete} disabled={loading}>
                        {loading ? 'Validando...' : 'Validacion Completada'}
                      </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
