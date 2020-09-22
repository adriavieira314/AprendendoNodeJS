const express = require('express');
const routes = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { isAdmin } = require('../helpers/isAdmin');

require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

//Tela de cadastro de usuario
routes.get('/registro', (req, res) => {
    res.render('usuarios/registro');
});

//Cadastrando o usuario
routes.post('/registro', (req, res) => {
    let error = [];

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null) {
        error.push({ texto: 'Nome Inválido' });
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null) {
        error.push({ texto: 'E-mail Inválido' });
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null) {
        error.push({ texto: 'Senha Inválido' });
    }
    
    if(req.body.senha.length < 4) {
        error.push({ texto: 'Senha muita curta' });
    }

    if(req.body.senha !== req.body.senhaRepetida) {
        error.push({ texto: 'As senha são diferentes' });
    }

    if(error.length > 0) {
        res.render('usuarios/registro', { error: error });
    }else {
        //Primeiro estou verificando se já existe o email dentro do banco de dados
        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if(usuario) {
                req.flash('error_msg', 'Esse e-mail já está cadastrado.');
                res.redirect('/');

            }else{
                //Pegando os dados do formulário
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                });

                //fazendo hash na senha
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro) {
                            req.flash('error_msg', 'Houve um erro durante o cadastro da senha do usuário.');
                            res.redirect('/');
                        }
                        //Senha esta recebendo o hash
                        novoUsuario.senha = hash;
                        //Finalmente cadastrando
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário cadastrado com sucesso.');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro durante o cadastro do usuário.');
                            res.redirect('/');
                        });

                    });
                });
            }

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno.');
            res.redirect('/registro');
        });
    }
});

//Rota de Login
routes.get('/login', (req, res) => {
    res.render('usuarios/login');
});

//Rota de autenticação do login
routes.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next);
});

//Logout
routes.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg','Volte logo!');
    res.redirect('/');
})

module.exports = routes;