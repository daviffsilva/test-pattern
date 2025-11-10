import { CheckoutService } from '../src/services/CheckoutService.js';
import { Item } from '../src/domain/Item.js';
import { Pedido } from '../src/domain/Pedido.js';
import { UserMother } from './helpers/builders/UserMother.js';
import { CarrinhoBuilder } from './helpers/builders/CarrinhoBuilder.js';

describe('CheckoutService', () => {
    
    describe('quando o pagamento falha', () => {
        it('deve retornar null e não processar o pedido', async () => {

            // Setup limpo e explícito
            const carrinho = new CarrinhoBuilder()
                .comValorTotal(200.0)
                .build();
            
            // const carrinho = new CarrinhoBuilder()
            //     .comValorTotal(100.0)
            //     .build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: false })
            };

            const repositoryDummy = {
                salvar: jest.fn()
            };

            const emailDummy = {
                enviarEmail: jest.fn()
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryDummy,
                emailDummy
            );

            const pedido = await checkoutService.processarPedido(
                carrinho,
                '1234-5678-9012-3456'
            );

            expect(pedido).toBeNull();
            
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(
                100.0,
                '1234-5678-9012-3456'
            );

            expect(repositoryDummy.salvar).not.toHaveBeenCalled();
            expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
        });
    });

    describe('quando um cliente PADRAO finaliza a compra com sucesso', () => {
        it('deve processar o pedido sem desconto e enviar e-mail', async () => {
            const usuarioPadrao = UserMother.umUsuarioPadrao();
            
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPadrao)
                .comValorTotal(150.0)
                .build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };

            const pedidoSalvo = new Pedido(
                'PED-123',
                carrinho,
                150.0,
                'PROCESSADO'
            );

            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };

            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            const resultado = await checkoutService.processarPedido(
                carrinho,
                '1234-5678-9012-3456'
            );

            expect(resultado).toBeDefined();
            expect(resultado.id).toBe('PED-123');
            expect(resultado.status).toBe('PROCESSADO');
            expect(resultado.totalFinal).toBe(150.0);

            expect(gatewayStub.cobrar).toHaveBeenCalledWith(
                150.0,
                '1234-5678-9012-3456'
            );

            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'joao@email.com',
                'Seu Pedido foi Aprovado!',
                'Pedido PED-123 no valor de R$150'
            );
        });
    });

    describe('quando um cliente PREMIUM finaliza a compra com sucesso', () => {
        it('deve aplicar desconto de 10%, processar o pedido e enviar e-mail', async () => {
            const usuarioPremium = UserMother.umUsuarioPremium();
            
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comItens([
                    new Item('Notebook', 150.0),
                    new Item('Mouse', 50.0)
                ])
                .build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };

            const pedidoSalvo = new Pedido(
                'PED-456',
                carrinho,
                'PROCESSADO'
            );

            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };

            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            const resultado = await checkoutService.processarPedido(
                carrinho,
                '9876-5432-1098-7654'
            );

            expect(resultado).toBeDefined();
            expect(resultado.id).toBe('PED-456');
            expect(resultado.status).toBe('PROCESSADO');
            expect(resultado.totalFinal).toBe(180.0);

            expect(gatewayStub.cobrar).toHaveBeenCalledWith(
                180.0,
                '9876-5432-1098-7654'
            );

            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);

            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'premium@email.com',
                'Seu Pedido foi Aprovado!',
                'Pedido PED-456 no valor de R$180'
            );
        });
    });

    describe('quando o carrinho está vazio', () => {
        it('deve processar pedido com valor zero', async () => {
            const carrinho = new CarrinhoBuilder()
                .build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };

            const pedidoSalvo = new Pedido(
                'PED-789',
                carrinho,
                0,
                'PROCESSADO'
            );

            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };

            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            const resultado = await checkoutService.processarPedido(
                carrinho,
                '1111-2222-3333-4444'
            );

            expect(resultado).toBeDefined();
            expect(resultado.totalFinal).toBe(0);
            
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(
                0,
                '1111-2222-3333-4444'
            );
        });
    });

    describe('quando o envio de e-mail falha', () => {
        it('não deve impedir a conclusão do checkout', async () => {
            const carrinho = new CarrinhoBuilder()
                .comValorTotal(100.0)
                .build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };

            const pedidoSalvo = new Pedido(
                'PED-999',
                carrinho,
                100.0,
                'PROCESSADO'
            );

            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };

            const emailMock = {
                enviarEmail: jest.fn().mockRejectedValue(
                    new Error('Servidor de e-mail indisponível')
                )
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            const resultado = await checkoutService.processarPedido(
                carrinho,
                '5555-6666-7777-8888'
            );

            expect(resultado).toBeDefined();
            expect(resultado.id).toBe('PED-999');
            expect(resultado.status).toBe('PROCESSADO');

            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
        });
    });
});

