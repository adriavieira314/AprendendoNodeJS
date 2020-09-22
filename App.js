//Importando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const admin = require('./routes/admin'); //minhas rotas
const usuarios = require('./routes/usuario'); //minhas rotas
const path = require('path'); //trabalha com pastas e diretorios
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const db = require('./config/db');

require('./config/auth')(passport);

//Configurando
//Iniciando a funçao express
const app = express();
const Port = process.env.PORT || 3001; //vai usar a porta que meu site de deploy usa ou usar a porta 3001

//Configurando o Middleware
//Sessão
app.use(session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true
}));

//Iniciando o passport
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg'); //variaveis globais
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; //vai armazenar na variavel todas as informações do usuario, se nao tiver nenhum dado, o valor sera nulo
    next();
});
//Fim

//Conectando com o banco de dados
mongoose.connect(db.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Conectado ao MongoDB com sucesso!');
})
.catch((err) => {
    console.log('Error ao conectar com o MongoDB: ' + err);
});

//Config do Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Config do Handlebars
app.engine('handlebars', handlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//Public
//Estou dizendo pro express que a pasta que está guardando meus arquivos estáticos é a pasta public
app.use(express.static(path.join(__dirname, 'public')));

//Rotas
//Pode ser usado qualquer prefixo depois do "/" mas nesse exemplo não coloquei fazendo a url ficar assim: 
//localhost::3001/posts mas se tivesse colocado "/api" seria: localhost::3001/api/posts
app.use('/', admin);
app.use('/usuarios', usuarios);

//Listening Port
app.listen(Port, () => {
    console.log(`Servidor rodando na url http://localhost:${Port}`);
})