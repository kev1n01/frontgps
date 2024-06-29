
// MOSTRAR MAPA
var mapa = L.map('mapa', {
    zoomControl: false,
}).setView([-10.1193535,-76.1913174], 11)

L.control.zoom({
    position: 'bottomright'
}).addTo(mapa)

const estilo = L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
})

estilo.addTo(mapa)

const iconoBuses = L.icon({
    iconUrl: 'iconoBus.png',
    iconSize: [30, 30],
})

const iconoBusActual = L.icon({
    iconUrl: 'busactual.png',
    iconSize: [30, 30],
})

var idConductor = localStorage.getItem('idConductor')
var nombre = localStorage.getItem('nombre')
let marcadores = {}
const URL_BASE = `http://localhost:3000/api`;

// ELIMINAR MARCADORES NULOS
function eliminarMarcadoresNulos(datos, marcadores) {
    for (const marcador in marcadores) {
        const conductorNulo = datos.find(conductor => conductor.id === parseInt(marcador));
        if (!conductorNulo) {
            map.removeLayer(marcadores[marcador]);
            delete marcadores[marcador];
        }
    }
}

// OBTENER CONDUCTORES Y MOSTRAR MARCADORES
function obtenerConductores() {
    fetch(`${URL_BASE}/conductores`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    })
        .then(response => response.json())

        .then(data => {
            datos = data.datos
            // filtrar todos los conductores excepto el conductor que se encuentra conectado
            let filtrado = datos.filter(elemento => elemento.id !== parseInt(idConductor))
            // eliminar marcadores nulos
            eliminarMarcadoresNulos(filtrado, marcadores)

            // recorrer los conductores y mostrar marcadores
            filtrado.forEach(conductor => {
                let conductorId = conductor.id
                if (marcadores[conductorId]) {
                    let marcadorExiste = marcadores[conductorId].setLatLng([conductor.latitud, conductor.longitud])
                    marcadorExiste.bindPopup(`<h4>${conductor.nombre} | ${conductor.placa} </h4>`)
                } else {
                    const nuevoMarcador = L.marker([conductor.latitud, conductor.longitud], { icon: iconoBuses }).addTo(mapa)
                    marcadores[conductorId] = nuevoMarcador
                    L.popup({ closeButton: false }).setLatLng([conductor.latitud, conductor.longitud]).setContent(`<h4>${conductor.nombre} ${conductor.placa} </h4>`)
                }
            })
        }).catch(function (error) {
            // console.log(error)
        })
}

setInterval(obtenerConductores, 2000)

if (idConductor) {
    // MOSTRAR BOTON CERRAR SESION
    const saliritem = document.getElementById('saliritem')
    saliritem.style.display = 'block'

    // ESCONDER INGRESO
    const ingresaritem = document.getElementById('ingresaritem')
    const veritem = document.getElementById('veritem')
    const inicioitem = document.getElementById('inicioitem')
    const conductoritem = document.getElementById('conductoritem')
    ingresaritem.style.display = 'none'
    veritem.style.display = 'none'
    conductoritem.innerHTML = 'Bienvenido: ' + nombre
    conductoritem.style.display = 'block'
    inicioitem.style.display = 'none'

    // CERRAR SESION
    const cerrarSesion = document.getElementById('salir')

    cerrarSesion.addEventListener('click', () => {
        localStorage.removeItem('idConductor')
        localStorage.removeItem('nombre')
        window.location.href = 'ingreso.html'
    })

    // ACTUALIZAR COORDENADAS
    function actualizarConductor(latitud, longitud, id) {
        fetch(`${URL_BASE}/conductor/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ latitud, longitud })
        })
            .then(response => response.json())
            .then(data => {
                // console.log(data)
            }).catch(function (error) {
                // console.log("actualizar", error)
            })
    }

    // GEOLOCALIZACION
    var marcador

    // opciones de la geolocalización
    const obtenerCoordenadas = (pos) => {
        return {
            latitud: pos.coords.latitude,
            longitud: pos.coords.longitude,
        }
    }
    const opciones = {
        enableHighAccuary: true,
        timeout: 2000,
    }

    var watch = navigator.geolocation.watchPosition(llamadaCorrecto, llamadoErroneo, opciones)
    function llamadaCorrecto(pos) {
        const coordenadas = obtenerCoordenadas(pos)
        if (marcador) {
            marcador.setLatLng([coordenadas.latitud, coordenadas.longitud])
        } else {
            marcador = L.marker([coordenadas.latitud, coordenadas.longitud], { icon: iconoBusActual }).addTo(mapa)
        }

        actualizarConductor(coordenadas.latitud, coordenadas.longitud, idConductor)
    }

    function llamadoErroneo(err) {
        if (err.code === 1) { // permiso denegado
            alert("Por favor, active la gps en tu dispositivo")
        }
    }
}