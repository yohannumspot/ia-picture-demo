# 📦 Déploiement Kubernetes – IA Picture Demo

Ce dossier contient les fichiers nécessaires pour déployer l'application **ia-picture-demo** sur un cluster Kubernetes, avec une **instance Ollama externe** (hors cluster).

---

## 📁 Contenu du dossier

- `namespace.yaml` : crée un namespace dédié `ia-demo`
- `deployment.yaml` : déploie l'application Node.js
- `service.yaml` : expose le Pod via un Service interne
- `ingress.yaml` : permet d’accéder à l’application via une URL personnalisée

---

## ⚙️ Pré-requis

- Un cluster Kubernetes fonctionnel (Minikube, K3s, GKE, etc.)
- Un Ingress Controller actif (par exemple : NGINX Ingress Controller)
- Une instance **Ollama** accessible depuis le cluster à l'adresse spécifiée dans `OLLAMA_BASE_URL`

---

## ✏️ Configuration nécessaire

Dans `deployment.yaml`, modifie la ligne suivante avec l’adresse IP ou le DNS de ta VM où tourne Ollama :

```yaml
- name: OLLAMA_BASE_URL
  value: "http://<IP_VM_OLLAMA>:11434"
```

---

## 🚀 Déploiement en 4 étapes

```bash
kubectl apply -f namespace.yaml
kubectl apply -n ia-demo -f deployment.yaml
kubectl apply -n ia-demo -f service.yaml
kubectl apply -n ia-demo -f ingress.yaml
```

---

## 🧪 Accès à l’application

Ajoute l’URL suivante dans ton fichier `/etc/hosts` (si usage local avec Minikube) :

```
127.0.0.1 ia-picture.local
```

Puis ouvre dans ton navigateur :  
🌐 http://ia-picture.local

---

## 🧹 Nettoyage

```bash
kubectl delete namespace ia-demo
```

---

## ✨ Astuce

Si tu veux tester rapidement sans DNS ni Ingress, expose le service en `NodePort` en modifiant `service.yaml`.

---

Fait avec ❤️ par [Yohan Parent](https://github.com/yohannumspot)
