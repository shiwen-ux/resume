/* ==========================================================================
   Word Web UI - JavaScript Module
   
   This file handles all interactive functionality for the Word-style UI.
   ========================================================================== */

(function() {
    'use strict';

    // ==========================================================================
    // Theme Dropdown
    // ==========================================================================
    
    const themeTrigger = document.getElementById('theme-trigger');
    const themeMenu = document.getElementById('theme-menu');
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    const htmlEl = document.documentElement;
    
    const themeConfig = {
        light: { icon: '☀️', label: 'Light' },
        dark: { icon: '🌙', label: 'Dark' },
        retro: { icon: '🖥️', label: 'Retro' }
    };
    
    function setTheme(theme) {
        if (theme === 'dark') {
            htmlEl.removeAttribute('data-theme');
        } else {
            htmlEl.setAttribute('data-theme', theme);
        }
        themeIcon.textContent = themeConfig[theme].icon;
        themeLabel.textContent = themeConfig[theme].label;
        localStorage.setItem('theme', theme);
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    if (themeTrigger) {
        themeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('open');
        });
        
        themeMenu.querySelectorAll('.theme-dropdown__item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const theme = item.dataset.theme;
                setTheme(theme);
                themeMenu.classList.remove('open');
            });
        });
    }
    
    // Close theme dropdown when clicking outside
    document.addEventListener('click', () => {
        themeMenu?.classList.remove('open');
    });

    // ==========================================================================
    // Download PDF
    // ==========================================================================
    
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const paper = document.querySelector('.paper');
            if (paper) {
                const opt = {
                    margin: 0,
                    filename: 'Resume_Shiwen_Jiang.pdf',
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(paper).save();
            }
        });
    }

    // ==========================================================================
    // Refresh Button
    // ==========================================================================
    
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    // ==========================================================================
    // Tab Navigation
    // ==========================================================================
    
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('tab--active'));
            tab.classList.add('tab--active');
        });
    });

    // ==========================================================================
    // Zoom Controls
    // ==========================================================================
    
    const zoomValue = document.getElementById('zoom-value');
    const zoomSlider = document.getElementById('zoom-slider');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const zoomFit = document.getElementById('zoom-fit');
    let currentZoom = 100;
    
    function updateZoom(value) {
        currentZoom = Math.max(50, Math.min(200, value));
        if (zoomValue) zoomValue.textContent = `${currentZoom}%`;
        if (zoomSlider) zoomSlider.value = currentZoom;
        
        // Apply zoom to paper
        const paper = document.querySelector('.paper');
        if (paper) {
            paper.style.transform = `scale(${currentZoom / 100})`;
            paper.style.transformOrigin = 'top center';
        }
    }
    
    // Initialize zoom display
    updateZoom(100);
    
    // Zoom buttons
    if (zoomOut) {
        zoomOut.addEventListener('click', () => updateZoom(currentZoom - 10));
    }
    if (zoomIn) {
        zoomIn.addEventListener('click', () => updateZoom(currentZoom + 10));
    }
    if (zoomFit) {
        zoomFit.addEventListener('click', () => updateZoom(100));
    }
    
    // Slider input
    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            updateZoom(parseInt(e.target.value));
        });
    }

    // ==========================================================================
    // Search Bar Focus
    // ==========================================================================
    
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('click', () => {
            // Could open a search modal here
            console.log('Search clicked');
        });
    }

    // ==========================================================================
    // Keyboard Shortcuts
    // ==========================================================================
    
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + Option + Q for search
        if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === 'q') {
            e.preventDefault();
            searchBar?.click();
        }
    });

    // ==========================================================================
    // Word Count
    // ==========================================================================
    
    function updateWordCount() {
        const paper = document.querySelector('.paper');
        if (paper) {
            const text = paper.innerText || paper.textContent;
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            const wordCountEl = document.getElementById('word-count');
            if (wordCountEl) {
                wordCountEl.textContent = `${words.length} words`;
            }
        }
    }
    
    // Update word count on load
    updateWordCount();

    // ==========================================================================
    // Interactive Resume Sections
    // ==========================================================================
    
    const interactiveItems = document.querySelectorAll(
        '.resume-section--interactive, .experience-item--interactive, .education-item--interactive'
    );
    
    interactiveItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove selected from all items
            interactiveItems.forEach(i => i.classList.remove('selected'));
            // Add selected to clicked item
            item.classList.add('selected');
            
            // Trigger custom event for comment panel
            const sectionId = item.dataset.section;
            document.dispatchEvent(new CustomEvent('sectionSelected', { 
                detail: { sectionId } 
            }));
        });
    });
    
    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.resume-section--interactive, .experience-item--interactive, .education-item--interactive')) {
            interactiveItems.forEach(i => i.classList.remove('selected'));
        }
    });

    // ==========================================================================
    // Weather API
    // ==========================================================================
    
    async function fetchWeather() {
        try {
            const response = await fetch(
                'https://api.open-meteo.com/v1/forecast?latitude=49.2827&longitude=-123.1207&current=temperature_2m,weather_code'
            );
            const data = await response.json();
            const temp = Math.round(data.current.temperature_2m);
            const weatherCode = data.current.weather_code;
            
            const weatherEmoji = {
                0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
                45: '🌫️', 48: '🌫️',
                51: '🌧️', 53: '🌧️', 55: '🌧️',
                61: '🌧️', 63: '🌧️', 65: '🌧️',
                71: '🌨️', 73: '🌨️', 75: '🌨️',
                77: '🌨️', 80: '🌧️', 81: '🌧️', 82: '🌧️',
                85: '🌨️', 86: '🌨️',
                95: '⛈️', 96: '⛈️', 99: '⛈️'
            };
            
            const emoji = weatherEmoji[weatherCode] || '🌡️';
            const weatherEl = document.getElementById('weather');
            if (weatherEl) {
                weatherEl.textContent = `${emoji} ${temp}°C`;
            }
        } catch (error) {
            console.log('Weather fetch failed:', error);
        }
    }
    
    fetchWeather();

    // ==========================================================================
    // Font & Editing Controls
    // ==========================================================================
    
    const paper = document.querySelector('.paper');
    let currentFontFamily = "'Source Serif 4', serif";
    let currentFontSize = 11;
    let currentColor = '#1A1A1A';
    
    // Font Dropdown
    const fontDropdown = document.getElementById('font-dropdown');
    const fontMenu = document.getElementById('font-menu');
    const currentFontEl = document.getElementById('current-font');
    
    if (fontDropdown) {
        fontDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            fontMenu.classList.toggle('open');
        });
        
        fontMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                currentFontFamily = item.dataset.font;
                currentFontEl.textContent = item.textContent;
                applyFontFamily();
                fontMenu.classList.remove('open');
            });
        });
    }
    
    // Size Dropdown
    const sizeDropdown = document.getElementById('size-dropdown');
    const sizeMenu = document.getElementById('size-menu');
    const currentSizeEl = document.getElementById('current-size');
    
    // Font Size Buttons
    const increaseBtn = document.getElementById('increase-font');
    const decreaseBtn = document.getElementById('decrease-font');
    const MIN_FONT_SIZE = 9;
    const MAX_FONT_SIZE = 18;
    
    function updateFontSizeButtons() {
        if (increaseBtn) {
            increaseBtn.disabled = currentFontSize >= MAX_FONT_SIZE;
        }
        if (decreaseBtn) {
            decreaseBtn.disabled = currentFontSize <= MIN_FONT_SIZE;
        }
    }
    
    // Initialize button states
    updateFontSizeButtons();
    
    if (sizeDropdown) {
        sizeDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            sizeMenu.classList.toggle('open');
        });
        
        sizeMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                currentFontSize = parseInt(item.dataset.size);
                currentSizeEl.textContent = currentFontSize;
                applyFontSize();
                updateFontSizeButtons();
                sizeMenu.classList.remove('open');
            });
        });
    }
    
    increaseBtn?.addEventListener('click', () => {
        if (currentFontSize < MAX_FONT_SIZE) {
            currentFontSize += 1;
            currentSizeEl.textContent = currentFontSize;
            applyFontSize();
            updateFontSizeButtons();
        }
    });
    
    decreaseBtn?.addEventListener('click', () => {
        if (currentFontSize > MIN_FONT_SIZE) {
            currentFontSize -= 1;
            currentSizeEl.textContent = currentFontSize;
            applyFontSize();
            updateFontSizeButtons();
        }
    });
    
    // Color Dropdown
    const colorDropdown = document.getElementById('color-dropdown');
    const colorMenu = document.getElementById('color-menu');
    const currentColorBar = document.getElementById('current-color-bar');
    
    if (colorDropdown) {
        colorDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            colorMenu.classList.toggle('open');
        });
        
        colorMenu.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                e.stopPropagation();
                currentColor = swatch.dataset.color;
                currentColorBar.style.background = currentColor;
                applyColor();
                colorMenu.classList.remove('open');
            });
        });
    }
    
    // Apply Functions
    function applyFontFamily() {
        if (paper) {
            // Apply font to paper and ALL child elements to override CSS specificity
            paper.style.fontFamily = currentFontFamily;
            
            // Override all elements that have explicit font-family in CSS
            paper.querySelectorAll('*').forEach(el => {
                el.style.fontFamily = currentFontFamily;
            });
        }
    }
    
    function applyFontSize() {
        if (paper) {
            // Calculate scale factor based on default size of 11
            const scaleFactor = currentFontSize / 11;
            
            // Apply scale using CSS transform for better reflow
            paper.style.setProperty('--font-scale', scaleFactor);
            
            // Scale the paper content proportionally
            paper.style.fontSize = `${11 * scaleFactor}px`;
            
            // Scale layout elements (sidebar, gaps, borders)
            paper.querySelectorAll('.resume-layout').forEach(el => {
                el.style.gap = `${40 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-sidebar').forEach(el => {
                el.style.width = `${160 * scaleFactor}px`;
                el.style.paddingRight = `${24 * scaleFactor}px`;
                el.style.borderRightWidth = `${1 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-main').forEach(el => {
                el.style.gap = `${28 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-section').forEach(el => {
                el.style.gap = `${12 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-sidebar__section').forEach(el => {
                el.style.marginBottom = `${16 * scaleFactor}px`;
            });
            
            // Update specific elements with their scaled sizes
            paper.querySelectorAll('.resume-sidebar__name').forEach(el => {
                el.style.fontSize = `${36 * scaleFactor}px`;
                el.style.lineHeight = '1.1';
                el.style.marginBottom = `${32 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-sidebar__label').forEach(el => {
                el.style.fontSize = `${10 * scaleFactor}px`;
                el.style.marginBottom = `${4 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-sidebar__text').forEach(el => {
                el.style.fontSize = `${11 * scaleFactor}px`;
            });
            paper.querySelectorAll('.resume-section__title').forEach(el => {
                el.style.fontSize = `${18 * scaleFactor}px`;
                el.style.paddingBottom = `${6 * scaleFactor}px`;
                el.style.borderBottomWidth = `${1 * scaleFactor}px`;
            });
            paper.querySelectorAll('.experience-item__company, .education-item__school').forEach(el => {
                el.style.fontSize = `${13 * scaleFactor}px`;
            });
            paper.querySelectorAll('.experience-item__meta, .education-item__degree').forEach(el => {
                el.style.fontSize = `${11 * scaleFactor}px`;
            });
            paper.querySelectorAll('.experience-item__description, .skills-list--bullets li').forEach(el => {
                el.style.fontSize = `${11 * scaleFactor}px`;
            });
            paper.querySelectorAll('.experience-item, .education-item').forEach(el => {
                el.style.marginBottom = `${16 * scaleFactor}px`;
            });
        }
    }
    
    function applyColor() {
        if (paper) {
            // Apply color to paper and ALL child text elements
            paper.style.color = currentColor;
            
            // Override all text elements
            paper.querySelectorAll('*').forEach(el => {
                el.style.color = currentColor;
            });
        }
    }
    
    // Close dropdowns when clicking outside
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('open');
        });
    }
    
    document.addEventListener('click', () => {
        closeAllDropdowns();
    });

    // ==========================================================================
    // Initialize
    // ==========================================================================
    
    console.log('Word UI initialized');
    
})();
