# **🚜 Cred+ Dashboard**

Este é o guia técnico para configuração do ambiente de desenvolvimento **Front-end UI**. Siga os passos abaixo para garantir que sua interface rode exatamente como a do desenvolvedor principal, evitando conflitos de pacotes ou estilização.

---

## **🛠️ Stack Tecnológica**

* **Framework:** [React 18+](https://react.dev/) \+ [Vite](https://vitejs.dev/)  
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)  
* **Ícones:** [Lucide React](https://lucide.dev/)  
* **Gráficos:** [Recharts](https://recharts.org/)  
* **Navegação:** [React Router Dom](https://reactrouter.com/)

---

## **🚀 Pré-requisitos**

Antes de iniciar, valide as versões no seu terminal:

* **Node.js:** v18.x ou v20.x (LTS recomendada)  
* **Gerenciador de pacotes:** npm 9+

Bash  
node \-v  \# Verificar versão do Node  
npm \-v   \# Verificar versão do npm

**Dica de VS Code:** Instale a extensão **Tailwind CSS IntelliSense** para suporte a autocompletar as classes da v4.

---

## **📦 1\. Instalação**

Clone o repositório, acesse a pasta e instale as dependências:

Bash  
npm install

### **⚠️ Resolução de problemas (Instalação)**

Caso encontre erros de permissão ou conflitos de node\_modules, execute:

Bash  
npm cache clean \--force  
rm \-rf node\_modules package-lock.json  
npm install

---

## **💻 2\. Desenvolvimento**

Para subir o servidor local:

Bash  
npm run dev

🔗 **Local:** http://localhost:5173/

**Nota sobre o Login:** O protótipo atual aceita qualquer e-mail e uma senha de no mínimo 4 caracteres (sem validação de backend no momento).

---

## **🎨 3\. Guia de Contribuição (Foco UI)**

Sua atuação principal será na camada de **User Interface**. Abaixo, o mapeamento de onde você deve focar e o que deve evitar:

| Pasta / Arquivo | Responsabilidade | Ações Esperadas |
| :---- | :---- | :---- |
| src/components/ | Componentes Modulares | Ajustar MetricCard, GaugeChart, ProgressBar, etc. |
| src/layouts/ | Estrutura Geral | Refinar MainLayout (sidebar, menu mobile e transições). |
| src/index.css | Design System | Configurar variáveis @theme e utilitários globais. |

**🚨 Evite alterar sem aviso prévio:**

* src/data/mockData.js (Altera a estrutura de dados exibida).  
* src/context/ ou src/routes/ (Lógica de estado e navegação).  
* Arquivos de configuração (vite.config.js, package.json).

---

## **🔄 4\. Fluxo de Trabalho (Git)**

Mantenha o histórico limpo seguindo este padrão:

1. **Criar Branch:** git checkout \-b feature/ui-nome  
2. **Commits Semânticos:** git commit \-m "feat: aprimora responsividade do Header"  
3. **Sincronizar:** git push origin feature/ui-nome

---

## **🧪 5\. Checklist de Entrega**

Antes de abrir o **Pull Request**, verifique:

* \[ \] O projeto roda sem erros no console do navegador (F12).  
* \[ \] O login permite acesso ao dashboard.  
* \[ \] Os gráficos (Recharts) estão renderizando corretamente.  
* \[ \] O menu lateral (sidebar) funciona corretamente em modo mobile.  
* \[ \] Não há "avisos vermelhos" (errors) no terminal do VS Code.

---

## **❓ Troubleshooting (Soluções Comuns)**

| Erro / Sintoma | Solução |
| :---- | :---- |
| **Porta 5173 em uso** | Rode npx kill-port 5173 ou reinicie o VS Code. |
| **Tailwind não aplica estilos** | Verifique o @import "tailwindcss"; no topo do index.css. |
| **Tela branca (White Screen)** | Verifique o Console (F12). Geralmente é um erro de importação/exportação de componente. |
| **Module not found** | Delete a pasta node\_modules e rode npm install novamente. |

---

