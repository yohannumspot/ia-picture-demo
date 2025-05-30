# 🖼️ IA Picture Demo

Une application web simple en **Node.js** permettant d’envoyer une image, puis d’en obtenir une **description générée automatiquement par l’IA** via l’API d’**Ollama**.

---

## ✨ Fonctionnalités

- Upload d’image depuis une interface moderne
- Compression & redimensionnement avec Sharp
- Appel à un modèle IA local (LLaVA/LLaMA) via Ollama
- Affichage d’une description détaillée en français
- Interface responsive sans framework lourd

---

## 🚀 Lancer l'application en local

### 🔧 Prérequis

- [Node.js](https://nodejs.org/) v18 ou plus
- [Ollama](https://ollama.com/) installé en local
- Modèle LLaVA installé localement :
  ```bash
  ollama serve
  ollama pull llama4:scout

### 📦 Installation
git clone https://github.com/yohannumspot/ia-picture-demo.git
cd ia-picture-demo
npm install

### ▶️ Lancement
npm start

L'application est ensuite accessible à l’adresse :
🔗 http://localhost:3000

### ⚙️ Configuration

L'application peut être configurée avec les variables d'environnement suivantes :

Variable	Description	Valeur par défaut
PORT	Port sur lequel le serveur Express tourne	(valeur par défaut : 3000)
OLLAMA_BASE_URL	URL de l’API Ollama	(valeur par défaut : http://localhost:11434)
OLLAMA_MODEL	Nom du modèle à utiliser	(valeur par défaut : llama4:scout)
