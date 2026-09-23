import { obtenerDatos } from './data.js';
import { mostrarDatos } from './render.js';

function iniciarContador(evento) {
  const element = document.getElementById('contador');
  const actualizar = () => {
    const restante = Date.parse(evento.inicio) - Date.now();
    element.textContent = restante <= 0 ? evento.mensajeFinalContador :
      `${Math.floor(restante / 86400000)} días, ${Math.floor(restante / 3600000) % 24} horas y ${Math.floor(restante / 60000) % 60} minutos`;
    return restante > 0;
  };
  if (actualizar()) {
    const timer = setInterval(() => { if (!actualizar()) clearInterval(timer); }, 1000);
  }
}

function conectarCalendario(evento) {
  const fechaICS = value => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const textoICS = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/[,;]/g, '\\$&');
  document.getElementById('agendar').addEventListener('click', () => {
    const contenido = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invitaciones//Plantilla//ES',
      'BEGIN:VEVENT', `UID:${crypto.randomUUID()}@invitaciones`,
      `DTSTAMP:${fechaICS(Date.now())}`, `DTSTART:${fechaICS(evento.inicio)}`,
      `DTEND:${fechaICS(evento.fin)}`, `SUMMARY:${textoICS(evento.titulo)}`,
      `DESCRIPTION:${textoICS(evento.descripcion)}`, `LOCATION:${textoICS(evento.lugar)}`,
      'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'evento.ics';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

document.getElementById('formulario-rsvp').addEventListener('submit', event => event.preventDefault());

try {
  // Variante local para revisar la maquetación con contenido extenso.
  const pruebaLarga = new URLSearchParams(location.search).get('prueba') === 'larga';
  const datos = await obtenerDatos(pruebaLarga ? new URL('../../datos.largos.json', import.meta.url) : undefined);
  mostrarDatos(datos);
  iniciarContador(datos.evento);
  conectarCalendario(datos.evento);
  document.getElementById('invitacion').hidden = false;
  document.getElementById('estado').hidden = true;
} catch (error) {
  document.getElementById('estado').textContent = 'No se pudo cargar la invitación. Intenta recargar la página.';
  console.error(error);
}
