function rellenarLista(containerId, templateId, items, rellenar) {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  for (const item of items) {
    const fragment = document.getElementById(templateId).content.cloneNode(true);
    rellenar(fragment, item);
    container.append(fragment);
  }
}

export function mostrarDatos(datos) {
  document.title = datos.tituloPagina;
  document.documentElement.lang = datos.idioma;
  document.querySelectorAll('[data-field]').forEach(element => {
    const value = element.dataset.field.split('.').reduce((obj, key) => obj?.[key], datos);
    element.textContent = value ?? '';
  });
  document.getElementById('mensaje').hidden = !datos.mensaje.texto;
  document.getElementById('notas').hidden = !datos.notas.texto;
  document.getElementById('itinerario').hidden = datos.itinerario.length === 0;
  document.getElementById('familia').classList.toggle('family--pair', datos.familia.grupos.length === 2);
  const eventDate = new Date(datos.evento.inicio);
  document.querySelectorAll('[data-date-part]').forEach(element => {
    element.textContent = new Intl.DateTimeFormat(datos.idioma, {
      [element.dataset.datePart]: element.dataset.datePart === 'day' ? 'numeric' : 'long',
      timeZone: datos.zonaHoraria
    }).format(eventDate);
  });
  document.querySelector('[data-event-hour]').textContent = new Intl.DateTimeFormat(datos.idioma, {
    hour: 'numeric', minute: '2-digit', hour12: true, timeZone: datos.zonaHoraria
  }).format(eventDate);
  rellenarLista('grupos-familia', 'grupo-template', datos.familia.grupos, (fragment, grupo) => {
    fragment.querySelector('.family__title').textContent = grupo.titulo;
    for (const nombre of grupo.nombres) {
      const li = document.createElement('li');
      li.textContent = nombre;
      fragment.querySelector('.family__names').append(li);
    }
  });
  const fechaTexto = new Intl.DateTimeFormat(datos.idioma, {
    dateStyle: 'full', timeStyle: 'short', timeZone: datos.zonaHoraria
  }).format(new Date(datos.evento.inicio));
  document.querySelectorAll('[data-event-date]').forEach(fecha => {
    fecha.dateTime = datos.evento.inicio;
    fecha.textContent = fechaTexto;
  });
  rellenarLista('lista-ubicaciones', 'ubicacion-template', datos.ubicaciones, (fragment, lugar) => {
    fragment.querySelector('.location__title').textContent = lugar.titulo;
    fragment.querySelector('.location__name').textContent = lugar.nombre;
    fragment.querySelector('.location__address').textContent = lugar.direccion;
    const time = fragment.querySelector('time');
    time.dateTime = lugar.hora;
    const [hour, minute] = lugar.hora.split(':').map(Number);
    time.textContent = `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'a. m.' : 'p. m.'}`;
    const icons = { iglesia: 'assets/images/iglesia.webp', recepcion: 'assets/images/recepcion.webp' };
    const icon = fragment.querySelector('.location__icon');
    if (icons[lugar.icono]) { icon.src = icons[lugar.icono]; icon.hidden = false; }
    fragment.querySelector('.location__address').hidden = !lugar.direccion;
    const link = fragment.querySelector('a');
    let url;
    try { url = new URL(lugar.mapaUrl); } catch { /* Un mapa vacío es válido. */ }
    if (url && ['https:', 'http:'].includes(url.protocol)) link.href = url.href;
    else link.hidden = true;
  });
  rellenarLista('lista-itinerario', 'actividad-template', datos.itinerario, (fragment, actividad) => {
    const time = fragment.querySelector('time');
    time.dateTime = actividad.hora;
    time.textContent = actividad.hora;
    fragment.querySelector('.itinerary__name').textContent = actividad.nombre;
    fragment.querySelector('.itinerary__location').textContent = actividad.ubicacion ?? '';
  });
  const { invitado } = datos;
  document.getElementById('total-pases').textContent = invitado.pases.adultos + invitado.pases.ninos;
  document.getElementById('nombre').value = invitado.nombre;
  document.getElementById('telefono').value = invitado.contacto;
  document.getElementById('adultos').max = invitado.pases.adultos;
  document.getElementById('ninos').max = invitado.pases.ninos;
  document.getElementById('adultos').value = invitado.respuesta.adultos;
  document.getElementById('ninos').value = invitado.respuesta.ninos;
  document.getElementById('comentario').value = invitado.respuesta.mensaje;
  document.querySelectorAll('[name="asistencia"]').forEach(input => {
    input.checked = input.value === invitado.respuesta.asistencia;
  });
}
