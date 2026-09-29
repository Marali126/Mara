# Treino de Fluência Verbal & Prosódia Sintática

Aplicativo web completo para avaliação e intervenção fonoaudiológica e pedagógica em fluência leitora, ritmo prosódico, fatiamento sintático e geração de relatórios de evolução em PDF.

---

## 🚀 Como Executar no seu Computador / Repositório Local

### 1. Instalar as Dependências
```bash
npm install
```

### 2. Configurar a Chave de IA (Opcional - para Vozes Neurais Gemini)
O aplicativo possui dois motores de voz:
1. **Vozes do Dispositivo / Navegador (Web Speech API):** 100% gratuitas, offline e prontas para uso sem nenhuma chave ou configuração adicional.
2. **Vozes de IA Ultra-Naturais (Google Gemini):** Utilizam síntese neural expressiva com dicção humana. Para utilizá-las no seu repositório local, crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```
Abra o arquivo `.env` e insira sua chave gratuita da API do Google Gemini:
```env
GEMINI_API_KEY="sua_chave_aqui"
```
*(Você pode gerar sua chave gratuitamente em [Google AI Studio](https://aistudio.google.com/app/apikey)).*

### 3. Iniciar o Aplicativo
```bash
npm run dev
```
Acesse no seu navegador: `http://localhost:3000`

---

## 🔊 Solução de Problemas com a Voz

Se ao clonar o repositório a voz não tocar, confira os seguintes pontos:

### Cenário 1: Você está no modo "Voz de IA", mas não configurou a `GEMINI_API_KEY`
* **Solução rápida:** No aplicativo, clique no botão **"Voz & Velocidade"** no painel de controles e selecione a aba **"Vozes do Dispositivo"**. Escolha qualquer uma das vozes em português (como *Google Português*, *Microsoft Francisca Natural*, etc.). Essas vozes funcionam diretamente no seu navegador sem precisar de servidor ou chave de API!
* **Para usar a IA:** Crie o arquivo `.env` com a sua `GEMINI_API_KEY` e execute com `npm run dev`.

### Cenário 2: Você publicou o projeto no GitHub Pages, Vercel ou Netlify estático
* O GitHub Pages e hospedagens puramente estáticas não executam servidores Node.js em backend (o endpoint `/api/tts` não existe neles).
* **Solução:** O aplicativo detecta isso automaticamente e aciona as **Vozes do Dispositivo**, que funcionam perfeitamente no navegador em qualquer hospedagem estática!

### Cenário 3: Navegador com áudio bloqueado (Política de Autoplay)
* Navegadores como Google Chrome, Safari e Microsoft Edge exigem que o usuário clique na página antes de reproduzir áudio.
* Certifique-se de clicar no botão **"▶ Ouvir"** ou em uma palavra para liberar o áudio.
* Verifique se a aba do navegador não está com o ícone de alto-falante mutado.

### Cenário 4: Sistema operacional sem voz em português instalada (Linux / Windows em inglês)
* Se ao abrir o seletor de vozes o número de vozes do dispositivo for zero:
  * No **Windows**: Vá em *Configurações > Hora e Idioma > Fala > Adicionar vozes > Português (Brasil)*.
  * No **Google Chrome** ou **Microsoft Edge**: O próprio navegador já costuma fornecer vozes neurais gratuitas como *Microsoft Francisca (Natural)* e *Google português do Brasil*.

---

## 📋 Funcionalidades Principais
* **35 Textos Estruturados:** Do 1º ano do Ensino Fundamental ao Ensino Médio, calibrados por leiturabilidade Flesch.
* **Divisão Sintática Rigorosa:** Barras (`/`) posicionadas sem separar núcleos nominais de seus adjetivos adjacentes.
* **Identificação de Paciente:** Campo direto na barra superior e no relatório para nome do paciente e data da avaliação.
* **Relatório Técnico em PDF:** Emissão com indicadores (PPM, Flesch, taxa de conclusão), histórico de leituras e parecer pedagógico/clínico assinado.
* **Suporte a Logotipo Próprio:** Personalize o cabeçalho e os relatórios com a marca do seu consultório ou escola.
