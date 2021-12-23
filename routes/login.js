var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

var mdAutenticacion = require('../middlewares/autenticacion');

// =====================================
// Renovar token
// =====================================

app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {

    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14200 }); // 4 horas

    res.status(200).json({
        ok: true,
        token: token
    });
});

// =====================================
// Autenticacion
// =====================================

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        }

        // Crear un token!!!
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14200 }); // 4 horas


        res.status(200).json({
            ok: true,
            Usuario: usuarioBD,
            token: token,
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)
        });

    });

    function obtenerMenu(ROLE) {

        var menu = [{
                titulo: 'Principal',
                icono: 'feather icon-home',
                submenu: [
                    { titulo: 'Dashboard', url: '/dashboard' },
                    { titulo: 'ProgressBar', url: '/progress' },
                    { titulo: 'Graficas', url: '/graficas1' },
                    { titulo: 'Promesas', url: '/promesas' },
                    { titulo: 'Rxjs', url: '/rxjs' }
                ]
            },
            {
                titulo: 'Mantenimiento',
                icono: 'feather icon-folder',
                submenu: [
                    // { titulo: 'Usuarios', url: '/usuarios' },
                    { titulo: 'Hospitales', url: '/hospitales' },
                    { titulo: 'Médicos', url: '/medicos' },
                ]
            }

        ];

        if (ROLE === 'ADMIN_ROLE') {
            menu[1].submenu.unshift({ titulo: 'Computadoras', url: '/computadoras' });
            menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
        }
        return menu;
    }

});



module.exports = app;