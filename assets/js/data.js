// Sustituir por la URL de la API cuando entregue el mismo contrato que datos.json.
export const DATA_URL = new URL('../../datos.json', import.meta.url);

export async function obtenerDatos(url = DATA_URL) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`No se pudieron cargar los datos (${response.status}).`);
  const datos = await response.json();
  if (!datos || !datos.portada || !datos.mensaje || !datos.familia ||
      !Array.isArray(datos.familia.grupos) || !Array.isArray(datos.ubicaciones) ||
      !Array.isArray(datos.itinerario) || !datos.confirmacion || !datos.evento ||
      !Number.isFinite(Date.parse(datos.evento.inicio)) ||
      !Number.isFinite(Date.parse(datos.evento.fin)) ||
      Date.parse(datos.evento.fin) <= Date.parse(datos.evento.inicio)) {
    throw new Error('Los datos de la invitación no tienen el formato esperado.');
  }
  const invitado = datos.invitado;
  const cantidadValida = value => Number.isSafeInteger(value) && value >= 0;
  if (!invitado || typeof invitado.nombre !== 'string' ||
      typeof invitado.contacto !== 'string' || !invitado.pases || !invitado.respuesta ||
      !['pendiente', 'si', 'no'].includes(invitado.respuesta.asistencia) ||
      typeof invitado.respuesta.mensaje !== 'string' ||
      !['adultos', 'ninos'].every(tipo => cantidadValida(invitado.pases[tipo]) &&
        cantidadValida(invitado.respuesta[tipo]) && invitado.respuesta[tipo] <= invitado.pases[tipo]) ||
      !Number.isSafeInteger(invitado.pases.adultos + invitado.pases.ninos) ||
      (invitado.respuesta.asistencia !== 'si' && (invitado.respuesta.adultos !== 0 || invitado.respuesta.ninos !== 0)) ||
      !datos.notas || typeof datos.notas.texto !== 'string') {
    throw new Error('Los datos del invitado, sus pases o las notas no tienen el formato esperado.');
  }
  return datos;
}
