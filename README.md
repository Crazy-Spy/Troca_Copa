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

### Passo a Passo para Deploy no GitHub Pages

1. **Crie um repositório** no seu GitHub e suba os arquivos para a raiz do repositório.
2. Vá nas **Settings (Configurações)** do seu repositório no GitHub.
3. No menu lateral, clique em **Pages**.
4. Em "Source" (ou "Build and deployment"), selecione a branch `main` e a pasta `root`.
5. Clique em **Save**. Em alguns minutos, seu site estará no ar!

## Segurança (Importante)

Como este é um aplicativo 100% frontend, as chaves do Firebase ficam visíveis no código. Isso é normal, mas para evitar que outras pessoas usem suas chaves em outros sites (o que pode gerar cobranças), **você deve restringir sua Chave de API**:

1. Acesse o [Google Cloud Console (Credenciais)](https://console.cloud.google.com/apis/credentials).
2. Selecione o projeto associado ao seu Firebase.
3. Clique na **Chave de API do Navegador** (Browser Key).
4. Em **Restrições de aplicativo**, selecione **Referenciadores HTTP (Sites)**.
5. Adicione a URL do seu GitHub Pages: `*seu-usuario.github.io/*` (ex: `*crazy-spy.github.io/*`).
6. Se for testar localmente, adicione também `localhost/*` ou `127.0.0.1/*`.
7. Salve as alterações.

Assim, seu banco de dados estará seguro contra uso em sites de terceiros.
