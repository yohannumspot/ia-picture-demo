document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Application NumSpot chargée');
    
    // Éléments DOM
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const fileInfo = document.getElementById('fileInfo');
    const previewSection = document.getElementById('previewSection');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultSection = document.getElementById('resultSection');
    const loadingState = document.getElementById('loadingState');
    const resultContent = document.getElementById('resultContent');
    const descriptionText = document.getElementById('descriptionText');
    
    let selectedFile = null;

    // Gestion des événements de clic pour l'upload
    uploadButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('📁 Ouverture du sélecteur de fichier');
        fileInput.click();
    });

    dropArea.addEventListener('click', function(e) {
        if (e.target !== uploadButton && !e.target.closest('#uploadButton')) {
            console.log('📁 Clic sur la zone de drop');
            fileInput.click();
        }
    });

    // Gestion du drag & drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('active');
    }

    function unhighlight() {
        dropArea.classList.remove('active');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        console.log('📎 Fichier déposé:', files.length);
        handleFiles(files);
    }

    // Gestion de la sélection de fichier
    fileInput.addEventListener('change', function() {
        console.log('📂 Fichier sélectionné via input:', this.files.length);
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            console.log('📄 Traitement du fichier:', file.name, file.type, formatFileSize(file.size));

            // Validation du type de fichier
            if (!file.type.match('image.*')) {
                showNotification('Veuillez sélectionner un fichier image valide.', 'error');
                return;
            }

            // Validation de la taille (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('Le fichier est trop volumineux. Taille maximale : 10MB.', 'error');
                return;
            }

            selectedFile = file;
            
            // Affichage des informations du fichier
            fileInfo.innerHTML = `
                <strong>✅ Fichier sélectionné :</strong> ${file.name}<br>
                <span style="color: #64748b;">Taille : ${formatFileSize(file.size)} • Type : ${file.type}</span>
            `;
            fileInfo.style.display = 'block';

            // Prévisualisation de l'image
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewSection.style.display = 'block';
                analyzeBtn.disabled = false;
                
                // Scroll vers la prévisualisation
                setTimeout(() => {
                    previewSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    }

    // Gestion de l'analyse
    analyzeBtn.addEventListener('click', async function() {
        if (!selectedFile) {
            console.warn('⚠️ Aucun fichier sélectionné');
            return;
        }

        console.log('🔍 Début de l\'analyse');
        
        // Affichage de l'état de chargement
        resultSection.style.display = 'block';
        loadingState.style.display = 'block';
        resultContent.style.display = 'none';
        analyzeBtn.disabled = true;
        
        // Mise à jour du bouton
        const originalHTML = analyzeBtn.innerHTML;
        analyzeBtn.innerHTML = `
            <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-left-color: white; animation: spin 1s linear infinite;"></div>
            Analyse en cours...
        `;

        // Scroll vers les résultats
        setTimeout(() => {
            resultSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 100);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            console.log('📡 Envoi de la requête d\'analyse');
            const response = await fetch('/describe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Échec de l\'analyse de l\'image');
            }

            const data = await response.json();
            console.log('✅ Analyse terminée');

            // Affichage du résultat
            loadingState.style.display = 'none';
            descriptionText.textContent = data.description;
            resultContent.style.display = 'block';

            showNotification('Analyse terminée avec succès !', 'success');

        } catch (error) {
            console.error('❌ Erreur lors de l\'analyse:', error);
            
            loadingState.style.display = 'none';
            descriptionText.innerHTML = `
                <div style="color: #dc2626; background: #fee2e2; padding: 1rem; border-radius: 8px; border: 1px solid #fecaca; margin-bottom: 1rem;">
                    <strong>❌ Erreur d'analyse :</strong><br>
                    ${error.message}
                </div>
                <p style="color: #64748b; font-size: 0.875rem;">
                    Vérifiez que le service Ollama est démarré et que le modèle LLaVA est installé.
                </p>
            `;
            resultContent.style.display = 'block';
            
            showNotification('Erreur lors de l\'analyse de l\'image', 'error');
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalHTML;
        }
    });

    // Fonctions utilitaires
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showNotification(message, type = 'info') {
        console.log(`📢 Notification [${type}]:`, message);
        
        // Configuration des types de notification
        const config = {
            success: { 
                icon: '✅', 
                bg: '#dcfce7', 
                text: '#166534', 
                border: '#bbf7d0' 
            },
            error: { 
                icon: '❌', 
                bg: '#fee2e2', 
                text: '#dc2626', 
                border: '#fecaca' 
            },
            info: { 
                icon: 'ℹ️', 
                bg: '#dbeafe', 
                text: '#2563eb', 
                border: '#bfdbfe' 
            }
        };

        const style = config[type] || config.info;

        // Création de la notification
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.25rem;">${style.icon}</span>
                <span style="font-weight: 500;">${message}</span>
            </div>
        `;

        // Styles de la notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            background: style.bg,
            color: style.text,
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            border: `1px solid ${style.border}`,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            fontSize: '0.875rem'
        });

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Suppression après 4 secondes
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Ajout des styles pour l'animation de chargement
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Initialisation terminée');
});
