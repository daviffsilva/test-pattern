import { Carrinho } from '../../../src/domain/Carrinho.js';
import { Item } from '../../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

/**
 * Data Builder Pattern para criação flexível de Carrinhos
 * 
 * Resolve o problema de "Setup Obscuro" e permite criar carrinhos
 * complexos de forma legível e fluente.
 * 
 * Vantagens sobre Object Mother:
 * - API fluente permite customização fácil
 * - Evita explosão de métodos para cada combinação
 * - Torna explícito apenas o que é importante para o teste
 */
export class CarrinhoBuilder {
    constructor() {
        this.user = UserMother.umUsuarioPadrao();
        this.itens = [new Item('Produto Padrão', 100.0)];
    }

    /**
     * Define o usuário do carrinho
     * @param {User} user
     * @returns {CarrinhoBuilder}
     */
    comUser(user) {
        this.user = user;
        return this;
    }

    /**
     * Define os itens do carrinho
     * @param {Item[]} itens
     * @returns {CarrinhoBuilder}
     */
    comItens(itens) {
        this.itens = itens;
        return this;
    }

    /**
     * Adiciona um único item ao carrinho
     * @param {Item} item
     * @returns {CarrinhoBuilder}
     */
    comItem(item) {
        this.itens.push(item);
        return this;
    }

    /**
     * Cria um carrinho vazio (sem itens)
     * @returns {CarrinhoBuilder}
     */
    vazio() {
        this.itens = [];
        return this;
    }

    /**
     * Cria um carrinho com valor total específico
     * @param {number} valorTotal
     * @returns {CarrinhoBuilder}
     */
    comValorTotal(valorTotal) {
        this.itens = [new Item('Produto', valorTotal)];
        return this;
    }

    /**
     * Constrói e retorna a instância final do Carrinho
     * @returns {Carrinho}
     */
    build() {
        return new Carrinho(this.user, this.itens);
    }
}

