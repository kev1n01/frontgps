const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const URL_BASE = `http://localhost:3000/api`;
const idConductor = localStorage.getItem(`idConductor`);

if (idConductor) {
    window.location.href = `mapa.html`;
}

$(`#login`).addEventListener(`submit`, (event) => {
    event.preventDefault();

    const placa = $(`#placa`).value;
    const dni = $(`#dni`).value;

    // Validar campos obligatorios
    if (!placa && !dni) {
        $(`#error`).innerHTML = "Los campos son obligatorios";
        $(`#error`).style.display = 'block';
        return;
    }

    // Realizar petición a la API
    fetch(`${URL_BASE}/ingresar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ placa, dni })
    })
        .then(response => response.json())
        .then(data => {
            // Procesar respuesta
            if (data.estado == 'ok') {
                // Guardar en localStorage
                localStorage.setItem(`idConductor`, data.id);
                localStorage.setItem(`nombre`, data.nombre);

                // Redireccionar
                window.location.href = `mapa.html`;
            } else {
                // Mostrar error en pantalla
                $(`#error`).innerHTML = "Datos incorrectos";
                $(`#error`).style.display = 'block';
            }
        })
        .catch(error => {
            console.log(error);
        })
})