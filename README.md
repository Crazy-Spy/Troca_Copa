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

1. **Crie um repositório** no seu GitHub e suba os arquivos desta pasta `src/` para ele (ou para a raiz do repositório).
2. Vá nas **Settings (Configurações)** do seu repositório no GitHub.
3. No menu lateral, clique em **Pages**.
4. Em "Source" (ou "Build and deployment"), selecione a branch `main` e a pasta `root` (ou a pasta onde você colocou os arquivos html).
5. Clique em **Save**. Em alguns minutos, seu site estará no ar!

## Configuração do Firebase Firestore

Para que os dados sejam salvos e compartilhados entre todos que acessam o link, o aplicativo utiliza o Firebase. As configurações iniciais já estão no arquivo `src/app.js`, porém, **é crucial configurar as Regras de Segurança (Rules)** no painel do Firebase para permitir leitura e escrita, já que o app não utiliza sistema de autenticação por e-mail/senha.

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e entre no projeto `trocacopa-e1071`.
2. No menu lateral esquerdo, vá em **Firestore Database**.
3. (Se ainda não tiver criado o banco, clique em "Create database" e inicie no "Modo de Teste" ou "Production mode").
4. Vá na aba **Rules (Regras)**.
5. Altere as regras para permitir leitura e escrita públicas (para fins de um app fechado entre amigos, isso é suficiente):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // PERMITE LEITURA E ESCRITA PARA TODOS
      allow read, write: if true;
    }
  }
}
```

6. Clique em **Publish (Publicar)**.

Pronto! Agora o aplicativo conseguirá salvar as listas e buscar os matches perfeitamente.
