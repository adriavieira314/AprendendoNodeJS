//Verificando se o usuário é admin para ter acesso a certas rotas

module.exports = {
    isAdmin: (req, res, next) => {
        if(req.isAuthenticated() && req.user.isAdmin === 1) {
            return next();
        }

        req.flash('error_msg', 'Você precisa ser um administrador para entrar.');
        res.redirect('/');
    }
};