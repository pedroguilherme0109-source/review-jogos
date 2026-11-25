const { createApp } = Vue;

createApp({
    data() {
        return {
            busca: "",
            generoSelecionado: "",
            ordem: "alfabetica",
            jogoEmAvaliacao: "",
            novaAvaliacao: { nota: "", comentario: "" },
            avaliacoes: [],
            mensagemErro: "",
            jogos: [
                { nome: "Among Us", genero: "Social", ano: 2018, nota: null, reviews: 0, classeCapa: "capa-among" },
                { nome: "Celeste", genero: "Plataforma", ano: 2018, nota: 5.0, reviews: 2, classeCapa: "capa-celeste" },
                { nome: "Hollow Knight", genero: "Metroidvania", ano: 2017, nota: 4.5, reviews: 2, classeCapa: "capa-hollow" },
                { nome: "Rocket League", genero: "Esporte", ano: 2015, nota: 4.0, reviews: 1, classeCapa: "capa-rocket" },
                { nome: "Stardew Valley", genero: "Simulação", ano: 2016, nota: 5.0, reviews: 1, classeCapa: "capa-stardew" },
                { nome: "The Witcher 3", genero: "RPG", ano: 2015, nota: 4.5, reviews: 2, classeCapa: "capa-witcher" }
            ]
        };
    },
    created() {
        try {
            const salvas = localStorage.getItem("review-jogo-avaliacoes");
            if (salvas) {
                const dados = JSON.parse(salvas);
                if (!Array.isArray(dados) || dados.some((item) =>
                    typeof item.jogo !== "string" ||
                    !Number.isInteger(item.nota) ||
                    item.nota < 1 ||
                    item.nota > 5 ||
                    typeof item.comentario !== "string"
                )) {
                    throw new Error("Os dados salvos das avaliações estão inválidos.");
                }
                this.avaliacoes = dados;
            }
        } catch (erro) {
            this.mensagemErro = `Não foi possível carregar as avaliações salvas: ${erro.message}`;
        }
    },
    computed: {
        generos() {
            return [...new Set(this.jogos.map((jogo) => jogo.genero))].sort((a, b) => a.localeCompare(b, "pt-BR"));
        },
        jogosFiltrados() {
            const termo = this.busca.trim().toLocaleLowerCase("pt-BR");
            const resultado = this.jogos.filter((jogo) => {
                const correspondeNome = jogo.nome.toLocaleLowerCase("pt-BR").includes(termo);
                const correspondeGenero = !this.generoSelecionado || jogo.genero === this.generoSelecionado;
                return correspondeNome && correspondeGenero;
            });

            return resultado.sort((a, b) => {
                if (this.ordem === "avaliacao") {
                    return (this.notaMedia(b) ?? -1) - (this.notaMedia(a) ?? -1) || a.nome.localeCompare(b.nome, "pt-BR");
                }

                if (this.ordem === "reviews") {
                    return this.totalAvaliacoes(b) - this.totalAvaliacoes(a) || a.nome.localeCompare(b.nome, "pt-BR");
                }

                return a.nome.localeCompare(b.nome, "pt-BR");
            });
        }
    },
    methods: {
        avaliacoesDoJogo(jogo) {
            return this.avaliacoes.filter((avaliacao) => avaliacao.jogo === jogo.nome);
        },
        totalAvaliacoes(jogo) {
            return jogo.reviews + this.avaliacoesDoJogo(jogo).length;
        },
        notaMedia(jogo) {
            const avaliacoesNovas = this.avaliacoesDoJogo(jogo);
            const total = this.totalAvaliacoes(jogo);
            if (total === 0) return null;

            const somaOriginal = (jogo.nota ?? 0) * jogo.reviews;
            const somaNova = avaliacoesNovas.reduce((soma, avaliacao) => soma + avaliacao.nota, 0);
            return (somaOriginal + somaNova) / total;
        },
        abrirFormulario(jogo) {
            this.mensagemErro = "";
            this.jogoEmAvaliacao = this.jogoEmAvaliacao === jogo.nome ? "" : jogo.nome;
            this.novaAvaliacao = { nota: "", comentario: "" };
        },
        enviarAvaliacao(jogo) {
            const avaliacao = {
                jogo: jogo.nome,
                nota: this.novaAvaliacao.nota,
                comentario: this.novaAvaliacao.comentario
            };
            this.avaliacoes.push(avaliacao);

            try {
                localStorage.setItem("review-jogo-avaliacoes", JSON.stringify(this.avaliacoes));
                this.jogoEmAvaliacao = "";
                this.novaAvaliacao = { nota: "", comentario: "" };
                this.mensagemErro = "";
            } catch (erro) {
                this.avaliacoes.pop();
                this.mensagemErro = `Não foi possível salvar a avaliação: ${erro.message}`;
            }
        }
    }
}).mount("#app");
