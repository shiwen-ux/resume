/* ==========================================================================
   Word Web UI - JavaScript Module
   
   This file handles all interactive functionality for the Word-style UI.
   ========================================================================== */

(function() {
    'use strict';

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
    
    const zoomValue = document.querySelector('.zoom-value');
    const zoomSlider = document.querySelector('.zoom-slider');
    const zoomThumb = document.querySelector('.zoom-slider__thumb');
    const zoomTrack = document.querySelector('.zoom-slider__track');
    let currentZoom = 100;
    
    function updateZoom(value) {
        currentZoom = Math.max(50, Math.min(200, value));
        zoomValue.textContent = `${currentZoom}%`;
        
        const percentage = (currentZoom - 50) / 150 * 100;
        zoomThumb.style.left = `${percentage}%`;
        zoomTrack.style.width = `${percentage}%`;
        
        // Apply zoom to paper
        const paper = document.querySelector('.paper');
        if (paper) {
            paper.style.transform = `scale(${currentZoom / 100})`;
            paper.style.transformOrigin = 'top center';
        }
    }
    
    document.querySelectorAll('.zoom-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.textContent.trim();
            if (text === '−') {
                updateZoom(currentZoom - 10);
            } else if (text === '+') {
                updateZoom(currentZoom + 10);
            } else if (text.includes('Fit')) {
                updateZoom(100);
            }
        });
    });

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
                applyFont();
                fontMenu.classList.remove('open');
            });
        });
    }
    
    // Size Dropdown
    const sizeDropdown = document.getElementById('size-dropdown');
    const sizeMenu = document.getElementById('size-menu');
    const currentSizeEl = document.getElementById('current-size');
    
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
                applyFont();
                sizeMenu.classList.remove('open');
            });
        });
    }
    
    // Font Size Buttons
    document.getElementById('increase-font')?.addEventListener('click', () => {
        if (currentFontSize < 72) {
            currentFontSize += 1;
            currentSizeEl.textContent = currentFontSize;
            applyFont();
        }
    });
    
    document.getElementById('decrease-font')?.addEventListener('click', () => {
        if (currentFontSize > 6) {
            currentFontSize -= 1;
            currentSizeEl.textContent = currentFontSize;
            applyFont();
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
    function applyFont() {
        if (paper) {
            // Apply font to paper and ALL child elements to override CSS specificity
            paper.style.fontFamily = currentFontFamily;
            
            // Override all elements that have explicit font-family in CSS
            paper.querySelectorAll('*').forEach(el => {
                el.style.fontFamily = currentFontFamily;
            });
            
            // Scale all text proportionally based on base size
            const baseFontSize = currentFontSize;
            
            // Set base font size on paper
            paper.style.fontSize = `${baseFontSize}pt`;
            
            // Apply font size to ALL elements first (base size)
            paper.querySelectorAll('*').forEach(el => {
                el.style.fontSize = `${baseFontSize}pt`;
                el.style.lineHeight = '1.5';
            });
            
            // Then scale specific elements proportionally
            paper.querySelectorAll('.resume-header__name').forEach(el => {
                el.style.fontSize = `${baseFontSize * 2.2}pt`;
            });
            paper.querySelectorAll('.resume-header__role').forEach(el => {
                el.style.fontSize = `${baseFontSize * 1.1}pt`;
            });
            paper.querySelectorAll('.resume-section__title').forEach(el => {
                el.style.fontSize = `${baseFontSize * 0.85}pt`;
                el.style.letterSpacing = '1px';
            });
            paper.querySelectorAll('.experience-item__company, .education-item__degree').forEach(el => {
                el.style.fontSize = `${baseFontSize * 1.1}pt`;
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
