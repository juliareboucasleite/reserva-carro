# Reserva Carro Mobile

App móvel em Expo Go para consumir o backend Laravel deste repositório.

## O que já faz

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

4. Abrir no `Expo Go` e, no ecrã inicial, indicar a URL da tua máquina:

```text
http://SEU_IP_LOCAL:8000
```

## Notas
- Em telemóvel físico, `localhost` não funciona.
- As imagens devolvidas pelo Laravel usam `/storage/...`, por isso o `storage:link` é necessário.
- O fluxo de reservas na base atual usa um único campo `date`.
