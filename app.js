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
        retro: { icon: '📠', label: 'Retro' }
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
        localStorage.setItem('hasChangedTheme', 'true');
        
        // Handle pixelation for retro mode
        if (theme === 'retro') {
            pixelateAvatars();
            pixelateLogo();
        } else {
            restoreAvatars();
        }
    }
    
    // Pixelate avatars for retro mode
    function pixelateAvatars() {
        const avatars = document.querySelectorAll('.user-avatar, .comment-card__avatar');
        avatars.forEach(avatar => {
            if (avatar.dataset.originalSrc) return; // Already pixelated
            
            const img = avatar;
            const size = avatar.classList.contains('user-avatar') ? 32 : 24;
            const pixelSize = 2; // Size of each "pixel" block (smaller = less pixelated)
            
            // Store original src
            img.dataset.originalSrc = img.src;
            
            // Create canvas for pixelation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            tempImg.onload = function() {
                // First, draw at tiny size
                const w = size / pixelSize;
                const h = size / pixelSize;
                canvas.width = size;
                canvas.height = size;
                
                // Disable smoothing
                ctx.imageSmoothingEnabled = false;
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                
                // Draw small then scale up for pixelation
                ctx.drawImage(tempImg, 0, 0, w, h);
                ctx.drawImage(canvas, 0, 0, w, h, 0, 0, size, size);
                
                // Apply to image
                img.src = canvas.toDataURL();
            };
            tempImg.src = img.src;
        });
    }
    
    // Restore original avatars
    function restoreAvatars() {
        const avatars = document.querySelectorAll('.user-avatar, .comment-card__avatar');
        avatars.forEach(avatar => {
            if (avatar.dataset.originalSrc) {
                avatar.src = avatar.dataset.originalSrc;
                delete avatar.dataset.originalSrc;
            }
        });
        
        // Restore logo
        const logo = document.querySelector('.word-logo');
        if (logo && logo.dataset.originalContent) {
            logo.innerHTML = logo.dataset.originalContent;
            delete logo.dataset.originalContent;
        }
    }
    
    // Pixelate the Word logo for retro mode
    function pixelateLogo() {
        const logo = document.querySelector('.word-logo');
        if (!logo || logo.dataset.originalContent) return;
        
        // Store original content
        logo.dataset.originalContent = logo.innerHTML;
        
        const size = 28;
        const smallSize = 14; // Pixelation level
        
        // Create temp canvas to draw original
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = size;
        tempCanvas.height = size;
        
        // Create gradient background
        const gradient = tempCtx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#5B9BD5');
        gradient.addColorStop(1, '#2E75B6');
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, size, size);
        
        // Draw W
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.font = 'bold 16px Arial';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText('W', size / 2, size / 2 + 1);
        
        // Create small canvas for pixelation
        const smallCanvas = document.createElement('canvas');
        const smallCtx = smallCanvas.getContext('2d');
        smallCanvas.width = smallSize;
        smallCanvas.height = smallSize;
        
        // Draw small version
        smallCtx.drawImage(tempCanvas, 0, 0, smallSize, smallSize);
        
        // Create final canvas and scale up with no smoothing
        const finalCanvas = document.createElement('canvas');
        const finalCtx = finalCanvas.getContext('2d');
        finalCanvas.width = size;
        finalCanvas.height = size;
        
        finalCtx.imageSmoothingEnabled = false;
        finalCtx.mozImageSmoothingEnabled = false;
        finalCtx.webkitImageSmoothingEnabled = false;
        
        finalCtx.drawImage(smallCanvas, 0, 0, size, size);
        
        // Replace logo content with canvas image
        logo.innerHTML = '';
        const img = document.createElement('img');
        img.src = finalCanvas.toDataURL();
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.imageRendering = 'pixelated';
        logo.appendChild(img);
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Pixelate on load if retro
    if (savedTheme === 'retro') {
        window.addEventListener('load', () => {
            pixelateAvatars();
            pixelateLogo();
        });
    }
    
    // Show theme hint on every visit (except in retro mode)
    if (themeTrigger && savedTheme !== 'retro') {
        setTimeout(() => {
            showThemeHint();
        }, 1500);
    }
    
    function showThemeHint() {
        const hint = document.createElement('div');
        hint.className = 'theme-hint';
        hint.innerHTML = `
            <span class=\"theme-hint__text\">Try <strong class=\"theme-hint__link\">Retro</strong> mode!</span>
            <button class="theme-hint__close" aria-label="Dismiss">×</button>
        `;
        themeTrigger.parentElement.appendChild(hint);
        
        // Animate in
        requestAnimationFrame(() => {
            hint.classList.add('visible');
        });
        
        // Close button
        hint.querySelector('.theme-hint__close').addEventListener('click', (e) => {
            e.stopPropagation();
            dismissHint(hint);
        });
        
        // Click "Retro" text to switch to retro mode
        hint.querySelector('.theme-hint__link').addEventListener('click', (e) => {
            e.stopPropagation();
            setTheme('retro');
            dismissHint(hint);
        });
    }
    
    function dismissHint(hint) {
        if (hint && hint.parentElement) {
            hint.classList.remove('visible');
            setTimeout(() => hint.remove(), 300);
        }
    }
    
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
        if (zoomSlider) {
            zoomSlider.value = currentZoom;
            // Update slider fill color
            const percent = ((currentZoom - 50) / (200 - 50)) * 100;
            zoomSlider.style.background = `linear-gradient(to right, var(--color-accent) ${percent}%, var(--color-bg-hover) ${percent}%)`;
        }
        
        // Apply zoom to paper
        const paper = document.querySelector('.paper');
        const paperWrapper = document.querySelector('.paper-wrapper');
        if (paper) {
            const scale = currentZoom / 100;
            paper.style.transform = `scale(${scale})`;
            
            // Update wrapper dimensions to match scaled paper size for proper layout
            if (paperWrapper) {
                const scaledWidth = 612 * scale;
                const scaledHeight = 792 * scale;
                paperWrapper.style.width = `${scaledWidth}px`;
                paperWrapper.style.minHeight = `${scaledHeight}px`;
            }
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
    
    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.resume-section--interactive, .experience-item--interactive, .education-item--interactive, .comment-card, .comment-panel')) {
            interactiveItems.forEach(i => i.classList.remove('selected'));
            document.querySelectorAll('.comment-card').forEach(c => c.classList.remove('active'));
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
    // Comment System
    // ==========================================================================
    
    const commentsToggle = document.getElementById('comments-toggle');
    const commentPanel = document.getElementById('comment-panel');
    const closeComments = document.getElementById('close-comments');
    const commentCards = document.querySelectorAll('.comment-card');
    
    let commentsVisible = false;
    
    function toggleComments(show) {
        commentsVisible = show !== undefined ? show : !commentsVisible;
        
        if (commentsVisible) {
            commentPanel?.classList.add('visible');
            commentsToggle?.classList.add('active');
            document.body.classList.add('comments-visible');
        } else {
            commentPanel?.classList.remove('visible');
            commentsToggle?.classList.remove('active');
            document.body.classList.remove('comments-visible');
            // Deactivate all comments
            commentCards.forEach(card => card.classList.remove('active'));
            interactiveItems.forEach(item => item.classList.remove('selected'));
        }
    }
    
    // Toggle button click
    commentsToggle?.addEventListener('click', () => {
        toggleComments();
    });
    
    // Close button click
    closeComments?.addEventListener('click', () => {
        toggleComments(false);
    });
    
    // Comment card click - highlight corresponding resume item
    commentCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetId = card.dataset.target;
            
            // Deactivate all cards and items
            commentCards.forEach(c => c.classList.remove('active'));
            interactiveItems.forEach(item => item.classList.remove('selected'));
            
            // Activate clicked card
            card.classList.add('active');
            
            // Find and highlight corresponding resume item
            const targetItem = document.querySelector(`[data-section="${targetId}"]`);
            if (targetItem) {
                targetItem.classList.add('selected');
                targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
    
    // Update: When clicking resume item, also highlight corresponding comment
    interactiveItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove selected from all items
            interactiveItems.forEach(i => i.classList.remove('selected'));
            // Add selected to clicked item
            item.classList.add('selected');
            
            const sectionId = item.dataset.section;
            
            // Auto-open comments panel when selecting a section
            if (!commentsVisible) {
                toggleComments(true);
            }
            
            // Highlight the corresponding comment card
            if (sectionId) {
                commentCards.forEach(card => card.classList.remove('active'));
                const targetCard = document.querySelector(`.comment-card[data-target="${sectionId}"]`);
                if (targetCard) {
                    targetCard.classList.add('active');
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            // Trigger custom event for comment panel
            document.dispatchEvent(new CustomEvent('sectionSelected', { 
                detail: { sectionId } 
            }));
        });
    });
    
    // Keyboard shortcut: Cmd/Ctrl + Shift + C to toggle comments
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
            e.preventDefault();
            toggleComments();
        }
    });

    // ==========================================================================
    // Initialize
    // ==========================================================================
    
    console.log('Word UI initialized');

    // ==========================================================================
    // Language Toggle (EN / 中文)
    // ==========================================================================
    const langToggle = document.getElementById('lang-toggle');
    let isChinese = false;

    const translations = {
        // Sidebar
        '.resume-sidebar__name': '江\n诗雯',
        '[data-label="location"] .resume-sidebar__label': '所在地',
        '[data-label="email"] .resume-sidebar__label': '邮箱',
        '[data-label="linkedin"] .resume-sidebar__label': '领英',
        // Section titles
        '.resume-section__title:first-of-type': '工作经历',
    };

    const contentEN = {
        name: 'SHIWEN\nJIANG',
        location: 'location',
        email: 'email',
        linkedin: 'linkedin',
        experienceTitle: 'Experience',
        educationTitle: 'Education',
        microsoftMeta: 'Product Designer II | Apr. 2025 - Present',
        microsoftDesc1: 'Microsoft AI Foundry — 微软面向 AI 应用开发者的端到端平台，支持构建、定制和部署 AI 智能体与应用。',
        microsoftDesc2: '主导 Toolbox 从 0 到 1 的设计，帮助开发者发现、配置和管理用于构建 AI 智能体的 MCP 服务器与工具。',
        microsoftDesc3: '推动 NextGen 设计系统在 AI Foundry 的落地，建立贡献流程、无障碍标准和赋能计划，四个月内将组件使用量从 1 万次提升至超过 100 万次。',
        mathworksMeta: 'Product Designer | Jun. 2022 - Mar. 2025',
        mathworksDesc: '在统计与机器学习领域，从零到一设计并交付了机器学习流水线可视化图表。为 MathWorks Parula 设计系统制定了向导模式规范，惠及 20 余个团队。',
        cmuSchool: '卡内基梅隆大学',
        cmuDegree: '娱乐技术理学硕士',
        gatechSchool: '佐治亚理工学院',
        gatechDegree: '机械工程理学学士',
    };

    const contentZH = {
        experienceTitle: '工作经历',
        educationTitle: '教育背景',
        microsoftDesc1: 'Microsoft AI Foundry — 微软面向 AI 应用开发者的端到端平台，支持构建、定制和部署 AI 智能体与应用。',
        microsoftDesc2: '主导 Toolbox 从 0 到 1 的设计，帮助开发者发现、配置和管理用于构建 AI 智能体的 MCP 服务器与工具。',
        microsoftDesc3: '推动 NextGen 设计系统在 AI Foundry 的落地，建立贡献流程、无障碍标准和赋能计划，四个月内将组件使用量从 1 万次提升至超过 100 万次。',
        mathworksDesc: '在统计与机器学习领域，从零到一设计并交付了机器学习流水线可视化图表。为 MathWorks Parula 设计系统制定了向导模式规范，惠及 20 余个团队。',
        cmuSchool: '卡内基梅隆大学',
        cmuDegree: '娱乐技术理学硕士',
        gatechSchool: '佐治亚理工学院',
        gatechDegree: '机械工程理学学士',
    };

    function applyLanguage(zh) {
        const sectionTitles = document.querySelectorAll('.resume-section__title');
        const experienceDescs = document.querySelectorAll('[data-section="microsoft"] .experience-item__description');
        const mathworksDesc = document.querySelector('[data-section="mathworks"] .experience-item__description');
        const cmuSchool = document.querySelector('[data-section="cmu"] .education-item__school');
        const cmuDegree = document.querySelector('[data-section="cmu"] .education-item__degree');
        const gatechSchool = document.querySelector('[data-section="gatech"] .education-item__school');
        const gatechDegree = document.querySelector('[data-section="gatech"] .education-item__degree');
        const reviewTitle = document.querySelector('.review-pane-title');
        const commentTargetMicrosoft = document.getElementById('comment-target-microsoft');
        const commentContentMicrosoft = document.getElementById('comment-content-microsoft');
        const commentTargetMathworks = document.getElementById('comment-target-mathworks');
        const commentContentMathworks = document.getElementById('comment-content-mathworks');
        const commentTargetCmu = document.getElementById('comment-target-cmu');
        const commentContentCmu = document.getElementById('comment-content-cmu');
        const commentTargetGatech = document.getElementById('comment-target-gatech');
        const commentContentGatech = document.getElementById('comment-content-gatech');

        if (zh) {
            if (sectionTitles[0]) sectionTitles[0].textContent = '工作经历';
            if (sectionTitles[1]) sectionTitles[1].textContent = '教育背景';
            if (experienceDescs[0]) experienceDescs[0].textContent = contentZH.microsoftDesc1;
            if (experienceDescs[1]) experienceDescs[1].textContent = contentZH.microsoftDesc2;
            if (experienceDescs[2]) experienceDescs[2].textContent = contentZH.microsoftDesc3;
            if (mathworksDesc) mathworksDesc.textContent = contentZH.mathworksDesc;
            if (cmuSchool) cmuSchool.textContent = contentZH.cmuSchool;
            if (cmuDegree) cmuDegree.textContent = contentZH.cmuDegree;
            if (gatechSchool) gatechSchool.textContent = contentZH.gatechSchool;
            if (gatechDegree) gatechDegree.textContent = contentZH.gatechDegree;
            if (reviewTitle) reviewTitle.innerHTML = '<span class="icon">📝</span> 批注';
            if (commentTargetMicrosoft) commentTargetMicrosoft.textContent = '关于：微软';
            if (commentContentMicrosoft) commentContentMicrosoft.innerHTML = '🎉 我的功能即将在 <strong>Microsoft Build</strong> 上线——微软年度开发者大会！点击查看：<a href="https://build.microsoft.com/en-US/sessions/LIVE163?source=sessions" target="_blank">build.microsoft.com</a>';
            if (commentTargetMathworks) commentTargetMathworks.textContent = '关于：MathWorks';
            if (commentContentMathworks) commentContentMathworks.innerHTML = '<strong>主要成就：</strong><ul><li>从零到一完成 ML 流水线可视化设计并上线</li><li>制定向导模式规范，被 20 余个团队采用</li><li>指导 3 名初级设计师成长</li></ul>';
            if (commentTargetCmu) commentTargetCmu.textContent = '关于：卡内基梅隆';
            if (commentContentCmu) commentContentCmu.innerHTML = '<strong>小趣事：</strong>ETC 让我学会了将技术与叙事融合，打造有温度的体验。我的毕业项目是一个 VR 密室逃脱！';
            if (commentTargetGatech) commentTargetGatech.textContent = '关于：佐治亚理工';
            if (commentContentGatech) commentContentGatech.innerHTML = '<strong>意外转行：</strong>我最初学的是机械工程，却在一门人因工程课上爱上了设计——这是我做过最值得的选择！🚀';
            langToggle.classList.add('active');
            document.getElementById('lang-label').textContent = 'EN';
        } else {
            if (sectionTitles[0]) sectionTitles[0].textContent = 'Experience';
            if (sectionTitles[1]) sectionTitles[1].textContent = 'Education';
            if (experienceDescs[0]) experienceDescs[0].textContent = 'Microsoft AI Foundry — Microsoft\'s end-to-end platform for building, customizing, and deploying AI agents and applications.';
            if (experienceDescs[1]) experienceDescs[1].textContent = 'Drove 0→1 design of Toolbox, empowering developers to discover, configure, and manage MCP servers and tools for building AI agents.';
            if (experienceDescs[2]) experienceDescs[2].textContent = 'Spearheaded NextGen Design System adoption across AI Foundry — defining contribution workflows, accessibility standards, and enablement programs that scaled component usage from 10K to 1M+ insertions in four months.';
            if (mathworksDesc) mathworksDesc.textContent = 'As a designer in Statistics and Machine Learning area, designed and shipped an ML pipeline visualization plot from 0 to 1. Defined the standard of wizard pattern for MathWorks Parula Design system that benefits 20+ teams.';
            if (cmuSchool) cmuSchool.textContent = 'Carnegie Mellon University';
            if (cmuDegree) cmuDegree.textContent = 'M.S. Entertainment Technology';
            if (gatechSchool) gatechSchool.textContent = 'Georgia Institute of Technology';
            if (gatechDegree) gatechDegree.textContent = 'B.S. Mechanical Engineering';
            if (reviewTitle) reviewTitle.innerHTML = '<span class="icon">📝</span> Reviewing';
            if (commentTargetMicrosoft) commentTargetMicrosoft.textContent = 'Re: Microsoft';
            if (commentContentMicrosoft) commentContentMicrosoft.innerHTML = '🎉 My feature is going live at <strong>Microsoft Build</strong> — Microsoft\'s flagship developer conference! Watch the session here: <a href="https://build.microsoft.com/en-US/sessions/LIVE163?source=sessions" target="_blank">build.microsoft.com</a>';
            if (commentTargetMathworks) commentTargetMathworks.textContent = 'Re: MathWorks';
            if (commentContentMathworks) commentContentMathworks.innerHTML = '<strong>Key achievements:</strong><ul><li>Led ML pipeline visualization from concept to launch</li><li>Established wizard pattern standards adopted by 20+ teams</li><li>Mentored 3 junior designers</li></ul>';
            if (commentTargetCmu) commentTargetCmu.textContent = 'Re: Carnegie Mellon';
            if (commentContentCmu) commentContentCmu.innerHTML = '<strong>Fun fact:</strong> ETC taught me to build experiences that blend technology and storytelling. My capstone project was a VR escape room!';
            if (commentTargetGatech) commentTargetGatech.textContent = 'Re: Georgia Tech';
            if (commentContentGatech) commentContentGatech.innerHTML = '<strong>Plot twist:</strong> Started as a Mechanical Engineer but fell in love with design through a human factors course. Best career pivot ever! 🚀';
            langToggle.classList.remove('active');
            document.getElementById('lang-label').textContent = '中文';
        }
    }

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            isChinese = !isChinese;
            applyLanguage(isChinese);
        });
    }
    
})();
