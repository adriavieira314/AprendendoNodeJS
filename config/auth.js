const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Model do usuario
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

module.exports = (passport) => {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
        //verificando se existe um email no meu banco igual a do usernameField
        Usuario.findOne({ email: email }).then((usuario) => {
            //se o email não for encontrado
            if(!usuario) {
                return done(null, false, { message: 'Esta conta não existe.' });
            }
            //se existir, estou comparando a senha do form com a senha do usuario do banco de dados
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem) {
                    //se as senhas baterem, retorna o usuario
                    return done(null, usuario);
                }else {
                    //senão, messagem de erro
                    return done(null, false, { message: 'Senha incorreta.' })
                }
            });

        })
    }));

    //vai entrar num sessao
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id);
    });

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario);
        });
    });
};