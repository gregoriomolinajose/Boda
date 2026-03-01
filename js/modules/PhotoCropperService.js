export class PhotoCropperService {
    constructor(formSyncManager) {
        this.cropper = null;
        this.formSyncManager = formSyncManager;
        this.bindEvents();
    }

    bindEvents() {
        const photoInput = document.getElementById('photo-input');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.openCropper(event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    reEditPhoto() {
        if (window.APP_CONFIG.wedding.photo && !window.APP_CONFIG.wedding.photo.includes('placeholder')) {
            this.openCropper(window.APP_CONFIG.wedding.photo);
        } else {
            window.Utils.showToast('toast-container', 'Sube una foto primero para poder editarla.');
        }
    }

    openCropper(imageSrc) {
        const modal = document.getElementById('modal-cropper');
        const image = document.getElementById('cropper-image');
        if (!modal || !image) return;

        image.src = imageSrc;
        modal.style.display = 'flex';

        if (this.cropper) this.cropper.destroy();

        if (window.Cropper) {
            this.cropper = new Cropper(image, {
                aspectRatio: 0.8, // 4:5 por defecto
                viewMode: 1,
                dragMode: 'move',
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                zoom: (e) => {
                    const slider = document.getElementById('cropper-zoom-slider');
                    if (slider) {
                        const ratio = Math.log(e.detail.ratio) / Math.log(10) + 0.1;
                        slider.value = Math.max(0, Math.min(1, ratio));
                    }
                }
            });
        }

        const zoomSlider = document.getElementById('cropper-zoom-slider');
        if (zoomSlider) {
            zoomSlider.value = 0; // Reset
            zoomSlider.oninput = (e) => {
                if (!this.cropper) return;
                const zoomLevel = Math.pow(10, parseFloat(e.target.value) - 0.1);
                this.cropper.zoomTo(zoomLevel);
            };
        }

        const ratioMenu = document.getElementById('ratio-options');
        if (ratioMenu) ratioMenu.classList.remove('active');
        document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
        const defaultRatio = document.getElementById('default-ratio-btn');
        if (defaultRatio) defaultRatio.classList.add('active');
    }

    toggleRatioMenu() {
        const menu = document.getElementById('ratio-options');
        if (menu) menu.classList.toggle('active');
    }

    setCropRatio(ratio, label, btn) {
        if (!this.cropper) return;

        this.cropper.setAspectRatio(ratio);

        document.querySelectorAll('.ratio-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');

        this.toggleRatioMenu();
    }

    closeCropper() {
        const modal = document.getElementById('modal-cropper');
        if (modal) modal.style.display = 'none';

        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }

        const photoInput = document.getElementById('photo-input');
        if (photoInput) photoInput.value = '';
    }

    applyCrop() {
        if (!this.cropper) return;

        const canvas = this.cropper.getCroppedCanvas({
            maxWidth: 1024,
            maxHeight: 1280,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.5);

        const preview = document.getElementById('couple-photo-preview');
        if (preview) preview.src = croppedBase64;

        window.APP_CONFIG.wedding.photo = croppedBase64;

        this.closeCropper();
        if (this.formSyncManager) this.formSyncManager.notifyPreview();
    }

    deletePhoto() {
        if (confirm('¿Estás seguro de que deseas eliminar la foto de los novios?')) {
            const placeholder = "https://placehold.co/600x600?text=Subir+Foto";
            window.APP_CONFIG.wedding.photo = placeholder;
            const preview = document.getElementById('couple-photo-preview');
            if (preview) preview.src = placeholder;
            if (this.formSyncManager) this.formSyncManager.notifyPreview();
        }
    }
}
