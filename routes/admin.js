const express = require('express');
const routes = express.Router(); //modulo de rotas do express
const mongoose = require('mongoose');
const { isAdmin } = require('../helpers/isAdmin');

require('../models/Categoria'); //solicitando o model categoria
const Categoria = mongoose.model('categorias'); //Categoria possui o model
require('../models/Postagem'); //solicitando o model postagens
const Postagem = mongoose.model('postagens'); //Postagem possui o model


//Cada rota vai me levar a uma página que fará uma funcionalidade diferente
//Rotas Categoria
//Rota menu
routes.get('/', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({ data: 'desc' })
        .then((postagens) => {
            res.render('index', { postagens: postagens })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao listar as postagens');
            res.redirect('/404');
        })
});

//Rota de Erro
routes.get('/404', (req, res) => {
    res.send('Error 404');
});

//Rota para ler mais sobre as postagens
routes.get('/home/postagens/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if(postagem) {
            res.render('homePage/postagem',  { postagem: postagem });
        } else {
            req.flash('error_msg', 'Essa postagem não existe.');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno.');
        res.redirect('/');
    })
});

//Rota para a opção categoria do navbar
routes.get('/home/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('homePage/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias.');
        res.redirect('/');
    })
});

//Rotas direcionando o usuario ao clicar em uma categoria
routes.get('/home/categorias/:slug', (req, res) => {
    //ele vai procurar a categoria do elemento pelo o slug
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        //depois achar postagens que possuem essa categoria
        if(categoria) {

            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render('homePage/posts', {postagens: postagens, categoria: categoria});
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar os posts.');
                res.redirect('/');
            });

        } else {
            req.flash('error_msg', 'Esta categoria não existe.');
            res.redirect('/');
        }

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias.');
        res.redirect('/');
    })
});

//Fazendo a validação e cadastrando
routes.post('/categorias/nova', (req, res) => {
    let error = [];
    
    if(!req.body.nome) {
        error.push({ texto: 'Nome Inválido' });
    }

    if(!req.body.slug) {
        error.push({ texto: 'Slug Inválido' });
    }
    
    if(req.body.nome < 2) {
        error.push({ texto: 'Nome da Categoria muito pequena' });
    }

    if(error.length > 0) {
        //se houver um erro, não é feito o cadastro e aparece as msg de error
        res.render('admin/addCategorias', { error: error });
    }else {
        //se não houver, o cadastro é feito
        const novaCategoria = ({
            nome: req.body.nome,
            slug: req.body.slug
        });
        
        new Categoria(novaCategoria).save()
        .then(() => {
            //se a categoria for cadastrada com sucesso, sou redirecionada para a pagina categorias
            req.flash('success_msg', 'Cadastro realizado com sucesso!');
            res.redirect('/categorias');
        })
        .catch((err) => {
            req.flash('error_msg', 'Erro ao fazer o cadastro, tente novamente!');
            res.redirect('/categorias');
        })
    }
});

//Listando as categorias
routes.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/categorias', { categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias!');
        res.redirect('/categorias')
    })
});

routes.get('/categorias/add', (req, res) => {
    res.render('admin/addCategorias');
});

//Selecionando a categoria
routes.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editCategorias', { categoria: categoria });
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe.');
        res.redirect('/categorias');
    })
});

//Editando a categoria
routes.post('/categorias/edit', (req,res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        categoria.nome = req.body.nome,
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso!');
            res.redirect('/categorias');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da categoria!');
            res.redirect('/categorias');
        });

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar a categoria!');
        res.redirect('/categorias');
    })
});

//Deletando as categorias
routes.post('/categorias/deletar', (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/categorias');
    }).catch((err) => {
        req.flash('error', 'Error ao deletar categoria!');
        res.redirect('/categorias');
    })
})
//Fim

//Rotas Postagens
//Fazendo a listagem das categorias no formulario
routes.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addPostagens', { categorias: categorias});
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar a lista de categorias.');
        res.redirect('/postagens');
    })
});

//Fazendo a validação e cadastrando
routes.post('/postagens/nova', (req, res) => {
    let error = [];

    if(!req.body.titulo) {
        error.push({ texto: 'Título inválido.' });
    }

    if(!req.body.slug) {
        error.push({ texto: 'Slug inválido.' });
    }

    if(!req.body.descricao) {
        error.push({ texto: 'Descrição inválido.' });
    }

    if(!req.body.conteudo) {
        error.push({ texto: 'Conteúdo inválido.' });
    }

    if(req.body.categoria === "0") {
        error.push({ texto: 'Categoria inválida. Cadastre uma categoria.' });
    }

    if(error.length > 0) {
        //se houver um erro, não é feito o cadastro e aparece as msg de error
        res.render('admin/addPostagens', { error: error });
    }else {
        const novaPostagem = ({
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        });

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem cadastrada com sucesso.');
            res.redirect('/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao cadastrar postagem.');
            res.redirect('/postagens');
        });
    }
});

//Listando as postagens
routes.get('/postagens', (req, res) => {
    Postagem.find().lean().populate('categoria').sort({ data: 'desc' })
        .then((postagens) => {
            res.render('admin/postagens', { postagens: postagens })
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as postagens');
            res.redirect('/postagens');
        })
});

//Selecionando a postagem
routes.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editPostagens', { categorias: categorias, postagem: postagem });
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias.');
            res.redirect('/postagens');
        })
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe');
        res.redirect('/postagens');
    })
})

//Editando a postagem
routes.post('/postagens/edit', (req, res) => {
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso.');
            res.redirect('/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao salvar a edição da postagem.');
            res.redirect('/postagens');
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editas a postagem.');
        res.redirect('/postagens');
    })
});

//Deletando as postagens
routes.get('/postagens/deletar/:id', (req, res) => {
    Postagem.remove({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso.');
        res.redirect('/postagens');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem.');
        res.redirect('/postagens');
    })
});

module.exports = routes;