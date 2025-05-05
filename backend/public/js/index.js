// form.js

// Definim un JSON de mòduls per cicle i curs
const moduls = {
    DAM: {
        1: ["Programació",
            "Bases de Dades",
            "Sistemes Informàtics",
            "Entorns de Desenvolupament",
            "Llenguatges de Marques i Sistemes de Gestió de la Informació",
            "Projecte Intermodular I",
            "Anglès Professional I",
            "Itinerari Personal per a l'Ocupabilitat I"],
        2: ["Accés a Dades", 
            "Desenvolupament d'Interfícies", 
            "Programació Multimèdia i Dispositius mòbils",
            "Programació de Serveis i Processos",
            "Sistemes de Gestió Emprssarial",
            "Projecte Intermodular II",
            "Itinerari Personal per a l'Ocupabilitat II"]
    },
    DAW: {
        1: ["Programació",
            "Bases de Dades",
            "Sistemes Informàtics",
            "Entorns de Desenvolupament",
            "Llenguatges de Marques i Sistemes de Gestió de la Informació",
            "Projecte Intermodular I",
            "Anglès Professional I",
            "Itinerari Personal per a l'Ocupabilitat I"],
        2: ["Desenvolupament Web en entorn client",
            "Desenvolupament web en entorn servidor", 
            "Desplegament d'aplicacions web",
            "Disseny d'interfícies web",
            "Projecte Intermodular II",
            "Itinerari Personal per a l'Ocupabilitat II"]
    }
};

// Referències als elements del formulari
const cicleSelect = document.getElementById('cicle');
const cursRadios = document.getElementsByName('curs');
const modulsFieldset = document.getElementById('modulsFieldset');
const form = document.getElementById('matriculaForm');

// Funció per actualitzar els mòduls
function actualitzarModuls() {
    // 
    const cicle = cicleSelect.value;

    // cursRadios és un NodeList (hem fet un getElementsByName), i no un vector
    // Amb l'operador ... (conegut com spread), convertim aquest nodelist en un vector
    // Amb el vector ja podem fer ús del mètode find.
    // 
    // Amb el find(radio=>radio.checked) el que fem és buscar quin dels radios està checked
    // Amb l'opció seleccionada (checked), ens quedem amb el se value (i per tant, ja tenim el curs)
    const curs = [...cursRadios].find(radio => radio.checked)?.value;

    // Si falta informació no fem res
    if (!cicle || !curs) return;


    // Netegem els mòduls anteriors
    modulsFieldset.innerHTML = '<legend>Mòduls</legend>';
    var llistaModulsDiv=document.createElement('div');
    llistaModulsDiv.classList.add("llistaModuls");
    modulsFieldset.appendChild(llistaModulsDiv);

    /* TO-DO
    Recorre els diferents mòduls del cicle i curs seleccionat, i crea 
    el corresponent label i checkbox, amb l'estructura:
    <label><input type="checkbox" name="moduls" value="Programació"> Programació</label>

    
    */

    const cursNum = curs === "primer" ? 1 : 2;
    const llista = moduls[cicle][cursNum];

    llista.forEach(nomModul => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.name = "moduls";
        checkbox.value = nomModul;

        label.appendChild(checkbox);
        label.append(" " + nomModul);

        llistaModulsDiv.appendChild(label);
        llistaModulsDiv.appendChild(document.createElement("br"));
    });


}

// Escoltem canvis en la selecció de cicle/curs
cicleSelect.addEventListener('change', actualitzarModuls);
cursRadios.forEach(radio => radio.addEventListener('change', actualitzarModuls));


// Enviar el formulari
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const dadesFormulari = {
        nom: formData.get('nom'),
        cognoms: formData.get('cognoms'),
        correu: formData.get('correu'),
        adreça: formData.get('adreça'),
        telefon: formData.get('telefon'),
        cicle: formData.get('cicle'),
        curs: formData.get('curs'),
        moduls: formData.getAll('moduls')
    };

    try {
        const resposta = await fetch('/enviar-matricula', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadesFormulari)
        });

        if (!resposta.ok) {
            throw new Error("Error rebent el PDF");
        }

        const blob = await resposta.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'matricula.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error en la descàrrega del PDF:", error);
        alert("Hi ha hagut un error en generar o descarregar el PDF.");
    }
});
