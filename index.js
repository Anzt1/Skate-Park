// Importación de dependencias
const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const jwt = require("jsonwebtoken");


// Clave secreta para JWT
const secretKey = "hkjhj453j";

// Importación de consultas
const {
    nuevoSkater,
    obtenerSkaters,
    obtenerSkater,
    editEstadoSkater,
    actualizarSkater,
    eliminarSkater
} = require("./consultas");

// Inicialización del servidor
app.listen(3000, () => console.log("Servidor ON, http://localhost:3000/"));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "Tamaño de imagen excede los límites permitidos",
    })
);
// Middleware para utilizar estilos CSS de Bootstrap
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

// Configuracion de handlebars
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main",
        layoutsDir: `${__dirname}/views/mainLayout`,
    })
);
app.set("view engine", "handlebars");

// Ruta principal, renderiza la vista "Home" con todos los skaters
app.get("/", async (req, res) => {
    try {
        const skaters = await obtenerSkaters()
        res.render("Home", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Ups! ${e}`,
            code: 500
        })
    };
});

// Ruta para mostrar el formulario de registro de skaters
app.get("/registro", (req, res) => {
    res.render("Registro");
});

// Ruta para mostrar el perfil de un skater (requiere token JWT)
app.get("/perfil", (req, res) => {
    const { token } = req.query
    jwt.verify(token, secretKey, (err, skater) => {
        if (err) {
            res.status(500).send({
                error: `Ups! Error..`,
                message: err.message,
                code: 500
            })
        } else {
            res.render("Perfil", { skater });
        }
    })
});

// Ruta para mostrar el formulario de inicio de sesión
app.get("/login", (req, res) => {
    res.render("Login");
});

// Ruta POST para iniciar sesión de un skater
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const skater = await obtenerSkater(email, password)
        const token = jwt.sign(skater, secretKey)
        res.status(200).send(token)
    } catch (e) {
        console.log(e)
        res.status(500).send({
            error: `Ups ! ${e}`,
            code: 500
        })
    };
});

// Ruta para mostrar la vista de administrador con todos los skaters
app.get("/Admin", async (req, res) => {
    try {
        const skaters = await obtenerSkaters();
        res.render("Admin", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Ups.. ${e}`,
            code: 500
        })
    };
});


// API Rest solicitado

// Obtener todos los skaters
app.get("/skaters", async (req, res) => {

    try {
        const skaters = await obtenerSkaters()
        res.status(200).send(skaters);
    } catch (e) {
        res.status(500).send({
            error: `Ups.. ${e}`,
            code: 500
        })
    };
});

// Crear un nuevo skater
app.post("/skaters", async (req, res) => {
    const skater = req.body;
    if (Object.keys(req.files).length == 0) {
        return res.status(400).send("No existe archivo adjunto en la consulta");
    }
    const { files } = req
    const { foto } = files;
    const { name } = foto;
    const pathPhoto = `/uploads/${name}`
    foto.mv(`${__dirname}/public${pathPhoto}`, async (err) => {
        try {
            if (err) throw err
            skater.foto = pathPhoto
            await nuevoSkater(skater);
            res.status(201).redirect("/login");
        } catch (e) {
            console.log(e)
            res.status(500).send({
                error: `Ups ! ${e}`,
                code: 500
            })
        };

    });
})

// Actualizar un skater
app.put("/skaters", async (req, res) => {
    const skater = req.body;
    try {
        await actualizarSkater(skater);
        res.status(200).send("La actualizacion de datos ha sido realizado con éxito");
    } catch (e) {
        res.status(500).send({
            error: `Ups ! ${e}`,
            code: 500
        })
    };
});

// Actualizar el estado de un skater
app.put("/skaters/status/:id", async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        await editEstadoSkater(id, estado);
        res.status(200).send("Estado de skater cambiado con éxito");
    } catch (e) {
        res.status(500).send({
            error: `Ups! ${e}`,
            code: 500
        })
    };
});

// Eliminar un skater
app.delete("/skaters/:id", async (req, res) => {
    const { id } = req.params
    try {
        await eliminarSkater(id)
        res.status(200).send();
    } catch (e) {
        res.status(500).send({
            error: `Ups! ${e}`,
            code: 500
        })
    };
});
