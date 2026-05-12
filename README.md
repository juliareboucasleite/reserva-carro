# Sistema interno de gestão de frota

Este repositório contém uma aplicação interna para gerir a frota própria de uma empresa — as carrinhas, viaturas ligeiras e autocarros que circulam todos os dias entre obras, deslocações e serviços. Não é um site público de aluguer nem um marketplace; é a ferramenta que vive atrás do `login` e que substitui as folhas de cálculo, os grupos de WhatsApp e o caderno do escritório onde até aqui se anotava quem tinha levado o quê, em que dia, com que quilómetros.

A ideia é simples: qualquer condutor sabe, em qualquer momento, que viaturas estão disponíveis e pode pedir uma sem ter de telefonar a ninguém; o gestor aprova ou recusa o pedido, vê o estado operacional da frota de relance, é avisado quando uma inspeção ou um seguro está perto de caducar, e tem uma ficha de manutenção aberta automaticamente sempre que um condutor devolve uma viatura com problemas.

## A stack

Por baixo está um **Laravel 12** com **PHP 8.2+**, que por enquanto serve sobretudo a autenticação e o esqueleto da aplicação — o domínio ainda não está escrito em PHP. Toda a interface é feita em **React 19**, servida por **Vite 7**, com **Tailwind CSS 4** para o estilo. A internacionalização é gerida em mão, com dicionários em `resources/js/i18n/translations.js` — **PT-PT é a língua por omissão** e existe uma tradução inglesa paralela. Os dados que aparecem nos ecrãs vêm, neste momento, de mocks em `resources/js/contexts/DataContext.jsx`; quando o backend for ligado, esta camada será substituída por chamadas reais, mas a forma dos objetos já é a forma final.

## O fluxo, do princípio ao fim

O percurso central da aplicação é o ciclo de utilização de uma viatura, e está pensado para ser percorrido em quatro passos.

Tudo começa com uma **pré-reserva**: o condutor abre a aplicação, escolhe uma viatura disponível, indica as datas e o motivo da deslocação, e submete o pedido. A pré-reserva fica em estado pendente até que um **gestor** a aprove ou rejeite — e é aqui que entra a segunda etapa, que existe precisamente para evitar conflitos de agenda e garantir que a viatura certa vai para a deslocação certa.

Aprovada a pré-reserva, no dia marcado o condutor faz o **levantamento**: regista os quilómetros iniciais, deixa observações se houver algo a assinalar, e captura fotos e, opcionalmente, um vídeo curto do estado em que recebe a viatura. Estas fotos servem de prova e ficam guardadas durante 30 dias antes de serem purgadas automaticamente — tempo suficiente para resolver qualquer disputa, sem encher o disco.

No regresso, faz-se a **devolução**: quilómetros finais, observações, e uma pergunta direta — *a viatura ficou operacional?* Se a resposta for **sim**, a deslocação encerra-se ali. Se for **não**, o sistema abre automaticamente uma **ficha de manutenção** para o gestor, com o registo do problema já preenchido, para que nada se perca entre a entrega das chaves e a oficina.

## Quem usa, e o que vê

Há três perfis, todos definidos em `resources/js/contexts/AuthContext.jsx`. O **condutor** (`driver`) é o utilizador mais frequente: vê as suas próprias deslocações, submete pré-reservas, e executa o levantamento e a devolução das viaturas que lhe foram atribuídas. O **gestor** (`manager`) tem uma visão de cima: aprova ou rejeita pré-reservas, mantém o estado operacional da frota, cria e fecha fichas de manutenção, e é o destinatário natural dos alertas de inspeção e seguro. O **administrador** (`admin`) é o perfil mais limitado em termos de ecrã neste momento — é um placeholder para a gestão de utilizadores, equipas e definições gerais, que será construída quando o backend estiver pronto.

## O que se sabe sobre cada viatura

A ficha de cada viatura inclui foto, matrícula, quilómetros atuais, número de lugares, estado operacional, data da próxima inspeção, companhia e tipo de seguro, e data de renovação do seguro. Não é informação decorativa: a aplicação cruza estas datas com o calendário e gera **alertas a 30, 15 e 5 dias** antes de cada inspeção ou renovação. Quando uma destas datas se aproxima, o gestor vê o aviso no dashboard antes de ele se transformar num problema com multa ou com viatura parada.

A manutenção, por sua vez, é registada intervenção a intervenção: data, tipo de intervenção, dias em que a viatura ficou inoperacional, observações, e custo em euros. O objetivo é ter, ao fim de algum tempo, o historial de cada matrícula com profundidade suficiente para decidir se vale a pena continuar a reparar ou se é altura de substituir.

## Como está organizado o código

O grosso da aplicação vive em `resources/js/`. O ficheiro `app.jsx` é o **router** — feito à mão, com base em estado, porque ainda não foi necessário trazer o `react-router`. Os contextos em `resources/js/contexts/` carregam a sessão (`AuthContext.jsx`) e os dados (`DataContext.jsx`). Os ecrãs ficam em `resources/js/pages/` — Dashboard, Vehicles, Reservations, Maintenance, Damages, Admin, Login e LandingPage. A UI partilhada, os ícones e o layout estão em `resources/js/components/`. As traduções em `resources/js/i18n/`. E há ainda utilitários em `resources/js/utils/` e `resources/js/services/` para tratar das imagens das viaturas e da pesquisa de localizações.

## Pôr a correr

Para começar a desenvolver, depois de clonar o repositório:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

E depois, em terminais separados:

```bash
php artisan serve
npm run dev
```

Para gerar a build de produção:

```bash
npm run build
```

## Convenções

Há um conjunto de regras que vale a pena conhecer antes de tocar na interface, porque foram sendo afinadas e qualquer deslize destoa logo.

A língua por omissão é **PT-PT** — não PT-BR. O vocabulário é o europeu: *levantamento* e *devolução* (nunca *retirada* nem *check-in/check-out* à inglesa nos ecrãs), *viatura* (e não *carro*), *matrícula*, *condutor*, *equipa*, *ficha de manutenção*, *palavra-passe*, *iniciar sessão*. As cidades referenciadas são portuguesas. Os preços são apresentados no formato europeu, com o símbolo depois do número e separado por espaço: `32 €`.

A interface **não tem emojis** — nem nos botões, nem nas notificações, nem nos cabeçalhos. E **não existe nome de marca nem título de produto** em lado nenhum: o slot do logótipo é apenas um ícone num quadrado branco, sem lettermark, sem tagline, sem "Sistema de Gestão de" coisa nenhuma escrito ao lado. O `<title>` em `welcome.blade.php` está vazio de propósito.

A linguagem visual é editorial e sóbria — tipografia *Fraunces* para títulos e *Inter* para texto corrente, paleta de tinta sobre papel com um verde-floresta como acento, traços finos como separadores. Não se usam gradientes, cantos `rounded-2xl` exagerados, nem círculos de ícone coloridos: tudo isso pertence a uma estética que foi explicitamente rejeitada.
