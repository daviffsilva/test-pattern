import { User } from '../../../src/domain/User.js';

/**
 * Object Mother Pattern para criação de usuários
 * Útil para entidades simples e fixas que raramente mudam entre os testes
 */
export class UserMother {
    /**
     * Cria um usuário padrão (não-premium)
     * @returns {User}
     */
    static umUsuarioPadrao() {
        return new User(
            1,
            'João Silva',
            'joao@email.com',
            'PADRAO'
        );
    }

    /**
     * Cria um usuário premium (com desconto)
     * @returns {User}
     */
    static umUsuarioPremium() {
        return new User(
            2,
            'Maria Premium',
            'premium@email.com',
            'PREMIUM'
        );
    }

    /**
     * Cria um usuário customizado (para casos específicos)
     * @param {Object} dados - Dados do usuário
     * @returns {User}
     */
    static comDados(dados) {
        return new User(
            dados.id || 999,
            dados.nome || 'Usuario Teste',
            dados.email || 'teste@email.com',
            dados.tipo || 'PADRAO'
        );
    }
}

