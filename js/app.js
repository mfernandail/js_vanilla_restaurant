let cliente = {
  mesa: '',
  hora: '',
  pedido: []
};

let categorias = {
  1: 'Comida',
  2: 'Bebidas',
  3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');

btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente() {
  const mesa = document.querySelector('#mesa').value;
  const hora = document.querySelector('#hora').value;

  const camposVacio = [mesa, hora].some(campo => campo === '');

  if(camposVacio) {
    const existe = document.querySelector('.invalid-feedback');
    if(!existe) {
      const alerta = document.createElement('div');
      alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
      alerta.textContent = 'Todos los campos son necesarios';
      document.querySelector('.modal-body').appendChild(alerta);
      
      setTimeout(() => {
        alerta.remove();
      }, 2000);
    }
    return;
  }
  
  cliente = {...cliente, mesa, hora};

  const modalFormulario = document.querySelector  ('#formulario');
  const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
  modalBootstrap.hide();

  mostrarSecciones();

  obtenerPlatillo();
}
function mostrarSecciones() {
  const seccionesOcultas = document.querySelectorAll('.d-none');
  seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}
function obtenerPlatillo() {
  const url = 'http://localhost:3000/platillos';

  fetch(url)
    .then(res => res.json())
    .then(platos => mostrarPlatillos(platos))
    .catch(e => console.log(e))
}
function mostrarPlatillos(platos) {
  const contenido = document.querySelector('#platillos .contenido');
  platos.forEach(plato => {
    const row = document.createElement('div');
    row.classList.add('row', 'py-3', 'border-top');

    const nombre = document.createElement('div');
    nombre.classList.add('col-md-4');
    nombre.textContent = plato.nombre;

    const precio = document.createElement('div');
    precio.classList.add('col-md-3');
    precio.textContent = `$ ${plato.precio}`;

    const categoria = document.createElement('div');
    categoria.classList.add('col-md-3');
    categoria.textContent = categorias[plato.categoria];

    const inputCantidad = document.createElement('input');
    inputCantidad.type = 'number';
    inputCantidad.min = 0;
    inputCantidad.id = `producto-${plato.id}`;
    inputCantidad.value = 0;
    inputCantidad.classList.add('form-control');
    inputCantidad.onchange = () => {
      const cantidad = parseInt(inputCantidad.value);
      agregarPlatillo({...plato, cantidad});
    }

    const agregar = document.createElement('div');
    agregar.classList.add('col-md-2');

    agregar.appendChild(inputCantidad);

    row.appendChild(nombre);
    row.appendChild(precio);
    row.appendChild(categoria);
    row.appendChild(agregar);

    contenido.appendChild(row);
  })
}
function agregarPlatillo(producto) {
  let {pedido} = cliente;

  if(producto.cantidad > 0) {
    if(pedido.some(p => p.id === producto.id)) {
      const pedidoLista = pedido.map(p => {
        if(p.id === producto.id) {
          p.cantidad = producto.cantidad;
        }
        return p;
      });
      cliente.pedido = [...pedidoLista];
    }else {
      cliente.pedido = [...pedido, producto];
    }
  } else {
    cliente.pedido = pedido.filter(p => p.id !== producto.id);
  }

  limpiarHTML();

  actualizarResumen();
}
function actualizarResumen() {
  const contenido = document.querySelector('#resumen .contenido');
  const resumen = document.createElement('div');
  resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

  const mesa = document.createElement('p');
  mesa.textContent = 'Mesa: ';
  mesa.classList.add('fw-bold');

  const mesaSpan = document.createElement('span');
  mesaSpan.textContent = cliente.mesa;
  mesaSpan.classList.add('fw-normal');
  
  const hora = document.createElement('p');
  hora.textContent = 'Hora: ';
  hora.classList.add('fw-bold');

  const horaSpan = document.createElement('span');
  horaSpan.textContent = cliente.hora;
  horaSpan.classList.add('fw-normal');

  mesa.appendChild(mesaSpan);
  hora.appendChild(horaSpan);

  const titulo = document.createElement('h3');
  titulo.textContent = 'Platos Consumidos';
  titulo.classList.add('my-4', 'text-center');

  const grupo = document.createElement('ul');
  grupo.classList.add('list-group');
  cliente.pedido.forEach(p => {
    const {cantidad, categoria, id, nombre, precio} = p;

    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.innerHTML = ``

    const nombreEl = document.createElement('h4');
    nombreEl.classList.add('my-4');
    nombreEl.textContent = nombre;

    const cantidadEl = document.createElement('p');
    cantidadEl.classList.add('my-4');
    cantidadEl.textContent = 'Cantidad: ';

    const cantidadValor = document.createElement('span');
    cantidadValor.classList.add('fw-normal');
    cantidadValor.textContent = cantidad;
    
    cantidadEl.appendChild(cantidadValor);

    const precioEl = document.createElement('p');
    precioEl.classList.add('my-4');
    precioEl.textContent = 'Precio: ';

    const precioValor = document.createElement('span');
    precioValor.classList.add('fw-normal');
    precioValor.textContent = `$ ${precio} c/u`;
    
    precioEl.appendChild(precioValor);

    const subtotalArticulo = document.createElement('p');
    subtotalArticulo.classList.add('fw-bold');
    subtotalArticulo.textContent = 'Subtotal: ';

    const subtotal = document.createElement('span');
    subtotal.classList.add('fw-normal');
    subtotal.textContent = `$ ${precio * cantidad}`;
    
    subtotalArticulo.appendChild(subtotal);

    const btnEliminar = document.createElement('button');
    btnEliminar.classList.add('btn', 'btn-danger');
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.onclick = () => {
      eliminarCompra(id);
    }
    
    li.appendChild(nombreEl);
    li.appendChild(cantidadEl);
    li.appendChild(precioEl);
    li.appendChild(subtotalArticulo);
    li.appendChild(btnEliminar);

    grupo.appendChild(li);

  });

  resumen.appendChild(mesa);
  resumen.appendChild(hora);
  resumen.appendChild(titulo);
  resumen.appendChild(grupo);

  contenido.appendChild(resumen);
}
function eliminarCompra(id) {
  cliente.pedido = cliente.pedido.filter(p => p.id !== id);
  limpiarHTML();
  actualizarResumen();
}
function limpiarHTML() {
  const contenido = document.querySelector('#resumen .contenido');

  while(contenido.firstChild) {
    contenido.removeChild(contenido.firstChild);
  } 
}