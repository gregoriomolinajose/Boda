export class FormSyncManager {
    constructor(store) {
        this.store = store;
        this.timelineBuilder = null; // Setter needed
    }

    setTimelineBuilder(builder) {
        this.timelineBuilder = builder;
    }

    populateSettingsForm() {
        const config = window.APP_CONFIG;
        if (!config) return;

        // Anfitriones
        this.safeSet('set-wedding-names', config.wedding.names);

        // Fecha y Hora
        if (config.wedding.date) {
            const weddingDateObj = new Date(config.wedding.date);
            const year = weddingDateObj.getFullYear();
            const month = String(weddingDateObj.getMonth() + 1).padStart(2, '0');
            const day = String(weddingDateObj.getDate()).padStart(2, '0');
            const hours = String(weddingDateObj.getHours()).padStart(2, '0');
            const minutes = String(weddingDateObj.getMinutes()).padStart(2, '0');

            this.safeSet('set-wedding-date-picker', `${year}-${month}-${day}`);
            this.safeSet('set-wedding-time-picker', `${hours}:${minutes}`);
        }

        // UI
        this.safeSetCheck('set-show-countdown', config.ui.showCountdown !== false);
        this.safeSet('set-physical-location', config.wedding.location.physical);
        this.safeSet('set-virtual-location', config.wedding.location.virtual);
        this.safeSet('set-primary-blue', config.ui.primaryBlue || '#93afc2');
        this.safeSet('set-primary-olive', config.ui.primaryOlive || '#6b705c');
        this.safeSet('set-icon-color', config.ui.iconColor || '#80a040');
        this.safeSet('set-font-primary', config.ui.fontPrimary || 'Montserrat');
        this.safeSet('set-font-script', config.ui.fontScript || 'Great Vibes');

        const bgAnim = config.ui.bgAnimation || { enabled: true, type: 'particles', size: 15, opacity: 0.15, color: '#6b705c' };
        this.safeSetCheck('set-bg-anim-enabled', bgAnim.enabled !== false);
        this.safeSet('set-bg-anim-type', bgAnim.type || 'particles');
        this.safeSet('set-bg-anim-size', bgAnim.size || 15);
        this.safeSet('set-bg-anim-opacity', bgAnim.opacity || 0.15);
        this.safeSet('set-bg-anim-color', bgAnim.color || '#6b705c');
        this.safeSet('set-timeline-align', config.ui.timelineAlign || 'center');

        this.safeSet('set-wedding-message', config.wedding.message);
        this.safeSet('set-wedding-subject', config.wedding.subject || "Nuestra Boda");
        this.safeSet('set-demo-guest-name', config.wedding.demoGuestName);

        // Calendario
        const cl = config.wedding.calendar || {};
        this.safeSet('set-calendar-title', cl.title);
        this.safeSet('set-calendar-description', cl.description);
        this.safeSet('set-calendar-time', cl.time);

        // Logística y Detalles
        const dc = config.wedding.dressCode || {};
        this.safeSetCheck('set-dress-code-show', dc.show !== false);
        this.safeSet('set-dress-code-title', dc.title);
        this.safeSet('set-dress-code-description', dc.description);
        this.safeSet('set-dress-code-tip', dc.tip);

        const gf = config.wedding.gifts || {};
        this.safeSetCheck('set-gifts-show', gf.show !== false);
        this.safeSet('set-gifts-title', gf.title);
        this.safeSet('set-gifts-description', gf.description);

        const rb = gf.registryButton || {};
        this.safeSetCheck('set-registry-show', rb.show !== false);
        this.safeSet('set-registry-url', rb.url);

        const bb = gf.bankButton || {};
        this.safeSetCheck('set-bank-show', bb.show !== false);
        this.safeSet('set-bank-details', bb.details);

        const ga = config.wedding.gallery || {};
        this.safeSet('set-gallery-title', ga.title);
        this.safeSet('set-gallery-description', ga.description);

        const up = ga.uploadButton || {};
        this.safeSetCheck('set-upload-show', up.show !== false);
        this.safeSet('set-upload-url', up.url);

        const al = ga.albumButton || {};
        this.safeSetCheck('set-album-show', al.show !== false);
        this.safeSet('set-album-url', al.url);

        // Configuración RSVP
        const rv = config.wedding.rsvp || {};
        this.safeSet('set-rsvp-title', rv.title);
        this.safeSet('set-rsvp-description', rv.description);
        this.safeSetCheck('set-rsvp-adults-show', rv.showAdults !== false && String(rv.showAdults) !== 'false');
        this.safeSetCheck('set-rsvp-kids-show', rv.showKids !== false && String(rv.showKids) !== 'false');
        this.safeSetCheck('set-rsvp-allergies-show', rv.showAllergies !== false && String(rv.showAllergies) !== 'false');

        // Configuración Mensajes Finales
        const cf = config.wedding.confirmation || {};
        this.safeSet('set-final-title-yes', cf.yes?.title);
        this.safeSet('set-final-desc-yes', cf.yes?.description);
        this.safeSet('set-final-title-no', cf.no?.title);
        this.safeSet('set-final-desc-no', cf.no?.description);

        // Foto del Anfitrión
        const photoPreview = document.getElementById('couple-photo-preview');
        if (photoPreview) {
            photoPreview.src = config.wedding.photo || "https://placehold.co/600x600?text=Subir+Foto";
        }

        if (this.timelineBuilder) this.timelineBuilder.render();

        this.bindColorSyncs();
    }

    safeSet(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || "";
    }

    safeSetCheck(id, value) {
        const el = document.getElementById(id);
        if (el) el.checked = value;
    }

    safeGet(id, fallback = "") {
        const el = document.getElementById(id);
        return el ? el.value : fallback;
    }

    safeGetCheck(id, fallback = true) {
        const el = document.getElementById(id);
        return el ? el.checked : fallback;
    }

    bindColorSyncs() {
        const colorPicker = document.getElementById('set-icon-color');
        if (colorPicker) {
            colorPicker.oninput = (e) => {
                const newColor = e.target.value;
                window.APP_CONFIG.ui.iconColor = newColor;
                document.querySelectorAll('.icon-selector-btn').forEach(btn => {
                    btn.style.borderColor = newColor;
                    const icon = btn.querySelector('i');
                    if (icon) icon.style.color = newColor;
                });
                this.notifyPreview();
            };
        }

        const primaryBluePicker = document.getElementById('set-primary-blue');
        if (primaryBluePicker) {
            primaryBluePicker.oninput = (e) => {
                document.documentElement.style.setProperty('--primary-blue', e.target.value);
                this.notifyPreview();
            };
        }

        const inputs = document.querySelectorAll('#settings-page input, #settings-page select, #settings-page textarea');
        inputs.forEach(input => {
            if (input.id !== 'photo-input') {
                input.addEventListener('input', () => this.notifyPreview());
                input.addEventListener('change', () => this.notifyPreview());
            }
        });
    }

    notifyPreview() {
        const iframe = document.getElementById('preview-iframe');
        if (!iframe || !iframe.contentWindow) return;

        const date = this.safeGet('set-wedding-date-picker');
        const time = this.safeGet('set-wedding-time-picker');

        const configSnapshot = {
            wedding: {
                names: this.safeGet('set-wedding-names'),
                date: `${date} ${time}`.trim(),
                location: {
                    physical: this.safeGet('set-physical-location'),
                    virtual: this.safeGet('set-virtual-location')
                },
                photo: document.getElementById('couple-photo-preview')?.src || "",
                message: this.safeGet('set-wedding-message'),
                subject: this.safeGet('set-wedding-subject'),
                demoGuestName: this.safeGet('set-demo-guest-name'),
                calendar: {
                    title: this.safeGet('set-calendar-title'),
                    description: this.safeGet('set-calendar-description'),
                    time: this.safeGet('set-calendar-time')
                },
                dressCode: {
                    show: this.safeGetCheck('set-dress-code-show'),
                    title: this.safeGet('set-dress-code-title'),
                    description: this.safeGet('set-dress-code-description'),
                    tip: this.safeGet('set-dress-code-tip')
                },
                gifts: {
                    show: this.safeGetCheck('set-gifts-show'),
                    title: this.safeGet('set-gifts-title'),
                    description: this.safeGet('set-gifts-description'),
                    registryButton: {
                        show: this.safeGetCheck('set-registry-show'),
                        url: this.safeGet('set-registry-url')
                    },
                    bankButton: {
                        show: this.safeGetCheck('set-bank-show'),
                        details: this.safeGet('set-bank-details')
                    }
                },
                gallery: {
                    title: this.safeGet('set-gallery-title'),
                    description: this.safeGet('set-gallery-description'),
                    uploadButton: {
                        show: this.safeGetCheck('set-upload-show'),
                        url: this.safeGet('set-upload-url')
                    },
                    albumButton: {
                        show: this.safeGetCheck('set-album-show'),
                        url: this.safeGet('set-album-url')
                    }
                },
                rsvp: {
                    title: this.safeGet('set-rsvp-title'),
                    description: this.safeGet('set-rsvp-description'),
                    showAdults: this.safeGetCheck('set-rsvp-adults-show'),
                    showKids: this.safeGetCheck('set-rsvp-kids-show'),
                    showAllergies: this.safeGetCheck('set-rsvp-allergies-show')
                },
                confirmation: {
                    yes: {
                        title: this.safeGet('set-final-title-yes'),
                        description: this.safeGet('set-final-desc-yes')
                    },
                    no: {
                        title: this.safeGet('set-final-title-no'),
                        description: this.safeGet('set-final-desc-no')
                    }
                }
            },
            ui: {
                showCountdown: this.safeGetCheck('set-show-countdown', true),
                iconColor: this.safeGet('set-icon-color', '#80a040'),
                primaryBlue: this.safeGet('set-primary-blue', '#93afc2'),
                primaryOlive: this.safeGet('set-primary-olive', '#6b705c'),
                fontPrimary: this.safeGet('set-font-primary', 'Montserrat'),
                fontScript: this.safeGet('set-font-script', 'Great Vibes'),
                timelineAlign: this.safeGet('set-timeline-align', 'center'),
                bgAnimation: {
                    enabled: this.safeGetCheck('set-bg-anim-enabled', true),
                    type: this.safeGet('set-bg-anim-type', 'particles'),
                    size: parseFloat(this.safeGet('set-bg-anim-size', '15')),
                    opacity: parseFloat(this.safeGet('set-bg-anim-opacity', '0.15')),
                    color: this.safeGet('set-bg-anim-color', '#6b705c')
                }
            },
            timeline: []
        };

        const timelineItems = document.querySelectorAll('.timeline-builder-item');
        timelineItems.forEach(row => {
            configSnapshot.timeline.push({
                time: row.querySelector('.set-timeline-time').value,
                activity: row.querySelector('.set-timeline-activity').value,
                icon: row.querySelector('.icon-selector-btn').dataset.icon
            });
        });

        iframe.contentWindow.postMessage({
            type: 'UPDATE_CONFIG',
            config: configSnapshot
        }, '*');
    }

    simulatePreviewRsvp(state) {
        const iframe = document.getElementById('preview-iframe');
        if (!iframe || !iframe.contentWindow) return;

        this.notifyPreview();

        iframe.contentWindow.postMessage({
            type: 'SIMULATE_RSVP',
            state: state
        }, '*');
    }

    async saveSettings() {
        const config = window.APP_CONFIG;

        // Use notifyPreview internally to gather the state for us if we wanted, 
        // but let's reconstruct it directly to window.APP_CONFIG just in case.

        const date = this.safeGet('set-wedding-date-picker');
        const time = this.safeGet('set-wedding-time-picker');

        config.wedding.names = this.safeGet('set-wedding-names');
        config.wedding.date = `${date || ""} ${time || ""}`.trim();
        config.wedding.message = this.safeGet('set-wedding-message');
        config.wedding.subject = this.safeGet('set-wedding-subject');
        config.wedding.demoGuestName = this.safeGet('set-demo-guest-name');

        const currentPhoto = document.getElementById('couple-photo-preview')?.src;
        if (currentPhoto && !currentPhoto.includes('placeholder') && !currentPhoto.includes('placehold.co')) {
            config.wedding.photo = currentPhoto;
        } else {
            config.wedding.photo = "";
        }

        Object.assign(config.wedding, {
            calendar: {
                title: this.safeGet('set-calendar-title'),
                description: this.safeGet('set-calendar-description'),
                time: this.safeGet('set-calendar-time')
            },
            dressCode: {
                show: this.safeGetCheck('set-dress-code-show'),
                title: this.safeGet('set-dress-code-title'),
                description: this.safeGet('set-dress-code-description'),
                tip: this.safeGet('set-dress-code-tip')
            },
            gifts: {
                show: this.safeGetCheck('set-gifts-show'),
                title: this.safeGet('set-gifts-title'),
                description: this.safeGet('set-gifts-description'),
                registryButton: {
                    show: this.safeGetCheck('set-registry-show'),
                    url: this.safeGet('set-registry-url')
                },
                bankButton: {
                    show: this.safeGetCheck('set-bank-show'),
                    details: this.safeGet('set-bank-details')
                }
            },
            gallery: {
                title: this.safeGet('set-gallery-title'),
                description: this.safeGet('set-gallery-description'),
                uploadButton: {
                    show: this.safeGetCheck('set-upload-show'),
                    url: this.safeGet('set-upload-url')
                },
                albumButton: {
                    show: this.safeGetCheck('set-album-show'),
                    url: this.safeGet('set-album-url')
                }
            },
            rsvp: {
                title: this.safeGet('set-rsvp-title'),
                description: this.safeGet('set-rsvp-description'),
                showAdults: this.safeGetCheck('set-rsvp-adults-show'),
                showKids: this.safeGetCheck('set-rsvp-kids-show'),
                showAllergies: this.safeGetCheck('set-rsvp-allergies-show')
            },
            confirmation: {
                yes: {
                    title: this.safeGet('set-final-title-yes'),
                    description: this.safeGet('set-final-desc-yes')
                },
                no: {
                    title: this.safeGet('set-final-title-no'),
                    description: this.safeGet('set-final-desc-no')
                }
            }
        });

        config.wedding.location.physical = this.safeGet('set-physical-location');
        config.wedding.location.virtual = this.safeGet('set-virtual-location');

        Object.assign(config.ui, {
            bgAnimation: {
                enabled: this.safeGetCheck('set-bg-anim-enabled', true),
                type: this.safeGet('set-bg-anim-type', 'particles'),
                size: parseFloat(this.safeGet('set-bg-anim-size', '15')),
                opacity: parseFloat(this.safeGet('set-bg-anim-opacity', '0.15')),
                color: this.safeGet('set-bg-anim-color', '#6b705c')
            },
            showCountdown: this.safeGetCheck('set-show-countdown', true),
            iconColor: this.safeGet('set-icon-color', '#80a040'),
            primaryBlue: this.safeGet('set-primary-blue', '#93afc2'),
            primaryOlive: this.safeGet('set-primary-olive', '#6b705c'),
            fontPrimary: this.safeGet('set-font-primary', 'Montserrat'),
            fontScript: this.safeGet('set-font-script', 'Great Vibes'),
            timelineAlign: this.safeGet('set-timeline-align', 'center')
        });

        if (this.timelineBuilder) {
            this.timelineBuilder.sync();
        }

        const saveBtn = document.querySelector('.save-settings-btn');
        const originalText = saveBtn ? saveBtn.innerHTML : '';
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            saveBtn.disabled = true;
        }

        setTimeout(async () => {
            try {
                await this.store.setState(window.APP_CONFIG);
                window.Utils.showToast('toast-container', 'Configuración guardada correctamente.');

                // toggleSettings is globally available
                if (window.toggleSettings) window.toggleSettings(false);
            } catch (e) {
                console.error(e);
                window.Utils.showToast('toast-container', 'Error al guardar.');
            } finally {
                if (saveBtn) {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }
            }
        }, 100);
    }
}
