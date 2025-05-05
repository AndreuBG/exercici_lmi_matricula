import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';


// Inicialització d'Express
const app = express();
const PORT = 3000;

// Configuració de __dirname en mòduls ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

// Càrrega de middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servim els arxius estàtics de /public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint POST per a rebre les dades del formulari
app.post('/enviar-matricula', async (req, res) => {
    try {
        // 1. Recollir les dades del formulari
        const dadesMatricula = req.body;
        console.log("1");

        // 2. Generar XML amb les dades
        const xmlPath = path.join(__dirname, 'uploads', 'matricula.xml');
        const xmlContent = generarXML(dadesMatricula);
        fs.writeFileSync(xmlPath, xmlContent);
        console.log("2");

        // 3. Aplicar transformació XSLT → XSL-FO
        const foPath = path.join(__dirname, 'uploads', 'matricula.fo');
        await transformarXSLT(xmlPath, foPath);
        console.log("3");

        // 4. Generar PDF a partir del XSL-FO
        const pdfPath = path.join(__dirname, 'uploads', 'matricula.pdf');
        await generarPDF(foPath, pdfPath);
        console.log("4");

        // 5. Enviar PDF com a resposta
        res.download(pdfPath, 'matricula.pdf');
        console.log("5");

    } catch (error) {
        console.error(error);
        res.status(500).send('Error generant el PDF');
    }
});

// Funció auxiliar per a generar l'XML
function generarXML(dades) {
    const moduls = Array.isArray(dades.moduls) ? dades.moduls : [dades.moduls];

    return `
<matricula>
    <dadesPersonals>
        <nom>${dades.nom}</nom>
        <cognoms>${dades.cognoms}</cognoms>
        <correu>${dades.correu}</correu>
        <adreca>${dades.adreça}</adreca>
        <telefon>${dades.telefon}</telefon>
    </dadesPersonals>
    <estudis>
        <cicle>${dades.cicle}</cicle>
        <curs>${dades.curs}</curs>
        <moduls>
            ${moduls.map(modul => `<modul>${modul}</modul>`).join('\n')}
        </moduls>
    </estudis>
</matricula>`;
}


// Funció auxiliar per aplicar l'XSLT
function transformarXSLT(xmlPath, foPath) {
    return new Promise((resolve, reject) => {
        /*
        TO-DO:

        Crea l'ordre xsltproc per convertir l'xml definit en xmlPath en un XML en format
        XSL-FO en foPath. 

        La plantilla la guardareu en ./xslt/matricula.xsl

        */
        const xslPath = path.join(__dirname, 'xslt', 'matricula.xsl');
        const cmd = `xsltproc -o "${foPath}" "${xslPath}" "${xmlPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error aplicant XSLT: ${error}`);
            } else {
                resolve();
            }
        });
    });
}

// Funció auxiliar per a generar el PDF (cridant Apache FOP)
function generarPDF(foPath, pdfPath) {
    return new Promise((resolve, reject) => {
        /* TO-DO: 
        
        Crea l'ordre que utilitzaràs amb fop per convertir l'XML-FO a PDF
        L'xml-fo es troba a foPath i el pdf el generaràs en pdfPath 

        */
        
        const cmd = `fop "${foPath}" "${pdfPath}"`;

        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(`Error generant PDF: ${error}`);
            } else {
                resolve();
            }
        });
    });
}

// Escoltem el servidor
app.listen(PORT, () => {
    console.log(`Servidor escoltant a http://localhost:${PORT}`);
});

