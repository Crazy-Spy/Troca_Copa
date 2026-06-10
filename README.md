# Tinder Stickers ⚽

Uma aplicação web simples para ajudar grupos de amigos a trocarem figurinhas da Copa do Mundo!

Este aplicativo permite que cada pessoa cole a lista exportada do seu aplicativo de gerenciamento de figurinhas (sejam faltantes ou repetidas) e cruza as informações de todos os usuários em tempo real para encontrar os melhores "matches" de troca.

## Funcionalidades

- **Parser Inteligente:** Entende listas exportadas de vários aplicativos diferentes (como Figuritas App, Moovtech, etc.). Ele limpa emojis, formatações estranhas e pega direto os códigos e números.
- **Banco em Nuvem:** Usa Firebase Firestore para salvar as listas de todos os usuários e cruzar os dados instantaneamente.
- **Matches:** Mostra claramente "Você tem X figurinhas que o Fulano quer" e "O Fulano tem Y figurinhas que você quer".
- **Sem Login Complexo:** Basta digitar seu nome, colar a lista e pronto. O app usa o nome como identificador único.

## Como rodar o projeto

Este projeto é feito puramente com HTML, CSS e JavaScript (Vanilla), sem frameworks pesados, o que o torna perfeito para ser hospedado gratuitamente no **GitHub Pages**.
