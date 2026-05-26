# Reserva Carro Mobile

App móvel em Expo Go para consumir o backend Laravel deste repositório.

## O que já faz

- ecrã inicial estilo app de reservas (pesquisa, menu, notificações, benefícios)
- fluxo de pesquisa: local, datas/horários, lista de viaturas, mapa e configurar reserva (sem pagamento)
- imagens das viaturas em `assets/carros` (mesmas do site em `resources/img/carros`)
- login com token móvel (`/mobile/auth/login`)
- listagem de viaturas
- listagem e detalhe de reservas
- criação de reserva
- levantamento com 4 fotos obrigatórias
- devolução com 4 fotos obrigatórias
- aprovação / rejeição / confirmação operacional para gestor

## Como correr

1. No Laravel, aplicar a migração nova:

```bash
php artisan migrate
```

2. Garantir que o backend está acessível na rede local:

```bash
php artisan serve --host=0.0.0.0 --port=8000
php artisan storage:link
```

3. Na app Expo:

```bash
cd mobile-expo
npm start
```

4. Opcionalmente, pré-configurar a app para não mostrar o bloco `API` no ecrã inicial:

```text
EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:8000
```

Podes colocar este valor num ficheiro `mobile-expo/.env`.

5. Se não pré-configurares a variável, abre no `Expo Go` e indica a URL da tua máquina:

```text
http://SEU_IP_LOCAL:8000
```

## Notas
- Em telemóvel físico, `localhost` não funciona.
- As imagens devolvidas pelo Laravel usam `/storage/...`, por isso o `storage:link` é necessário.
- O fluxo de reservas na base atual usa um único campo `date`.
